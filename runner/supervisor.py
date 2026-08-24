#!/usr/bin/env python3
"""Trusted process supervisor for one disposable learner-code sandbox.

The learner never controls the command line. The Worker writes source and
stdin to fixed files, then invokes this program with one server-selected
language name. Kernel resource limits, output caps, workspace monitoring, and
network-denying seccomp rules are applied before the learner toolchain starts.
"""

from __future__ import annotations

import argparse
import ctypes
import errno
import json
import os
import pwd
import resource
import selectors
import shutil
import signal
import socket
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence


WORKSPACE = Path("/workspace")
LEARNER_USER = "cadet"
OUTPUT_LIMIT = 64_000
RUNTIME_WORKSPACE_LIMIT = 32 * 1024 * 1024
COMPILE_WORKSPACE_LIMIT = 128 * 1024 * 1024
RUNTIME_FILE_SIZE_LIMIT = RUNTIME_WORKSPACE_LIMIT
PROCESS_LIMIT = 32
COMPILE_PROCESS_LIMIT = 128
COMPILE_CPU_SECONDS = 4
RUN_CPU_SECONDS = 2
COMPILE_WALL_SECONDS = 8.0
RUN_WALL_SECONDS = 5.0

PR_SET_NO_NEW_PRIVS = 38
@dataclass(frozen=True)
class Toolchain:
    source_name: str
    compile_command: tuple[str, ...] | None
    run_command: tuple[str, ...]


TOOLCHAINS: dict[str, Toolchain] = {
    "python": Toolchain(
        source_name="mission.py",
        compile_command=None,
        run_command=("/usr/bin/python3", "-I", "-B", "mission.py"),
    ),
    "cpp": Toolchain(
        source_name="mission.cpp",
        compile_command=(
            "/usr/bin/g++",
            "-std=c++20",
            "-O0",
            "-pipe",
            "-Wall",
            "-Wextra",
            "-pedantic",
            "-o",
            "mission",
            "mission.cpp",
        ),
        run_command=("./mission",),
    ),
    "java": Toolchain(
        source_name="Main.java",
        compile_command=("/usr/bin/javac", "-encoding", "UTF-8", "Main.java"),
        run_command=(
            "/usr/bin/java",
            "-Xms16m",
            "-Xmx128m",
            "-XX:MaxMetaspaceSize=96m",
            "-Djava.io.tmpdir=/workspace",
            "-cp",
            ".",
            "Main",
        ),
    ),
    "csharp": Toolchain(
        source_name="Program.cs",
        compile_command=(
            "/usr/bin/dotnet",
            "/usr/lib/dotnet/sdk/8.0.130/Roslyn/bincore/csc.dll",
            "-nologo",
            "-noconfig",
            "-nostdlib+",
            "-langversion:12.0",
            "-nullable:enable",
            "-target:exe",
            "-out:out/Cadet.dll",
            "@/opt/runner/csharp/framework.rsp",
            "/opt/runner/csharp/GlobalUsings.cs",
            "Program.cs",
        ),
        run_command=("/usr/bin/dotnet", "out/Cadet.dll"),
    ),
}


def install_network_seccomp() -> None:
    """Deny socket syscalls in the child while allowing normal computation."""

    libc = ctypes.CDLL(None, use_errno=True)
    if libc.prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0:
        raise OSError(ctypes.get_errno(), "could not enable no-new-privileges")
    import seccomp  # type: ignore[import-not-found]

    syscall_filter = seccomp.SyscallFilter(defaction=seccomp.ALLOW)
    # Compilers and runtimes use local AF_UNIX sockets for private process
    # coordination. They are safe inside a one-use VM and must remain usable.
    # Denying every other socket family prevents the learner process from
    # creating an internet, packet, netlink, Bluetooth, or other network socket.
    syscall_filter.add_rule(
        seccomp.ERRNO(errno.EPERM),
        "socket",
        seccomp.Arg(0, seccomp.NE, socket.AF_UNIX),
    )
    syscall_filter.load()


def child_setup(
    cpu_seconds: int,
    process_limit: int,
    file_size_bytes: int | None,
    deny_network_syscalls: bool,
) -> None:
    """Apply hard limits, drop privileges, and install the network policy."""

    learner = pwd.getpwnam(LEARNER_USER)
    os.setgroups([])
    os.setgid(learner.pw_gid)
    os.setuid(learner.pw_uid)
    # Leave one second between the soft and hard CPU limits so Linux can
    # deliver SIGXCPU and the supervisor can explain the limit accurately.
    resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds + 1))
    resource.setrlimit(resource.RLIMIT_NPROC, (process_limit, process_limit))
    if file_size_bytes is not None:
        resource.setrlimit(resource.RLIMIT_FSIZE, (file_size_bytes, file_size_bytes))
    else:
        _soft_file_limit, hard_file_limit = resource.getrlimit(resource.RLIMIT_FSIZE)
        resource.setrlimit(resource.RLIMIT_FSIZE, (hard_file_limit, hard_file_limit))
    resource.setrlimit(resource.RLIMIT_NOFILE, (256, 256))
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    # Docker Desktop on Apple Silicon runs this amd64 image through QEMU, which
    # cannot load a nested seccomp filter. Production never sets this flag.
    if deny_network_syscalls and os.environ.get("SPP_LOCAL_QEMU") != "1":
        install_network_seccomp()


def workspace_allocated_bytes() -> int:
    """Count physical blocks, not sparse files' larger logical lengths."""

    total = 0
    learner_uid = pwd.getpwnam(LEARNER_USER).pw_uid
    for writable_root in (WORKSPACE, Path("/tmp")):
        for root, _directories, files in os.walk(writable_root):
            for file_name in files:
                try:
                    metadata = (Path(root) / file_name).stat()
                    if metadata.st_uid == learner_uid:
                        total += metadata.st_blocks * 512
                except FileNotFoundError:
                    continue
    return total


def process_tree(root_pid: int) -> set[int]:
    """Return the root process and every descendant visible in /proc."""

    parents: dict[int, int] = {}
    proc = Path("/proc")
    for entry in proc.iterdir():
        if not entry.name.isdigit():
            continue
        try:
            stat_parts = (entry / "stat").read_text(encoding="utf-8").split()
            if len(stat_parts) >= 4:
                parents[int(entry.name)] = int(stat_parts[3])
        except (FileNotFoundError, PermissionError, ProcessLookupError, ValueError):
            continue

    tree = {root_pid}
    changed = True
    while changed:
        changed = False
        for pid, parent_pid in parents.items():
            if parent_pid in tree and pid not in tree:
                tree.add(pid)
                changed = True
    return tree


def process_tree_rss_kib(root_pid: int) -> int:
    total = 0
    for pid in process_tree(root_pid):
        try:
            for line in (Path("/proc") / str(pid) / "status").read_text(encoding="utf-8").splitlines():
                if line.startswith("VmRSS:"):
                    total += int(line.split()[1])
                    break
        except (FileNotFoundError, PermissionError, ProcessLookupError, ValueError):
            continue
    return total


def terminate_tree(process: subprocess.Popen[bytes]) -> None:
    for pid in sorted(process_tree(process.pid), reverse=True):
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            continue


def minimal_environment(memory_bytes: int, set_runtime_heap: bool) -> dict[str, str]:
    environment = {
        "PATH": "/usr/bin:/bin",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "HOME": "/workspace",
        "TMPDIR": "/workspace",
        "PYTHONDONTWRITEBYTECODE": "1",
        "DOTNET_CLI_HOME": "/workspace",
        "DOTNET_NOLOGO": "1",
        "DOTNET_SKIP_FIRST_TIME_EXPERIENCE": "1",
        "DOTNET_CLI_TELEMETRY_OPTOUT": "1",
        "DOTNET_CLI_DO_NOT_USE_MSBUILD_SERVER": "1",
        # Disable the managed diagnostic IPC endpoint. Learner programs do not
        # need debugger/profiler attachment, and the endpoint is unnecessary
        # writable state in a one-use execution VM.
        "DOTNET_EnableDiagnostics": "0",
        "COMPlus_EnableDiagnostics": "0",
    }
    if set_runtime_heap:
        environment["COMPlus_GCHeapHardLimit"] = hex(memory_bytes)
    return environment


def run_bounded(
    command: Sequence[str],
    *,
    stdin: bytes,
    cpu_seconds: int,
    wall_seconds: float,
    memory_bytes: int,
    set_runtime_heap: bool,
    process_limit: int,
    writable_bytes: int,
    file_size_bytes: int | None,
    deny_network_syscalls: bool,
) -> dict[str, object]:
    started = time.monotonic()
    process = subprocess.Popen(
        list(command),
        cwd=WORKSPACE,
        env=minimal_environment(memory_bytes, set_runtime_heap),
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=lambda: child_setup(
            cpu_seconds,
            process_limit,
            file_size_bytes,
            deny_network_syscalls,
        ),
    )

    assert process.stdin is not None
    assert process.stdout is not None
    assert process.stderr is not None
    try:
        process.stdin.write(stdin)
    except BrokenPipeError:
        pass
    finally:
        try:
            process.stdin.close()
        except BrokenPipeError:
            pass

    selector = selectors.DefaultSelector()
    selector.register(process.stdout, selectors.EVENT_READ, "stdout")
    selector.register(process.stderr, selectors.EVENT_READ, "stderr")
    buffers: dict[str, bytearray] = {"stdout": bytearray(), "stderr": bytearray()}
    truncated = False
    limit: str | None = None

    while selector.get_map():
        elapsed = time.monotonic() - started
        if process.poll() is None:
            if elapsed > wall_seconds:
                limit = "wall_time"
                terminate_tree(process)
            elif process_tree_rss_kib(process.pid) > memory_bytes // 1024:
                limit = "memory"
                terminate_tree(process)
            elif workspace_allocated_bytes() > writable_bytes:
                limit = "writable_storage"
                terminate_tree(process)

        for key, _mask in selector.select(timeout=0.02):
            try:
                chunk = os.read(key.fileobj.fileno(), 4096)
            except OSError:
                chunk = b""
            if not chunk:
                selector.unregister(key.fileobj)
                continue

            stream = str(key.data)
            remaining = OUTPUT_LIMIT - len(buffers[stream])
            if remaining > 0:
                buffers[stream].extend(chunk[:remaining])
            if len(chunk) > remaining:
                truncated = True
                limit = limit or f"{stream}_output"
                terminate_tree(process)

    try:
        exit_code = process.wait(timeout=0.5)
    except subprocess.TimeoutExpired:
        terminate_tree(process)
        exit_code = process.wait(timeout=0.5)

    if exit_code < 0 and -exit_code == signal.SIGXCPU:
        limit = limit or "cpu_time"
    elif exit_code < 0 and -exit_code == signal.SIGXFSZ:
        limit = limit or "writable_storage"

    return {
        "exit_code": exit_code,
        "stdout": buffers["stdout"].decode("utf-8", errors="replace"),
        "stderr": buffers["stderr"].decode("utf-8", errors="replace"),
        "duration_ms": round((time.monotonic() - started) * 1000),
        "truncated": truncated,
        "limit": limit,
        "allocated_bytes": workspace_allocated_bytes(),
    }


def prepare_workspace(language: str, toolchain: Toolchain) -> bytes:
    source_path = WORKSPACE / "source.txt"
    stdin_path = WORKSPACE / "stdin.txt"
    if not source_path.is_file():
        raise RuntimeError("source file is missing")

    source_target = WORKSPACE / toolchain.source_name
    if source_target != source_path:
        source_path.replace(source_target)

    if language == "csharp":
        output_directory = WORKSPACE / "out"
        output_directory.mkdir()
        shutil.copy2(
            "/opt/runner/csharp/Cadet.runtimeconfig.json",
            output_directory / "Cadet.runtimeconfig.json",
        )

    stdin = stdin_path.read_bytes() if stdin_path.exists() else b""
    learner = pwd.getpwnam(LEARNER_USER)
    for root, directories, files in os.walk(WORKSPACE):
        os.chown(root, learner.pw_uid, learner.pw_gid)
        os.chmod(root, 0o700)
        for name in directories:
            os.chown(Path(root) / name, learner.pw_uid, learner.pw_gid)
        for name in files:
            path = Path(root) / name
            os.chown(path, learner.pw_uid, learner.pw_gid)
            os.chmod(path, 0o600)
    return stdin


def execute(language: str) -> dict[str, object]:
    toolchain = TOOLCHAINS[language]
    stdin = prepare_workspace(language, toolchain)
    total_started = time.monotonic()

    if toolchain.compile_command:
        compile_result = run_bounded(
            toolchain.compile_command,
            stdin=b"",
            cpu_seconds=COMPILE_CPU_SECONDS,
            wall_seconds=COMPILE_WALL_SECONDS,
            memory_bytes=768 * 1024 * 1024,
            set_runtime_heap=False,
            process_limit=COMPILE_PROCESS_LIMIT,
            writable_bytes=COMPILE_WORKSPACE_LIMIT,
            # Some managed compilers create very large sparse files whose
            # logical length is unrelated to the physical storage they use.
            # The allocated-block monitor enforces the compile storage quota.
            file_size_bytes=None,
            # The trusted compiler remains inside a VM with internet disabled.
            # Learner runtime receives an additional syscall-level restriction.
            deny_network_syscalls=False,
        )
        if compile_result["limit"]:
            return {
                "outcome": "limit_exceeded",
                "phase": "compile",
                **compile_result,
                "duration_ms": round((time.monotonic() - total_started) * 1000),
            }
        if compile_result["exit_code"] != 0:
            if not compile_result["stderr"] and compile_result["stdout"]:
                compile_result["stderr"] = compile_result["stdout"]
                compile_result["stdout"] = ""
            return {
                "outcome": "compile_error",
                "phase": "compile",
                **compile_result,
                "duration_ms": round((time.monotonic() - total_started) * 1000),
            }

    run_result = run_bounded(
        toolchain.run_command,
        stdin=stdin,
        cpu_seconds=RUN_CPU_SECONDS,
        wall_seconds=RUN_WALL_SECONDS,
        memory_bytes=256 * 1024 * 1024,
        set_runtime_heap=True,
        process_limit=PROCESS_LIMIT,
        writable_bytes=RUNTIME_WORKSPACE_LIMIT,
        # CoreCLR creates a very large sparse logical file during startup in
        # Cloudflare's Firecracker environment. C# therefore relies on the
        # physical-block monitor rather than RLIMIT_FSIZE. That monitor still
        # stops all learner-owned files at the same 32 MiB allocation budget.
        file_size_bytes=None if language == "csharp" else RUNTIME_FILE_SIZE_LIMIT,
        deny_network_syscalls=True,
    )
    if run_result["limit"]:
        outcome = "limit_exceeded"
    elif run_result["exit_code"] == 0:
        outcome = "completed"
    else:
        outcome = "runtime_error"

    return {
        "outcome": outcome,
        "phase": "runtime",
        **run_result,
        "duration_ms": round((time.monotonic() - total_started) * 1000),
    }


def main() -> int:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("language", choices=sorted(TOOLCHAINS))
    args = parser.parse_args()

    try:
        result = execute(args.language)
    except Exception as error:
        result = {
            "outcome": "system_error",
            "stdout": "",
            "stderr": "",
            "exit_code": None,
            "duration_ms": 0,
            "truncated": False,
            "limit": None,
            "internal_error": type(error).__name__,
        }

    sys.stdout.write(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
