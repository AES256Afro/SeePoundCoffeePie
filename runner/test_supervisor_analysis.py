#!/usr/bin/env python3
"""Focused regression tests for trusted beginner-Python AST facts."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parent))

from supervisor import analyze_python_source  # noqa: E402


REFERENCE_SOURCE = """\
price_per_cup = 3
print("Welcome to the Coffee Counter!")
name = input("What is your name?\\n")
cups_text = input("How many cups would you like?\\n")
cups = int(cups_text)
total = cups * price_per_cup
print(f"{name}, your {cups} cup order costs ${total}.")
"""


class PythonAnalysisTests(unittest.TestCase):
    def test_reference_solution_produces_normalized_facts(self) -> None:
        self.assertEqual(
            analyze_python_source(REFERENCE_SOURCE),
            {
                "version": 1,
                "parsed": True,
                "straight_line": True,
                "assignments": [
                    {"target": "price_per_cup", "occurrence": 1, "kind": "integer", "value": 3},
                    {"target": "name", "occurrence": 1, "kind": "input"},
                    {"target": "cups_text", "occurrence": 1, "kind": "input"},
                    {"target": "cups", "occurrence": 1, "kind": "int_name", "name": "cups_text"},
                    {
                        "target": "total",
                        "occurrence": 1,
                        "kind": "multiply_names",
                        "names": ["cups", "price_per_cup"],
                    },
                ],
                "print_fstrings": [
                    {"occurrence": 1, "fields": ["name", "cups", "total"]},
                ],
            },
        )

    def test_comments_and_strings_cannot_create_facts(self) -> None:
        source = '''\
# price_per_cup = 3
"""name = input("not executable")
print(f"{name} {cups} {total}")
"""
price_per_cup = 3
'''

        analysis = analyze_python_source(source)

        self.assertTrue(analysis["parsed"])
        self.assertTrue(analysis["straight_line"])
        self.assertEqual(
            analysis["assignments"],
            [{"target": "price_per_cup", "occurrence": 1, "kind": "integer", "value": 3}],
        )
        self.assertEqual(analysis["print_fstrings"], [])

    def test_every_spelling_of_if_is_not_straight_line(self) -> None:
        sources = (
            "if False:\n    price_per_cup = 3\n",
            "if False: price_per_cup = 3\n",
            "if (\n    False\n):\n    price_per_cup = 3\n",
            "if False:\n    pass\nelse:\n    price_per_cup = 3\n",
        )

        for source in sources:
            with self.subTest(source=source):
                analysis = analyze_python_source(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])
                self.assertEqual(analysis["assignments"], [])

    def test_early_raise_and_system_exit_fail_closed_even_with_dead_required_lines(self) -> None:
        prefixes = (
            'raise RuntimeError("stop")',
            "raise SystemExit",
            "SystemExit()",
        )

        for prefix in prefixes:
            with self.subTest(prefix=prefix):
                analysis = analyze_python_source(f"{prefix}\n{REFERENCE_SOURCE}")
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])
                self.assertEqual(len(analysis["assignments"]), 5)

    def test_alias_calls_are_unsupported_and_exact_targets_keep_occurrences(self) -> None:
        analysis = analyze_python_source('''\
reader = input
name = reader("Name?\\n")
name = input("Name?\\n")
''')

        self.assertTrue(analysis["parsed"])
        self.assertFalse(analysis["straight_line"])
        self.assertEqual(
            analysis["assignments"],
            [
                {"target": "reader", "occurrence": 1, "kind": "name", "name": "input"},
                {"target": "name", "occurrence": 1, "kind": "unsupported"},
                {"target": "name", "occurrence": 2, "kind": "input"},
            ],
        )

    def test_reassignments_remain_separate_countable_facts(self) -> None:
        analysis = analyze_python_source("price_per_cup = 3\nprice_per_cup = 3\n")

        self.assertTrue(analysis["straight_line"])
        self.assertEqual(
            analysis["assignments"],
            [
                {"target": "price_per_cup", "occurrence": 1, "kind": "integer", "value": 3},
                {"target": "price_per_cup", "occurrence": 2, "kind": "integer", "value": 3},
            ],
        )

    def test_reserved_targets_non_simple_targets_and_bool_are_rejected(self) -> None:
        reserved = analyze_python_source("input = 3\nint = 3\nprint = 3\n")
        self.assertFalse(reserved["straight_line"])
        self.assertEqual([fact["target"] for fact in reserved["assignments"]], ["input", "int", "print"])

        non_simple = analyze_python_source("left, right = (1, 2)\nobject.value = 3\n")
        self.assertFalse(non_simple["straight_line"])
        self.assertEqual(non_simple["assignments"], [])

        boolean = analyze_python_source("price_per_cup = True\n")
        self.assertFalse(boolean["straight_line"])
        self.assertEqual(
            boolean["assignments"],
            [{"target": "price_per_cup", "occurrence": 1, "kind": "unsupported"}],
        )

    def test_forbidden_statements_and_unsupported_calls_are_rejected(self) -> None:
        sources = (
            "import os\n",
            "from sys import exit\n",
            "def run():\n    return 3\n",
            "for item in items:\n    print(item)\n",
            "while False:\n    pass\n",
            "try:\n    pass\nexcept Exception:\n    pass\n",
            "value = open('secret')\n",
            "value = (item := 3)\n",
            "value = [item for item in items]\n",
            "value = lambda: 3\n",
            "print(name)\n",
            "print(f'{name.upper()}')\n",
        )

        for source in sources:
            with self.subTest(source=source):
                analysis = analyze_python_source(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])

    def test_parse_failure_and_source_cap_return_empty_fail_closed_objects(self) -> None:
        expected = {
            "version": 1,
            "parsed": False,
            "straight_line": False,
            "assignments": [],
            "print_fstrings": [],
        }
        self.assertEqual(analyze_python_source("if"), expected)
        self.assertEqual(analyze_python_source("#" * (64 * 1024 + 1)), expected)

    def test_source_encoding_cookie_is_interpreted_exactly_like_execution(self) -> None:
        # Under UTF-7, +AAo- is a newline. Treating these bytes as UTF-8 text
        # would incorrectly hide the executable assignment inside a comment.
        source = b"# coding: utf-7\n# comment+AAo-price_per_cup = 3\n"

        analysis = analyze_python_source(source)

        self.assertTrue(analysis["parsed"])
        self.assertTrue(analysis["straight_line"])
        self.assertEqual(
            analysis["assignments"],
            [{"target": "price_per_cup", "occurrence": 1, "kind": "integer", "value": 3}],
        )

    def test_encoded_newline_cannot_hide_early_system_exit_from_analysis(self) -> None:
        source = (
            b"# coding: utf-7\n"
            b"# harmless-looking comment+AAo-raise SystemExit\n"
            + REFERENCE_SOURCE.encode("utf-7")
        )

        analysis = analyze_python_source(source)

        self.assertTrue(analysis["parsed"])
        self.assertFalse(analysis["straight_line"])
        self.assertEqual(len(analysis["assignments"]), 5)
        self.assertEqual(
            analysis["print_fstrings"],
            [{"occurrence": 1, "fields": ["name", "cups", "total"]}],
        )


if __name__ == "__main__":
    unittest.main()
