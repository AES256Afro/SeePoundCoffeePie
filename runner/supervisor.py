#!/usr/bin/env python3
"""Trusted process supervisor for one disposable learner-code sandbox.

The learner never controls the command line. The Worker writes source and
stdin to fixed files, then invokes this program with one server-selected
language name. Kernel resource limits, output caps, workspace monitoring, and
network-denying seccomp rules are applied before the learner toolchain starts.
"""

from __future__ import annotations

import argparse
import ast
import ctypes
import errno
import json
import os
import pwd
import re
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

PYTHON_ANALYSIS_VERSION = 1
PYTHON_ANALYSIS_SOURCE_LIMIT = 64 * 1024
PYTHON_ANALYSIS_IDENTIFIER_LIMIT = 128
PYTHON_ANALYSIS_IDENTIFIER_BUDGET = 4096
PYTHON_ANALYSIS_ASSIGNMENT_LIMIT = 64
PYTHON_ANALYSIS_FSTRING_LIMIT = 32
PYTHON_ANALYSIS_FSTRING_FIELD_LIMIT = 16
PYTHON_ANALYSIS_INTEGER_LIMIT = (1 << 53) - 1
PYTHON_RESERVED_NAMES = frozenset({"input", "int", "print"})

CPP_ANALYSIS_VERSION = 1
CPP_ANALYSIS_SOURCE_LIMIT = 64 * 1024
CPP_ANALYSIS_OUTPUT_LIMIT = 512 * 1024
CPP_ANALYSIS_IDENTIFIER_LIMIT = 128
CPP_ANALYSIS_IDENTIFIER_BUDGET = 4096
CPP_ANALYSIS_DECLARATION_LIMIT = 32
CPP_ANALYSIS_INPUT_LIMIT = 16
CPP_ANALYSIS_COUT_LIMIT = 16
CPP_ANALYSIS_COUT_FIELD_LIMIT = 16
CPP_ANALYSIS_AST_OBJECT_LIMIT = 32
CPP_ANALYSIS_AST_NODE_LIMIT = 4096
CPP_ANALYSIS_AST_DEPTH_LIMIT = 128
CPP_ANALYSIS_INTEGER_LIMIT = (1 << 53) - 1
CPP_ANALYSIS_ALLOWED_HEADERS = ("iostream", "string")
CPP_ANALYSIS_IDENTIFIER = rb"[A-Za-z_][A-Za-z0-9_]*"
CPP_ANALYSIS_ALLOWED_COUT_NODES = frozenset({
    "CXXOperatorCallExpr",
    "DeclRefExpr",
    "ImplicitCastExpr",
    "StringLiteral",
})
CPP_ANALYSIS_CLANG_COMMAND = (
    "/usr/bin/clang++-14",
    "-std=c++20",
    "-fsyntax-only",
    "-fno-color-diagnostics",
    "-Xclang",
    "-ast-dump=json",
    "-Xclang",
    "-ast-dump-filter=main",
    "mission.cpp",
)

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


def failed_python_analysis(*, parsed: bool = False) -> dict[str, object]:
    """Return a stable analysis value that cannot satisfy a trusted check."""

    return {
        "version": PYTHON_ANALYSIS_VERSION,
        "parsed": parsed,
        "straight_line": False,
        "assignments": [],
        "print_fstrings": [],
    }


def analyze_python_source(source: str | bytes) -> dict[str, object]:
    """Describe a small, trusted subset of direct top-level Python code.

    This is deliberately not a general-purpose Python normalizer. Any syntax or
    expression outside the beginner project's straight-line grammar makes the
    result fail closed. Facts remain useful to the Worker for exact counting,
    including repeated assignments, but are never an authorization by
    themselves.
    """

    try:
        source_size = len(source if isinstance(source, bytes) else source.encode("utf-8"))
    except UnicodeEncodeError:
        return failed_python_analysis()
    if source_size > PYTHON_ANALYSIS_SOURCE_LIMIT:
        return failed_python_analysis()

    try:
        module = ast.parse(source, filename="mission.py", mode="exec")
    except (MemoryError, RecursionError, SyntaxError, UnicodeDecodeError, ValueError):
        return failed_python_analysis()

    assignments: list[dict[str, object]] = []
    print_fstrings: list[dict[str, object]] = []
    occurrences: dict[str, int] = {}
    straight_line = True
    identifier_budget = 0

    def normalized_identifier(name: str) -> str | None:
        nonlocal identifier_budget, straight_line
        if len(name) > PYTHON_ANALYSIS_IDENTIFIER_LIMIT:
            straight_line = False
            return None
        identifier_budget += len(name)
        if identifier_budget > PYTHON_ANALYSIS_IDENTIFIER_BUDGET:
            straight_line = False
            return None
        return name

    def expression_fact(expression: ast.expr) -> tuple[dict[str, object], bool]:
        if isinstance(expression, ast.Constant):
            # bool is an int subclass in Python, so require the exact type.
            if type(expression.value) is int and abs(expression.value) <= PYTHON_ANALYSIS_INTEGER_LIMIT:
                return {"kind": "integer", "value": expression.value}, True
            if type(expression.value) is str:
                return {"kind": "string"}, True
            return {"kind": "unsupported"}, False

        if isinstance(expression, ast.Name):
            name = normalized_identifier(expression.id)
            if name is not None:
                return {"kind": "name", "name": name}, True
            return {"kind": "unsupported"}, False

        if isinstance(expression, ast.Call) and isinstance(expression.func, ast.Name):
            if expression.func.id == "input":
                valid_prompt = (
                    not expression.keywords
                    and len(expression.args) <= 1
                    and (
                        not expression.args
                        or (
                            isinstance(expression.args[0], ast.Constant)
                            and type(expression.args[0].value) is str
                        )
                    )
                )
                return ({"kind": "input"}, True) if valid_prompt else ({"kind": "unsupported"}, False)

            if expression.func.id == "int":
                valid_name = (
                    not expression.keywords
                    and len(expression.args) == 1
                    and isinstance(expression.args[0], ast.Name)
                )
                if valid_name:
                    name = normalized_identifier(expression.args[0].id)
                    if name is not None:
                        return {"kind": "int_name", "name": name}, True
                return {"kind": "unsupported"}, False

        if (
            isinstance(expression, ast.BinOp)
            and isinstance(expression.op, ast.Mult)
            and isinstance(expression.left, ast.Name)
            and isinstance(expression.right, ast.Name)
        ):
            left = normalized_identifier(expression.left.id)
            right = normalized_identifier(expression.right.id)
            if left is not None and right is not None:
                return {"kind": "multiply_names", "names": sorted((left, right))}, True

        # This covers unknown calls, walrus expressions, comprehensions,
        # lambdas, conditional expressions, attributes, and nested arithmetic.
        return {"kind": "unsupported"}, False

    def fstring_fields(expression: ast.JoinedStr) -> list[str] | None:
        fields: list[str] = []
        for value in expression.values:
            if isinstance(value, ast.Constant) and type(value.value) is str:
                continue
            if not isinstance(value, ast.FormattedValue):
                return None
            if (
                value.conversion != -1
                or value.format_spec is not None
                or not isinstance(value.value, ast.Name)
            ):
                return None
            if len(fields) >= PYTHON_ANALYSIS_FSTRING_FIELD_LIMIT:
                return None
            name = normalized_identifier(value.value.id)
            if name is None:
                return None
            fields.append(name)
        return fields

    for statement in module.body:
        if isinstance(statement, ast.Assign):
            if len(statement.targets) != 1 or not isinstance(statement.targets[0], ast.Name):
                straight_line = False
                continue

            target = normalized_identifier(statement.targets[0].id)
            if target is None:
                continue
            occurrences[target] = occurrences.get(target, 0) + 1
            expression, supported = expression_fact(statement.value)
            if len(assignments) >= PYTHON_ANALYSIS_ASSIGNMENT_LIMIT:
                straight_line = False
                continue
            assignments.append({
                "target": target,
                "occurrence": occurrences[target],
                **expression,
            })
            if target in PYTHON_RESERVED_NAMES or not supported:
                straight_line = False
            continue

        if isinstance(statement, ast.Expr):
            # Ordinary string expressions, including a module docstring, are
            # inert and cannot create structural facts.
            if isinstance(statement.value, ast.Constant) and type(statement.value.value) is str:
                continue

            call = statement.value
            if not (
                isinstance(call, ast.Call)
                and isinstance(call.func, ast.Name)
                and call.func.id == "print"
                and not call.keywords
                and len(call.args) == 1
            ):
                straight_line = False
                continue

            argument = call.args[0]
            if isinstance(argument, ast.Constant) and type(argument.value) is str:
                continue
            if isinstance(argument, ast.JoinedStr):
                fields = fstring_fields(argument)
                if fields is not None and len(print_fstrings) < PYTHON_ANALYSIS_FSTRING_LIMIT:
                    print_fstrings.append({
                        "occurrence": len(print_fstrings) + 1,
                        "fields": fields,
                    })
                    continue
            straight_line = False
            continue

        # All control flow and declaration statements are forbidden here. This
        # includes if (regardless of spelling), raise/SystemExit paths, imports,
        # functions, classes, loops, try, with, match, and assertion shortcuts.
        straight_line = False

    return {
        "version": PYTHON_ANALYSIS_VERSION,
        "parsed": True,
        "straight_line": straight_line,
        "assignments": assignments,
        "print_fstrings": print_fstrings,
    }


def analyze_python_source_file() -> dict[str, object]:
    """Analyze the exact bytes that the Python runtime will execute."""

    try:
        source_bytes = (WORKSPACE / "source.txt").read_bytes()
        if len(source_bytes) > PYTHON_ANALYSIS_SOURCE_LIMIT:
            return failed_python_analysis()
        # ast.parse(bytes) uses Python's PEP 263 encoding detection, just like
        # executing mission.py. Passing decoded text here would let a coding
        # cookie make analysis and execution interpret different programs.
        return analyze_python_source(source_bytes)
    except OSError:
        return failed_python_analysis()


def failed_cpp_analysis(*, analyzed: bool = False, parsed: bool = False) -> dict[str, object]:
    """Return a bounded C++ analysis value that cannot satisfy a check."""

    return {
        "version": CPP_ANALYSIS_VERSION,
        "analyzed": analyzed,
        "parsed": parsed,
        "straight_line": False,
        "headers": [],
        "main_signature": False,
        "returns_zero": False,
        "declarations": [],
        "inputs": [],
        "cout_chains": [],
    }


def _cpp_lexical_view(source: bytes) -> bytes:
    """Blank comments and literal contents without changing byte offsets.

    This is not a C++ parser. Clang remains the authority for syntax and the
    AST. The view exists only to identify active preprocessor lines and code
    outside main without letting comments or raw strings manufacture either.
    """

    view = bytearray(source)
    length = len(source)
    index = 0

    def blank(start: int, end: int, *, keep_first: bool = False) -> None:
        for position in range(start, end):
            if source[position] in (10, 13):
                continue
            if keep_first and position == start:
                continue
            view[position] = 32

    while index < length:
        if source.startswith(b"//", index):
            end = source.find(b"\n", index + 2)
            if end < 0:
                end = length
            blank(index, end)
            index = end
            continue

        if source.startswith(b"/*", index):
            closing = source.find(b"*/", index + 2)
            end = length if closing < 0 else closing + 2
            blank(index, end)
            index = end
            continue

        if source.startswith(b'R"', index):
            open_parenthesis = source.find(b"(", index + 2, min(length, index + 19))
            if open_parenthesis >= 0:
                delimiter = source[index + 2:open_parenthesis]
                closing_marker = b")" + delimiter + b'"'
                closing = source.find(closing_marker, open_parenthesis + 1)
                end = length if closing < 0 else closing + len(closing_marker)
                blank(index, end, keep_first=True)
                index = end
                continue

        if source[index] in (34, 39):
            quote = source[index]
            end = index + 1
            while end < length:
                if source[end] == 92:
                    end = min(length, end + 2)
                    continue
                if source[end] == quote:
                    end += 1
                    break
                end += 1
            blank(index, end, keep_first=True)
            index = end
            continue

        index += 1

    return bytes(view)


def _cpp_source_policy(source: bytes) -> tuple[bytes, list[str]] | None:
    """Accept only the taught preprocessing and one unambiguous UTF-8 file."""

    if len(source) > CPP_ANALYSIS_SOURCE_LIMIT or b"\0" in source:
        return None
    try:
        source.decode("utf-8")
    except UnicodeDecodeError:
        return None
    # Translation-phase line splicing and legacy trigraph spellings make a
    # source-text envelope needlessly ambiguous. They are not part of this
    # beginner grammar, so reject them before asking Clang for facts.
    if b"\\\n" in source or b"\\\r" in source or b"??" in source:
        return None

    view = bytearray(_cpp_lexical_view(source))
    if re.search(rb"(?:%:%:|%:|<%|%>|<:|:>)", view):
        return None
    if re.search(rb"(?<![A-Za-z0-9_])(?:_Pragma|__pragma)(?![A-Za-z0-9_])", view):
        return None
    headers: list[str] = []
    offset = 0
    for line in bytes(view).splitlines(keepends=True):
        content = line.rstrip(b"\r\n")
        stripped = content.strip()
        if stripped.startswith(b"#"):
            match = re.fullmatch(rb"#\s*include\s*<(iostream|string)>\s*", stripped)
            if match is None:
                return None
            header = match.group(1).decode("ascii")
            headers.append(header)
            for position in range(offset, offset + len(content)):
                view[position] = 32
        offset += len(line)

    if sorted(headers) != sorted(CPP_ANALYSIS_ALLOWED_HEADERS):
        return None
    return bytes(view), headers


def _cpp_json_objects(raw: str) -> list[dict[str, object]] | None:
    if len(raw.encode("utf-8", errors="replace")) > CPP_ANALYSIS_OUTPUT_LIMIT:
        return None
    decoder = json.JSONDecoder()
    objects: list[dict[str, object]] = []
    index = 0
    try:
        while index < len(raw):
            while index < len(raw) and raw[index].isspace():
                index += 1
            if index >= len(raw):
                break
            value, index = decoder.raw_decode(raw, index)
            if not isinstance(value, dict):
                return None
            objects.append(value)
            if len(objects) > CPP_ANALYSIS_AST_OBJECT_LIMIT:
                return None
    except (MemoryError, RecursionError, UnicodeError, ValueError):
        return None
    return objects


def _cpp_ast_nodes(root: dict[str, object]) -> list[dict[str, object]] | None:
    nodes: list[dict[str, object]] = []
    stack: list[tuple[dict[str, object], int]] = [(root, 0)]
    while stack:
        node, depth = stack.pop()
        if depth > CPP_ANALYSIS_AST_DEPTH_LIMIT:
            return None
        nodes.append(node)
        if len(nodes) > CPP_ANALYSIS_AST_NODE_LIMIT:
            return None
        children = node.get("inner", [])
        if not isinstance(children, list):
            return None
        for child in reversed(children):
            if not isinstance(child, dict):
                return None
            stack.append((child, depth + 1))
    return nodes


def _cpp_direct_offset(location: object) -> tuple[int, int] | None:
    if not isinstance(location, dict):
        return None
    if "spellingLoc" in location or "expansionLoc" in location:
        return None
    offset = location.get("offset")
    token_length = location.get("tokLen")
    if not isinstance(offset, int) or not isinstance(token_length, int):
        return None
    if offset < 0 or token_length < 0:
        return None
    return offset, token_length


def _cpp_range_offsets(node: dict[str, object], source_size: int) -> tuple[int, int] | None:
    source_range = node.get("range")
    if not isinstance(source_range, dict):
        return None
    begin = _cpp_direct_offset(source_range.get("begin"))
    end = _cpp_direct_offset(source_range.get("end"))
    if begin is None or end is None:
        return None
    start = begin[0]
    stop = end[0] + end[1]
    if start < 0 or stop < start or stop > source_size or stop - start > CPP_ANALYSIS_SOURCE_LIMIT:
        return None
    return start, stop


def _cpp_fragment(source: bytes, node: dict[str, object]) -> bytes | None:
    offsets = _cpp_range_offsets(node, len(source))
    if offsets is None:
        return None
    return source[offsets[0]:offsets[1]]


def _cpp_referenced_variable_names(node: dict[str, object]) -> list[str] | None:
    nodes = _cpp_ast_nodes(node)
    if nodes is None:
        return None
    names: list[str] = []
    for current in nodes:
        if current.get("kind") != "DeclRefExpr":
            continue
        referenced = current.get("referencedDecl")
        if not isinstance(referenced, dict) or referenced.get("kind") != "VarDecl":
            continue
        name = referenced.get("name")
        if not isinstance(name, str):
            return None
        names.append(name)
    return names


def _cpp_supported_cout_ast(nodes: list[dict[str, object]]) -> bool:
    """Accept only literal and direct-variable insertion chains."""

    for node in nodes:
        if node.get("kind") not in CPP_ANALYSIS_ALLOWED_COUT_NODES:
            return False
        if node.get("kind") != "DeclRefExpr":
            continue
        referenced = node.get("referencedDecl")
        if not isinstance(referenced, dict):
            return False
        referenced_kind = referenced.get("kind")
        if referenced_kind == "VarDecl":
            continue
        if (
            referenced_kind in {"FunctionDecl", "CXXMethodDecl"}
            and referenced.get("name") == "operator<<"
        ):
            continue
        return False
    return True


def analyze_cpp_ast(source: bytes, raw_ast: str, policy: tuple[bytes, list[str]]) -> dict[str, object]:
    """Normalize Clang facts for the deliberately small Phase 4B grammar."""

    objects = _cpp_json_objects(raw_ast)
    if objects is None:
        return failed_cpp_analysis(analyzed=True)
    main_candidates = [
        value for value in objects
        if value.get("kind") == "FunctionDecl" and value.get("name") == "main"
    ]
    if len(main_candidates) != 1:
        return failed_cpp_analysis(analyzed=True, parsed=True)
    main = main_candidates[0]
    main_nodes = _cpp_ast_nodes(main)
    if main_nodes is None:
        return failed_cpp_analysis(analyzed=True)

    lexical_view, headers = policy
    straight_line = True
    identifier_budget = 0

    def normalized_identifier(value: object) -> str | None:
        nonlocal identifier_budget, straight_line
        if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
            straight_line = False
            return None
        if len(value) > CPP_ANALYSIS_IDENTIFIER_LIMIT:
            straight_line = False
            return None
        identifier_budget += len(value)
        if identifier_budget > CPP_ANALYSIS_IDENTIFIER_BUDGET:
            straight_line = False
            return None
        return value

    main_type = main.get("type")
    main_signature = isinstance(main_type, dict) and main_type.get("qualType") == "int ()"
    bodies = [node for node in main.get("inner", []) if isinstance(node, dict) and node.get("kind") == "CompoundStmt"]
    if len(bodies) != 1:
        return failed_cpp_analysis(analyzed=True, parsed=True)
    body = bodies[0]
    main_offsets = _cpp_range_offsets(main, len(source))
    body_offsets = _cpp_range_offsets(body, len(source))
    if main_offsets is None or body_offsets is None:
        return failed_cpp_analysis(analyzed=True, parsed=True)

    signature = source[main_offsets[0]:body_offsets[0]]
    if re.fullmatch(rb"\s*int\s+main\s*\(\s*\)\s*", signature) is None:
        main_signature = False
    if not main_signature:
        straight_line = False

    outside = lexical_view[:main_offsets[0]] + lexical_view[main_offsets[1]:]
    if outside.strip():
        straight_line = False

    declarations: list[dict[str, object]] = []
    declaration_occurrences: dict[str, int] = {}
    inputs: list[dict[str, object]] = []
    cout_chains: list[dict[str, object]] = []
    returns_zero = False
    return_indexes: list[int] = []
    statements = body.get("inner", [])
    if not isinstance(statements, list):
        return failed_cpp_analysis(analyzed=True)

    for statement_index, statement in enumerate(statements):
        if not isinstance(statement, dict):
            straight_line = False
            continue
        kind = statement.get("kind")
        fragment = _cpp_fragment(source, statement)
        if fragment is None:
            straight_line = False
            continue

        if kind == "DeclStmt":
            variables = [
                child for child in statement.get("inner", [])
                if isinstance(child, dict) and child.get("kind") == "VarDecl"
            ]
            if len(variables) != 1 or len(declarations) >= CPP_ANALYSIS_DECLARATION_LIMIT:
                straight_line = False
                continue
            variable = variables[0]
            target = normalized_identifier(variable.get("name"))
            variable_fragment = _cpp_fragment(source, variable)
            if target is None or variable_fragment is None:
                straight_line = False
                continue
            declaration_occurrences[target] = declaration_occurrences.get(target, 0) + 1
            base: dict[str, object] = {
                "target": target,
                "occurrence": declaration_occurrences[target],
                "statement": statement_index + 1,
            }
            variable_type = variable.get("type")
            qualified_type = variable_type.get("qualType") if isinstance(variable_type, dict) else None
            target_bytes = re.escape(target.encode("ascii"))
            children = variable.get("inner", [])
            fact: dict[str, object] = {**base, "kind": "unsupported"}
            supported = False

            integer_match = re.fullmatch(
                rb"\s*int\s+" + target_bytes + rb"\s*=\s*(0|[1-9][0-9]*)\s*",
                variable_fragment,
            )
            multiply_match = re.fullmatch(
                rb"\s*int\s+" + target_bytes
                + rb"\s*=\s*(" + CPP_ANALYSIS_IDENTIFIER + rb")\s*\*\s*("
                + CPP_ANALYSIS_IDENTIFIER + rb")\s*",
                variable_fragment,
            )
            string_match = re.fullmatch(
                rb"\s*std\s*::\s*string\s+" + target_bytes + rb"\s*",
                variable_fragment,
            )

            if qualified_type == "int" and isinstance(variable_type, dict) and "typeAliasDeclId" not in variable_type:
                variable_nodes = _cpp_ast_nodes(variable)
                if variable_nodes is None or any(
                    str(node.get("kind", "")).endswith("Attr") for node in variable_nodes
                ):
                    declarations.append(fact)
                    straight_line = False
                    continue
                if integer_match is not None:
                    value = int(integer_match.group(1))
                    literals = [node for node in variable_nodes if node.get("kind") == "IntegerLiteral"]
                    if (
                        value <= CPP_ANALYSIS_INTEGER_LIMIT
                        and len(literals) == 1
                        and literals[0].get("value") == str(value)
                    ):
                        fact = {**base, "kind": "integer", "value": value}
                        supported = True
                elif multiply_match is not None:
                    binary = [node for node in variable_nodes if node.get("kind") == "BinaryOperator"]
                    left = normalized_identifier(multiply_match.group(1).decode("ascii"))
                    right = normalized_identifier(multiply_match.group(2).decode("ascii"))
                    references = _cpp_referenced_variable_names(variable)
                    if (
                        left is not None
                        and right is not None
                        and len(binary) == 1
                        and binary[0].get("opcode") == "*"
                        and references == [left, right]
                    ):
                        fact = {**base, "kind": "multiply_names", "names": sorted((left, right))}
                        supported = True
            elif qualified_type == "std::string" and string_match is not None:
                variable_nodes = _cpp_ast_nodes(variable)
                string_literals = [] if variable_nodes is None else [
                    node for node in variable_nodes if node.get("kind") == "StringLiteral"
                ]
                attributes = [] if variable_nodes is None else [
                    node for node in variable_nodes if str(node.get("kind", "")).endswith("Attr")
                ]
                if variable_nodes is not None and not string_literals and not attributes:
                    fact = {**base, "kind": "string"}
                    supported = True

            declarations.append(fact)
            if not supported:
                straight_line = False
            continue

        if kind == "CallExpr":
            match = re.fullmatch(
                rb"\s*std\s*::\s*getline\s*\(\s*std\s*::\s*cin\s*,\s*("
                + CPP_ANALYSIS_IDENTIFIER + rb")\s*\)\s*",
                fragment,
            )
            references = _cpp_referenced_variable_names(statement)
            if match is None or references is None or len(inputs) >= CPP_ANALYSIS_INPUT_LIMIT:
                straight_line = False
                continue
            target = normalized_identifier(match.group(1).decode("ascii"))
            if target is None or references != ["cin", target]:
                straight_line = False
                continue
            inputs.append({
                "occurrence": len(inputs) + 1,
                "statement": statement_index + 1,
                "kind": "getline_cin",
                "target": target,
            })
            continue

        if kind == "CXXOperatorCallExpr":
            input_match = re.fullmatch(
                rb"\s*std\s*::\s*cin\s*>>\s*(" + CPP_ANALYSIS_IDENTIFIER + rb")\s*",
                fragment,
            )
            if input_match is not None:
                references = _cpp_referenced_variable_names(statement)
                target = normalized_identifier(input_match.group(1).decode("ascii"))
                if (
                    references is None
                    or target is None
                    or references != ["cin", target]
                    or len(inputs) >= CPP_ANALYSIS_INPUT_LIMIT
                ):
                    straight_line = False
                    continue
                inputs.append({
                    "occurrence": len(inputs) + 1,
                    "statement": statement_index + 1,
                    "kind": "cin_extract",
                    "target": target,
                })
                continue

            if re.match(rb"\s*std\s*::\s*cout\s*<<", fragment) is None:
                straight_line = False
                continue
            output_nodes = _cpp_ast_nodes(statement)
            references = _cpp_referenced_variable_names(statement)
            if (
                output_nodes is None
                or references is None
                or not _cpp_supported_cout_ast(output_nodes)
                or not references
                or references[0] != "cout"
                or len(cout_chains) >= CPP_ANALYSIS_COUT_LIMIT
            ):
                straight_line = False
                continue
            fields: list[str] = []
            for reference in references[1:]:
                field = normalized_identifier(reference)
                if field is None or len(fields) >= CPP_ANALYSIS_COUT_FIELD_LIMIT:
                    straight_line = False
                    fields = []
                    break
                fields.append(field)
            cout_chains.append({
                "occurrence": len(cout_chains) + 1,
                "statement": statement_index + 1,
                "fields": fields,
            })
            continue

        if kind == "ReturnStmt":
            return_indexes.append(statement_index)
            return_nodes = _cpp_ast_nodes(statement)
            literals = [] if return_nodes is None else [
                node for node in return_nodes if node.get("kind") == "IntegerLiteral"
            ]
            valid_return = (
                re.fullmatch(rb"\s*return\s+0\s*", fragment) is not None
                and len(literals) == 1
                and literals[0].get("value") == "0"
            )
            if valid_return and not returns_zero:
                returns_zero = True
            else:
                straight_line = False
            continue

        # Braces, conditionals, loops, switches, gotos, exceptions, lambdas,
        # local classes, aliases, and helper calls are outside this first
        # straight-line project grammar.
        straight_line = False

    if return_indexes != [len(statements) - 1] or not returns_zero:
        straight_line = False

    return {
        "version": CPP_ANALYSIS_VERSION,
        "analyzed": True,
        "parsed": True,
        "straight_line": straight_line,
        "headers": headers,
        "main_signature": main_signature,
        "returns_zero": returns_zero,
        "declarations": declarations,
        "inputs": inputs,
        "cout_chains": cout_chains,
    }


def analyze_cpp_source_file() -> dict[str, object]:
    """Run a bounded Clang parser over the exact file g++ will compile."""

    try:
        source = (WORKSPACE / "mission.cpp").read_bytes()
    except OSError:
        return failed_cpp_analysis(analyzed=True)
    policy = _cpp_source_policy(source)
    if policy is None:
        return failed_cpp_analysis(analyzed=True)

    analysis_run = run_bounded(
        CPP_ANALYSIS_CLANG_COMMAND,
        stdin=b"",
        cpu_seconds=COMPILE_CPU_SECONDS,
        wall_seconds=COMPILE_WALL_SECONDS,
        memory_bytes=768 * 1024 * 1024,
        set_runtime_heap=False,
        process_limit=COMPILE_PROCESS_LIMIT,
        writable_bytes=COMPILE_WORKSPACE_LIMIT,
        file_size_bytes=None,
        deny_network_syscalls=False,
        output_limit=CPP_ANALYSIS_OUTPUT_LIMIT,
    )
    if analysis_run["limit"] or analysis_run["exit_code"] != 0:
        return failed_cpp_analysis(analyzed=True)
    return analyze_cpp_ast(source, str(analysis_run["stdout"]), policy)


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


def clear_workspace(preserve_names: frozenset[str] = frozenset()) -> None:
    """Remove learner-owned artifacts without following learner symlinks."""

    for path in WORKSPACE.iterdir():
        if path.name in preserve_names:
            continue
        if path.is_dir() and not path.is_symlink():
            shutil.rmtree(path)
        else:
            path.unlink(missing_ok=True)


def clear_case_state(preserve_workspace_names: frozenset[str] = frozenset()) -> None:
    """Clear every writable path a prior learner case could use as memory."""

    clear_workspace(preserve_workspace_names)
    learner_uid = pwd.getpwnam(LEARNER_USER).pw_uid
    for path in Path("/tmp").iterdir():
        try:
            if path.lstat().st_uid != learner_uid:
                continue
            if path.is_dir() and not path.is_symlink():
                shutil.rmtree(path)
            else:
                path.unlink(missing_ok=True)
        except FileNotFoundError:
            continue


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
    output_limit: int = OUTPUT_LIMIT,
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
                key.fileobj.close()
                continue

            stream = str(key.data)
            remaining = output_limit - len(buffers[stream])
            if remaining > 0:
                buffers[stream].extend(chunk[:remaining])
            if len(chunk) > remaining:
                truncated = True
                limit = limit or f"{stream}_output"
                terminate_tree(process)

    selector.close()

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

    # Each coordinator case uses a fresh VM. Clear learner-owned paths here as
    # defense in depth before moving the trusted source and input into place.
    clear_case_state(frozenset({"source.txt", "stdin.txt"}))

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


def execute(
    language: str,
    *,
    analyze_cpp_project: bool = False,
) -> tuple[dict[str, object], dict[str, object] | None]:
    toolchain = TOOLCHAINS[language]
    stdin = prepare_workspace(language, toolchain)
    total_started = time.monotonic()
    cpp_analysis = None
    if language == "cpp":
        cpp_analysis = failed_cpp_analysis()
        if analyze_cpp_project:
            try:
                cpp_analysis = analyze_cpp_source_file()
            except Exception:
                cpp_analysis = failed_cpp_analysis(analyzed=True)

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
            }, cpp_analysis
        if compile_result["exit_code"] != 0:
            if not compile_result["stderr"] and compile_result["stdout"]:
                compile_result["stderr"] = compile_result["stdout"]
                compile_result["stdout"] = ""
            return {
                "outcome": "compile_error",
                "phase": "compile",
                **compile_result,
                "duration_ms": round((time.monotonic() - total_started) * 1000),
            }, cpp_analysis

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
    }, cpp_analysis


def main() -> int:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("language", choices=sorted(TOOLCHAINS))
    parser.add_argument("--project-analysis", action="store_true")
    args = parser.parse_args()
    if args.project_analysis and args.language != "cpp":
        parser.error("project analysis is available only for C++")
    python_analysis = None
    cpp_analysis = failed_cpp_analysis() if args.language == "cpp" else None
    if args.language == "python":
        try:
            python_analysis = analyze_python_source_file()
        except Exception:
            # Analysis is evidence for a trusted check, never a reason to make
            # learner execution less available. Unexpected analyzer failures
            # therefore return an explicit value that no check can accept.
            python_analysis = failed_python_analysis()

    try:
        result, cpp_analysis = execute(
            args.language,
            analyze_cpp_project=args.project_analysis,
        )
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
    finally:
        # Leave no learner-controlled path behind for a later protected case.
        # Cleanup failure is an infrastructure error because case isolation can
        # no longer be guaranteed inside this VM.
        try:
            clear_case_state()
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

    if python_analysis is not None:
        result["python_analysis"] = python_analysis
    if cpp_analysis is not None:
        result["cpp_analysis"] = cpp_analysis
    sys.stdout.write(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
