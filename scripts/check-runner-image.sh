#!/usr/bin/env bash
set -euo pipefail

image_prefix="${1:-spp-runner}"
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker build --platform linux/amd64 -t "$image_prefix-python:worker" -f "$project_dir/Dockerfile.runner.python" "$project_dir"
docker build --platform linux/amd64 -t "$image_prefix-cpp:worker" -f "$project_dir/Dockerfile.runner.cpp" "$project_dir"
docker build --platform linux/amd64 -t "$image_prefix-java:worker" -f "$project_dir/Dockerfile.runner.java" "$project_dir"
docker build --platform linux/amd64 -t "$image_prefix-csharp:worker" -f "$project_dir/Dockerfile.runner.csharp" "$project_dir"

run_fixture() {
  local language="$1"
  local fixture="$2"
  local expected_outcome="$3"
  local result

  result="$(docker run --rm \
    --platform linux/amd64 \
    --network none \
    --memory 1g \
    --pids-limit 256 \
    --entrypoint /bin/sh \
    -e SPP_LOCAL_QEMU=1 \
    -v "$project_dir/runner/fixtures/$fixture:/fixture/source.txt:ro" \
    "$image_prefix-$language:worker" \
    -c 'cp /fixture/source.txt /workspace/source.txt && : > /workspace/stdin.txt && exec /opt/runner/supervisor.py "$0"' \
    "$language")"

  RESULT="$result" EXPECTED_OUTCOME="$expected_outcome" FIXTURE="$fixture" node --input-type=module -e '
    const result = JSON.parse(process.env.RESULT)
    if (result.outcome !== process.env.EXPECTED_OUTCOME) {
      throw new Error(`${process.env.FIXTURE}: expected ${process.env.EXPECTED_OUTCOME}, received ${result.outcome}`)
    }
    if (typeof result.stdout !== "string" || typeof result.stderr !== "string") {
      throw new Error(`${process.env.FIXTURE}: missing bounded output fields`)
    }
    process.stdout.write(`pass ${process.env.FIXTURE}: ${result.outcome}${result.limit ? ` (${result.limit})` : ""}\n`)
  '
}

run_fixture python hello.python.txt completed
run_fixture cpp hello.cpp.txt completed
run_fixture java hello.java.txt completed
run_fixture csharp hello.csharp.txt completed
run_fixture cpp invalid.cpp.txt compile_error
run_fixture java invalid.java.txt compile_error
run_fixture csharp invalid.csharp.txt compile_error
run_fixture python loop.python.txt limit_exceeded
run_fixture python output.python.txt limit_exceeded
run_fixture python memory.python.txt limit_exceeded
run_fixture python disk.python.txt limit_exceeded
run_fixture python network.python.txt runtime_error

echo "Runner image checks passed. The network test used Docker --network none. Production seccomp is verified separately in Cloudflare staging."
