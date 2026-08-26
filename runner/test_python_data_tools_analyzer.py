#!/usr/bin/env python3
"""Regression tests for the trusted Supply Tracker AST profile."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path
from unittest.mock import patch


RUNNER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(RUNNER_DIR))

import PythonDataToolsAnalyzer as analyzer  # noqa: E402


REFERENCE_SOURCE = (
    RUNNER_DIR / "fixtures" / "python-data-tools-reference.python.txt"
).read_text(encoding="utf-8")

FACT_NAMES = {
    "authored_frame",
    "normalize_name",
    "add_stock",
    "total_stock",
    "low_stock",
    "harness",
}


class PythonDataToolsAnalyzerTests(unittest.TestCase):
    def analyze(self, source: str | bytes) -> dict[str, object]:
        encoded = source if isinstance(source, bytes) else source.encode("utf-8")
        return analyzer.analyze_source(encoded)

    def assert_no_facts(self, result: dict[str, object]) -> None:
        self.assertTrue(all(result[name] is False for name in FACT_NAMES))

    def test_reference_source_has_the_exact_closed_fact_envelope(self) -> None:
        result = self.analyze(REFERENCE_SOURCE)

        self.assertEqual(
            set(result),
            {"version", "profile", "analyzed", "parsed", *FACT_NAMES},
        )
        self.assertEqual(result["version"], 1)
        self.assertEqual(result["profile"], analyzer.PROFILE)
        self.assertIs(result["analyzed"], True)
        self.assertIs(result["parsed"], True)
        self.assertTrue(all(result[name] is True for name in FACT_NAMES))

    def test_comments_and_string_literals_cannot_create_required_facts(self) -> None:
        source = '\n'.join([
            '# def normalize_name(name): return name.strip().lower()',
            'decoy = "def add_stock(inventory, name, amount):"',
            'print("Products: 2")',
            'print("Total units: 17")',
            'print("Restock: markers")',
        ])
        result = self.analyze(source)

        self.assertIs(result["parsed"], True)
        self.assert_no_facts(result)

    def test_hardcoded_visible_output_does_not_satisfy_structure(self) -> None:
        result = self.analyze('print("Products: 2\\nTotal units: 17\\nRestock: markers")')

        self.assertIs(result["parsed"], True)
        self.assert_no_facts(result)

    def test_unreachable_required_program_does_not_satisfy_the_frame(self) -> None:
        indented = '\n'.join(f"    {line}" if line else line for line in REFERENCE_SOURCE.splitlines())
        result = self.analyze(f"if False:\n{indented}\n")

        self.assertIs(result["parsed"], True)
        self.assert_no_facts(result)

    def test_extra_or_moved_top_level_statements_break_the_frame_and_harness(self) -> None:
        for source in (
            f"unused = 1\n{REFERENCE_SOURCE}",
            REFERENCE_SOURCE.replace(
                'inventory = {}\nadd_stock(inventory, " Markers ", 2)',
                'add_stock(inventory, " Markers ", 2)\ninventory = {}',
            ),
            REFERENCE_SOURCE + '\nprint("extra")\n',
        ):
            with self.subTest(source=source[:30]):
                result = self.analyze(source)
                self.assertIs(result["authored_frame"], False)
                self.assertIs(result["harness"], False)

    def test_extra_dead_code_and_early_exit_break_function_facts(self) -> None:
        cases = {
            "normalize_name": REFERENCE_SOURCE.replace(
                "    return name.strip().lower()",
                "    return name.strip().lower()\n    print('unreachable')",
                1,
            ),
            "add_stock": REFERENCE_SOURCE.replace(
                "    clean_name = normalize_name(name)",
                "    if False:\n        clean_name = normalize_name(name)\n    clean_name = normalize_name(name)",
                1,
            ),
            "total_stock": REFERENCE_SOURCE.replace(
                "    total = 0",
                "    raise SystemExit\n    total = 0",
                1,
            ),
            "low_stock": REFERENCE_SOURCE.replace(
                "    names = []",
                "    names = []\n    pass",
                1,
            ),
        }
        for fact, source in cases.items():
            with self.subTest(fact=fact):
                self.assertIs(self.analyze(source)[fact], False)

    def test_aliases_and_wrong_operators_fail_the_owning_function(self) -> None:
        cases = {
            "normalize_name": REFERENCE_SOURCE.replace(
                "return name.strip().lower()",
                "return str.lower(name.strip())",
            ),
            "add_stock": REFERENCE_SOURCE.replace(
                "current = inventory.get(clean_name, 0)",
                "current = inventory.get(clean_name) or 0",
            ),
            "total_stock": REFERENCE_SOURCE.replace("total += amount", "total = total + amount"),
            "low_stock": REFERENCE_SOURCE.replace("inventory[name] < limit", "inventory[name] <= limit"),
        }
        for fact, source in cases.items():
            with self.subTest(fact=fact):
                self.assertIs(self.analyze(source)[fact], False)

    def test_wrong_nesting_and_loop_sources_fail(self) -> None:
        wrong_total = REFERENCE_SOURCE.replace(
            "    for amount in inventory.values():\n        total += amount",
            "    for amount in inventory:\n        total += inventory[amount]",
        )
        wrong_filter = REFERENCE_SOURCE.replace(
            "        if inventory[name] < limit:\n            names.append(name)",
            "        names.append(name)\n        if inventory[name] < limit:\n            pass",
        )

        self.assertIs(self.analyze(wrong_total)["total_stock"], False)
        self.assertIs(self.analyze(wrong_filter)["low_stock"], False)

    def test_signature_extensions_and_duplicate_functions_fail_closed(self) -> None:
        decorated = REFERENCE_SOURCE.replace(
            "def normalize_name(name):",
            "@staticmethod\ndef normalize_name(name='markers'):",
        )
        duplicate = REFERENCE_SOURCE.replace(
            "def add_stock(inventory, name, amount):",
            "def normalize_name(name):\n    return name.strip().lower()\n\ndef add_stock(inventory, name, amount):",
        )

        self.assertIs(self.analyze(decorated)["normalize_name"], False)
        self.assertIs(self.analyze(decorated)["authored_frame"], False)
        self.assertIs(self.analyze(duplicate)["normalize_name"], False)
        self.assertIs(self.analyze(duplicate)["authored_frame"], False)

    def test_unsupported_topology_cannot_hide_required_nodes(self) -> None:
        for prefix in (
            "import os\n",
            "class Tracker:\n    pass\n",
            "try:\n    pass\nexcept Exception:\n    pass\n",
            "values = [amount for amount in []]\n",
            "worker = lambda: None\n",
        ):
            with self.subTest(prefix=prefix.splitlines()[0]):
                result = self.analyze(prefix + REFERENCE_SOURCE)
                self.assertIs(result["authored_frame"], False)
                self.assertIs(result["harness"], False)

    def test_non_utf8_encoding_cookie_is_rejected_before_parsing(self) -> None:
        result = self.analyze(b"# coding: utf-7\nprint('safe')\n")

        self.assertIs(result["analyzed"], True)
        self.assertIs(result["parsed"], False)
        self.assert_no_facts(result)

    def test_utf8_bom_and_cookie_remain_supported(self) -> None:
        result = self.analyze(b"\xef\xbb\xbf# coding: utf-8\n" + REFERENCE_SOURCE.encode("utf-8"))

        self.assertIs(result["parsed"], True)
        self.assertTrue(all(result[name] is True for name in FACT_NAMES))

    def test_syntax_source_size_node_and_depth_limits_fail_closed(self) -> None:
        syntax = self.analyze("def broken(:\n")
        oversized = self.analyze(b"#" * (analyzer.MAX_SOURCE_BYTES + 1))
        with patch.object(analyzer, "MAX_AST_NODES", 1):
            node_limited = self.analyze("value = 1")
        with patch.object(analyzer, "MAX_AST_DEPTH", 1):
            depth_limited = self.analyze("value = 1")

        for result in (syntax, oversized, node_limited, depth_limited):
            self.assertIs(result["analyzed"], True)
            self.assertIs(result["parsed"], False)
            self.assert_no_facts(result)


if __name__ == "__main__":
    unittest.main()
