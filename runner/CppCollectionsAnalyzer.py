#!/usr/bin/env python3
"""Trusted Clang-backed analyzer for the private Workshop Stock Report.

The analyzer never executes learner code. It asks the pinned Clang front end
to parse the exact source file, then recognizes one deliberately narrow token
grammar. The JSON envelope is internal runner evidence, not a public result.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable


PROFILE = "cpp-collections-records-workshop-report-v1"
CLANG = "/usr/bin/clang++-14"
MAX_SOURCE_BYTES = 20_000
MAX_AST_BYTES = 1_000_000
MAX_AST_NODES = 2_048
MAX_AST_DEPTH = 96
CLANG_TIMEOUT_SECONDS = 4

FACTS = (
    "authored_frame",
    "part_record",
    "restock",
    "total_units",
    "low_stock",
    "supplied_harness",
)

_TOKEN = re.compile(
    r"""(?:
        //[^\n]*
      | /\*.*?\*/
      | \"(?:\\.|[^\"\\])*\"
      | '(?:\\.|[^'\\])*'
      | [A-Za-z_][A-Za-z_0-9]*
      | [0-9]+
      | ::|<<|==|&&|\|\||<=|>=|!=|\+\+|--|->
      | [#{}()\[\];,.<>&=*+\-/%!:?]
    )""",
    re.DOTALL | re.VERBOSE,
)


def empty_result(*, analyzed: bool, parsed: bool) -> dict[str, object]:
    return {
        "version": 1,
        "profile": PROFILE,
        "analyzed": analyzed,
        "parsed": parsed,
        **{fact: False for fact in FACTS},
    }


def tokenize(source: str) -> list[str] | None:
    """Return all non-comment C++ tokens, rejecting unrecognized bytes."""
    tokens: list[str] = []
    offset = 0
    for match in _TOKEN.finditer(source):
        if source[offset : match.start()].strip():
            return None
        token = match.group(0)
        offset = match.end()
        if token.startswith("//") or token.startswith("/*"):
            continue
        tokens.append(token)
    if source[offset:].strip():
        return None
    return tokens


def sequence(source: str) -> list[str]:
    result = tokenize(source)
    if result is None:
        raise ValueError("trusted token sequence is invalid")
    return result


HEADERS = sequence(
    """#include <iostream>
    #include <string>
    #include <vector>"""
)
PART = sequence("struct Part { std::string name; int quantity; };")
RESTOCK = sequence(
    """void restock(std::vector<Part>& parts, std::string name, int amount) {
    for (Part& part : parts) {
      if (part.name == name) { part.quantity = part.quantity + amount; }
    }
    }"""
)
TOTAL_UNITS = sequence(
    """int total_units(std::vector<Part> parts) {
    int total = 0;
    for (Part part : parts) { total = total + part.quantity; }
    return total;
    }"""
)
LOW_STOCK = sequence(
    """std::vector<std::string> low_stock(std::vector<Part> parts, int limit) {
    std::vector<std::string> names;
    for (Part part : parts) {
      if (part.quantity < limit) { names.push_back(part.name); }
    }
    return names;
    }"""
)
HARNESS = sequence(
    """int main() {
    std::vector<Part> parts = {
      {"bolts", 4}, {"seals", 2}, {"cables", 7}
    };
    restock(parts, "bolts", 3);
    restock(parts, "cables", 1);
    std::cout << "Parts: " << parts.size() << "\\n";
    std::cout << "Total units: " << total_units(parts) << "\\n";
    for (std::string name : low_stock(parts, 3)) {
      std::cout << "Low stock: " << name << "\\n";
    }
    return 0;
    }"""
)
AUTHORED = HEADERS + PART + RESTOCK + TOTAL_UNITS + LOW_STOCK + HARNESS


def contains_once(tokens: list[str], expected: list[str]) -> bool:
    if not expected or len(expected) > len(tokens):
        return False
    return sum(
        tokens[index : index + len(expected)] == expected
        for index in range(len(tokens) - len(expected) + 1)
    ) == 1


def ast_budget(value: object) -> tuple[int, int]:
    nodes = 0
    deepest = 0
    stack: list[tuple[object, int]] = [(value, 1)]
    while stack:
        current, depth = stack.pop()
        deepest = max(deepest, depth)
        if isinstance(current, dict):
            if "kind" in current:
                nodes += 1
            stack.extend((child, depth + 1) for child in current.values())
        elif isinstance(current, list):
            stack.extend((child, depth + 1) for child in current)
    return nodes, deepest


def walk(value: object) -> Iterable[dict[str, object]]:
    stack = [value]
    while stack:
        current = stack.pop()
        if isinstance(current, dict):
            yield current
            stack.extend(current.values())
        elif isinstance(current, list):
            stack.extend(current)


def parse_json_stream(raw: bytes) -> list[object] | None:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return None
    decoder = json.JSONDecoder()
    offset = 0
    values: list[object] = []
    try:
        while offset < len(text):
            while offset < len(text) and text[offset].isspace():
                offset += 1
            if offset >= len(text):
                break
            value, offset = decoder.raw_decode(text, offset)
            values.append(value)
    except json.JSONDecodeError:
        return None
    return values


def clang_part_node(source_path: Path) -> dict[str, object] | None:
    command = [
        CLANG,
        "-x",
        "c++",
        "-std=c++20",
        "-fsyntax-only",
        "-fno-color-diagnostics",
        "-Xclang",
        "-ast-dump=json",
        "-Xclang",
        "-ast-dump-filter=Part",
        str(source_path),
    ]
    completed = subprocess.run(
        command,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=CLANG_TIMEOUT_SECONDS,
        check=False,
    )
    if completed.returncode != 0 or len(completed.stdout) > MAX_AST_BYTES:
        return None
    values = parse_json_stream(completed.stdout)
    if values is None:
        return None
    nodes, depth = ast_budget(values)
    if nodes < 1 or nodes > MAX_AST_NODES or depth > MAX_AST_DEPTH:
        return None
    matches = [
        node
        for node in walk(values)
        if node.get("name") == "Part"
        and node.get("kind") == "CXXRecordDecl"
        and node.get("completeDefinition") is True
        and node.get("isImplicit") is not True
    ]
    return matches[0] if len(matches) == 1 else None


def type_text(node: dict[str, object]) -> str:
    node_type = node.get("type")
    if not isinstance(node_type, dict):
        return ""
    qualified = node_type.get("qualType")
    return qualified if isinstance(qualified, str) else ""


def clang_facts(source_path: Path) -> dict[str, bool] | None:
    part = clang_part_node(source_path)
    if part is None:
        return None
    inner = part.get("inner")
    fields = [
        node for node in inner if isinstance(node, dict)
        and node.get("kind") == "FieldDecl"
        and isinstance(node.get("name"), str)
    ] if isinstance(inner, list) else []
    field_frame = [(node.get("name"), type_text(node)) for node in fields]
    string_type = field_frame[0][1] if field_frame else ""
    return {
        "part_record": (
            part.get("completeDefinition") is True
            and len(field_frame) == 2
            and field_frame[0][0] == "name"
            and (string_type == "std::string" or "basic_string<char>" in string_type)
            and field_frame[1] == ("quantity", "int")
        ),
    }


def analyze(source_path: Path) -> dict[str, object]:
    try:
        raw = source_path.read_bytes()
    except OSError:
        return empty_result(analyzed=False, parsed=False)
    if not raw or len(raw) > MAX_SOURCE_BYTES or raw.startswith(b"\xef\xbb\xbf") or b"\x00" in raw:
        return empty_result(analyzed=True, parsed=False)
    try:
        source = raw.decode("utf-8")
    except UnicodeDecodeError:
        return empty_result(analyzed=True, parsed=False)
    if source.encode("utf-8") != raw:
        return empty_result(analyzed=True, parsed=False)
    tokens = tokenize(source)
    if tokens is None:
        return empty_result(analyzed=True, parsed=False)
    try:
        clang = clang_facts(source_path)
    except (OSError, subprocess.SubprocessError):
        return empty_result(analyzed=False, parsed=False)
    if clang is None:
        return empty_result(analyzed=True, parsed=False)

    exact_frame = tokens == AUTHORED
    return {
        "version": 1,
        "profile": PROFILE,
        "analyzed": True,
        "parsed": True,
        "authored_frame": exact_frame,
        "part_record": contains_once(tokens, PART) and clang["part_record"],
        "restock": contains_once(tokens, RESTOCK),
        "total_units": contains_once(tokens, TOTAL_UNITS),
        "low_stock": contains_once(tokens, LOW_STOCK),
        "supplied_harness": contains_once(tokens, HARNESS),
    }


def main() -> int:
    if len(sys.argv) != 2:
        result = empty_result(analyzed=False, parsed=False)
    else:
        result = analyze(Path(sys.argv[1]))
    encoded = json.dumps(result, separators=(",", ":"), ensure_ascii=True)
    if len(encoded) > 2_048:
        encoded = json.dumps(empty_result(analyzed=False, parsed=False), separators=(",", ":"))
    sys.stdout.write(encoded)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
