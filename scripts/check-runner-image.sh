#!/usr/bin/env bash
set -euo pipefail

image_prefix="${1:-spp-runner}"
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$project_dir/runner/test_supervisor_analysis.py"

docker build --platform linux/amd64 -t "$image_prefix-python:worker" -f "$project_dir/Dockerfile.runner.python" "$project_dir"
docker build --platform linux/amd64 -t "$image_prefix-cpp:worker" -f "$project_dir/Dockerfile.runner.cpp" "$project_dir"
docker run --rm \
  --platform linux/amd64 \
  --network none \
  --memory 1g \
  --pids-limit 256 \
  --entrypoint /usr/bin/python3 \
  -e PYTHONPATH=/opt/runner \
  -v "$project_dir/runner/test_supervisor_cpp_analysis.py:/fixture/test_supervisor_cpp_analysis.py:ro" \
  "$image_prefix-cpp:worker" \
  /fixture/test_supervisor_cpp_analysis.py
docker build --platform linux/amd64 -t "$image_prefix-java:worker" -f "$project_dir/Dockerfile.runner.java" "$project_dir"
docker run --rm \
  --platform linux/amd64 \
  --network none \
  --memory 1g \
  --pids-limit 256 \
  --entrypoint /usr/bin/python3 \
  -e PYTHONPATH=/opt/runner \
  -v "$project_dir/runner/test_supervisor_java_analysis.py:/fixture/test_supervisor_java_analysis.py:ro" \
  "$image_prefix-java:worker" \
  /fixture/test_supervisor_java_analysis.py
docker build --platform linux/amd64 -t "$image_prefix-csharp:worker" -f "$project_dir/Dockerfile.runner.csharp" "$project_dir"
docker run --rm \
  --platform linux/amd64 \
  --network none \
  --memory 1g \
  --pids-limit 256 \
  --entrypoint /usr/bin/python3 \
  -e PYTHONPATH=/opt/runner \
  -v "$project_dir/runner/test_supervisor_csharp_analysis.py:/fixture/test_supervisor_csharp_analysis.py:ro" \
  "$image_prefix-csharp:worker" \
  /fixture/test_supervisor_csharp_analysis.py

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

  RESULT="$result" EXPECTED_OUTCOME="$expected_outcome" FIXTURE="$fixture" LANGUAGE="$language" node --input-type=module -e '
    const result = JSON.parse(process.env.RESULT)
    if (result.outcome !== process.env.EXPECTED_OUTCOME) {
      throw new Error(`${process.env.FIXTURE}: expected ${process.env.EXPECTED_OUTCOME}, received ${result.outcome}`)
    }
    if (typeof result.stdout !== "string" || typeof result.stderr !== "string") {
      throw new Error(`${process.env.FIXTURE}: missing bounded output fields`)
    }
    if (process.env.LANGUAGE === "python") {
      const analysis = result.python_analysis
      if (!analysis || analysis.version !== 1 || analysis.parsed !== true || typeof analysis.straight_line !== "boolean") {
        throw new Error(`${process.env.FIXTURE}: missing trusted Python analysis`)
      }
      if (!Array.isArray(analysis.assignments) || !Array.isArray(analysis.print_fstrings)) {
        throw new Error(`${process.env.FIXTURE}: malformed trusted Python analysis facts`)
      }
    } else if ("python_analysis" in result) {
      throw new Error(`${process.env.FIXTURE}: non-Python result exposed Python analysis`)
    }
    if (process.env.LANGUAGE === "cpp") {
      const analysis = result.cpp_analysis
      if (
        !analysis ||
        analysis.version !== 1 ||
        analysis.analyzed !== false ||
        analysis.parsed !== false ||
        analysis.straight_line !== false ||
        analysis.main_signature !== false ||
        analysis.returns_zero !== false
      ) {
        throw new Error(`${process.env.FIXTURE}: malformed ordinary C++ analysis sentinel`)
      }
      if (
        !Array.isArray(analysis.headers) || analysis.headers.length !== 0 ||
        !Array.isArray(analysis.declarations) || analysis.declarations.length !== 0 ||
        !Array.isArray(analysis.inputs) || analysis.inputs.length !== 0 ||
        !Array.isArray(analysis.cout_chains) || analysis.cout_chains.length !== 0
      ) {
        throw new Error(`${process.env.FIXTURE}: ordinary C++ result exposed protected facts`)
      }
    } else if ("cpp_analysis" in result) {
      throw new Error(`${process.env.FIXTURE}: non-C++ result exposed C++ analysis`)
    }
    if (process.env.LANGUAGE === "java") {
      const analysis = result.java_analysis
      if (
        !analysis ||
        analysis.version !== 1 ||
        analysis.analyzed !== false ||
        analysis.parsed !== false ||
        analysis.straight_line !== false ||
        analysis.class_signature !== false
      ) {
        throw new Error(`${process.env.FIXTURE}: malformed ordinary Java analysis sentinel`)
      }
      const emptyFacts = [
        analysis.imports,
        analysis.main_methods,
        analysis.static_methods,
        analysis.scanner_declarations,
        analysis.arrays,
        analysis.inputs,
        analysis.writes,
        analysis.conditionals,
        analysis.foreach_loops,
        analysis.calls,
      ]
      if (emptyFacts.some((facts) => !Array.isArray(facts) || facts.length !== 0)) {
        throw new Error(`${process.env.FIXTURE}: ordinary Java result exposed protected facts`)
      }
    } else if ("java_analysis" in result) {
      throw new Error(`${process.env.FIXTURE}: non-Java result exposed Java analysis`)
    }
    if (process.env.LANGUAGE === "csharp") {
      const analysis = result.csharp_analysis
      if (
        !analysis ||
        analysis.version !== 1 ||
        analysis.analyzed !== false ||
        analysis.parsed !== false ||
        analysis.straight_line !== false
      ) {
        throw new Error(`${process.env.FIXTURE}: malformed ordinary C# analysis sentinel`)
      }
      const emptyFacts = [
        analysis.usings,
        analysis.local_functions,
        analysis.arrays,
        analysis.inputs,
        analysis.writes,
        analysis.conditionals,
        analysis.foreach_loops,
        analysis.calls,
      ]
      if (emptyFacts.some((facts) => !Array.isArray(facts) || facts.length !== 0)) {
        throw new Error(`${process.env.FIXTURE}: ordinary C# result exposed protected facts`)
      }
    } else if ("csharp_analysis" in result) {
      throw new Error(`${process.env.FIXTURE}: non-C# result exposed C# analysis`)
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

repeated_case_results="$(docker run --rm \
  --platform linux/amd64 \
  --network none \
  --memory 1g \
  --pids-limit 256 \
  --entrypoint /bin/sh \
  -e SPP_LOCAL_QEMU=1 \
  -v "$project_dir/runner/fixtures/repeated-case.python.txt:/fixture/source.txt:ro" \
  "$image_prefix-python:worker" \
  -c '
    cp /fixture/source.txt /workspace/source.txt
    printf "first\n" > /workspace/stdin.txt
    /opt/runner/supervisor.py python > /tmp/first-result.json
    cp /fixture/source.txt /workspace/source.txt
    printf "second\n" > /workspace/stdin.txt
    /opt/runner/supervisor.py python > /tmp/second-result.json
    cat /tmp/first-result.json
    printf "\n"
    cat /tmp/second-result.json
  ')"

RESULTS="$repeated_case_results" node --input-type=module -e '
  const results = process.env.RESULTS.trim().split("\n").map((line) => JSON.parse(line))
  const expected = ["first\nstate: clean\n", "second\nstate: clean\n"]
  if (results.length !== expected.length) throw new Error("repeated case check returned the wrong result count")
  for (const [index, result] of results.entries()) {
    if (result.outcome !== "completed" || result.stdout !== expected[index]) {
      throw new Error(`repeated case ${index + 1} retained writable state or returned the wrong output`)
    }
  }
  process.stdout.write("pass repeated protected cases: learner writable state cleared\n")
'

echo "Runner image checks passed. The network test used Docker --network none. Production seccomp is verified separately in Cloudflare staging."
