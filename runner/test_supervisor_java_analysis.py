#!/usr/bin/env python3
"""Container-backed regressions for trusted beginner-Java tree facts."""

from __future__ import annotations

import json
import os
import pwd
import subprocess
import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parent))

from supervisor import (  # noqa: E402
    WORKSPACE,
    analyze_java_source_file,
    clear_case_state,
    failed_java_analysis,
    normalize_java_analysis,
)


REFERENCE_SOURCE = """\
import java.util.Scanner;

public class Main {
    static void printPicnic(String name, int guests) {
        System.out.println("Picnic: " + name + " | Guests: " + guests);
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] supplies = { "Blankets", "Cups", "Napkins" };

        System.out.println("What is your name?");
        String guestName = scanner.nextLine();

        System.out.println("How many guests are coming?");
        int guestCount = Integer.parseInt(scanner.nextLine());

        if (guestCount >= 8) {
            System.out.println("Table: Large");
        } else {
            System.out.println("Table: Small");
        }

        for (String supply : supplies) {
            System.out.println("Supply: " + supply);
        }

        printPicnic(guestName, guestCount);
    }
}
"""


EXPECTED_ANALYSIS = {
    "version": 1,
    "analyzed": True,
    "parsed": True,
    "straight_line": True,
    "imports": ["java.util.Scanner"],
    "class_signature": True,
    "main_methods": [
        {"occurrence": 1, "member": 2},
    ],
    "static_methods": [
        {
            "occurrence": 1,
            "member": 1,
            "name": "printPicnic",
            "return_type": "void",
            "parameters": [
                {"position": 1, "name": "name", "type": "String"},
                {"position": 2, "name": "guests", "type": "int"},
            ],
            "output": {
                "parts": ["Picnic: ", " | Guests: ", ""],
                "fields": ["name", "guests"],
            },
        },
    ],
    "scanner_declarations": [
        {
            "occurrence": 1,
            "statement": 1,
            "target": "scanner",
            "kind": "scanner_system_in",
        },
    ],
    "arrays": [
        {
            "occurrence": 1,
            "statement": 2,
            "target": "supplies",
            "element_type": "String",
            "values": ["Blankets", "Cups", "Napkins"],
        },
    ],
    "inputs": [
        {
            "occurrence": 1,
            "statement": 4,
            "target": "guestName",
            "kind": "scanner_next_line",
            "receiver": "scanner",
        },
        {
            "occurrence": 2,
            "statement": 6,
            "target": "guestCount",
            "kind": "integer_parse_scanner_next_line",
            "receiver": "scanner",
        },
    ],
    "writes": [
        {"occurrence": 1, "statement": 3, "text": "What is your name?"},
        {"occurrence": 2, "statement": 5, "text": "How many guests are coming?"},
    ],
    "conditionals": [
        {
            "occurrence": 1,
            "statement": 7,
            "left": "guestCount",
            "operator": ">=",
            "right": 8,
            "when_true": "Table: Large",
            "when_false": "Table: Small",
        },
    ],
    "foreach_loops": [
        {
            "occurrence": 1,
            "statement": 8,
            "element_type": "String",
            "target": "supply",
            "collection": "supplies",
            "output": {
                "parts": ["Supply: ", ""],
                "fields": ["supply"],
            },
        },
    ],
    "calls": [
        {
            "occurrence": 1,
            "statement": 9,
            "target": "printPicnic",
            "arguments": ["guestName", "guestCount"],
        },
    ],
}


def analyze(source: str | bytes) -> dict[str, object]:
    clear_case_state()
    learner = pwd.getpwnam("cadet")
    WORKSPACE.chmod(0o700)
    os.chown(WORKSPACE, learner.pw_uid, learner.pw_gid)
    source_path = WORKSPACE / "Main.java"
    source_path.write_bytes(source.encode("utf-8") if isinstance(source, str) else source)
    os.chown(source_path, learner.pw_uid, learner.pw_gid)
    source_path.chmod(0o600)
    try:
        return analyze_java_source_file()
    finally:
        clear_case_state()


class JavaAnalysisTests(unittest.TestCase):
    def assert_policy_failure(self, source: str | bytes) -> None:
        self.assertEqual(
            analyze(source),
            failed_java_analysis(analyzed=True, parsed=False),
        )

    def test_supervisor_cli_analyzes_only_with_the_trusted_flag(self) -> None:
        def run_supervisor(*extra_arguments: str) -> dict[str, object]:
            clear_case_state()
            (WORKSPACE / "source.txt").write_text(REFERENCE_SOURCE, encoding="utf-8")
            (WORKSPACE / "stdin.txt").write_text("Alex Kim\n10\n", encoding="utf-8")
            environment = dict(os.environ)
            environment["SPP_LOCAL_QEMU"] = "1"
            completed = subprocess.run(
                ["/usr/bin/python3", "/opt/runner/supervisor.py", "java", *extra_arguments],
                cwd=WORKSPACE,
                env=environment,
                capture_output=True,
                check=True,
                text=True,
                timeout=30,
            )
            return json.loads(completed.stdout)

        protected = run_supervisor("--project-analysis")
        self.assertEqual(protected["outcome"], "completed")
        self.assertEqual(
            protected["stdout"].splitlines(),
            [
                "What is your name?",
                "How many guests are coming?",
                "Table: Large",
                "Supply: Blankets",
                "Supply: Cups",
                "Supply: Napkins",
                "Picnic: Alex Kim | Guests: 10",
            ],
        )
        self.assertNotIn("python_analysis", protected)
        self.assertNotIn("cpp_analysis", protected)
        self.assertNotIn("csharp_analysis", protected)
        self.assertEqual(protected["java_analysis"], EXPECTED_ANALYSIS)

        ordinary = run_supervisor()
        self.assertEqual(ordinary["outcome"], "completed")
        self.assertEqual(ordinary["java_analysis"], failed_java_analysis())

    def test_reference_solution_produces_exact_bounded_facts(self) -> None:
        self.assertEqual(analyze(REFERENCE_SOURCE), EXPECTED_ANALYSIS)

    def test_multiline_direct_forms_and_comments_remain_valid(self) -> None:
        source = REFERENCE_SOURCE.replace(
            '        System.out.println("Picnic: " + name + " | Guests: " + guests);',
            '''        // A comment cannot create an output fact.
        System.out.println(
                "Picnic: "
                + name
                + " | Guests: "
                + guests
        );''',
        ).replace(
            "int guestCount = Integer.parseInt(scanner.nextLine());",
            '''int guestCount = Integer.parseInt(
                scanner.nextLine()
        );''',
        )

        self.assertEqual(analyze(source), EXPECTED_ANALYSIS)

    def test_comments_and_string_decoys_cannot_create_facts(self) -> None:
        source = REFERENCE_SOURCE.replace(
            '        System.out.println("What is your name?");',
            '''        // String fake = scanner.nextLine();
        // printPicnic(fake, fakeCount);
        System.out.println("What is your name? // scanner.nextLine()");''',
        )
        analysis = analyze(source)
        self.assertTrue(analysis["straight_line"])
        self.assertEqual(len(analysis["inputs"]), 2)
        self.assertEqual(len(analysis["calls"]), 1)
        self.assertEqual(
            analysis["writes"][0]["text"],
            "What is your name? // scanner.nextLine()",
        )

    def test_unicode_escapes_backslashes_and_non_ascii_fail_before_facts(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace("printPicnic", "pr\\u0069ntPicnic"),
            REFERENCE_SOURCE.replace("System.out", "Syst\\u0065m.out"),
            REFERENCE_SOURCE.replace('"Picnic: "', '"P\\u0069cnic: "'),
            REFERENCE_SOURCE.replace(
                "public class Main {",
                "// \\u000a return;\npublic class Main {",
            ),
            REFERENCE_SOURCE.replace("guestName", "guéstName"),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_qualified_static_and_wildcard_forms_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace("Scanner scanner", "java.util.Scanner scanner").replace(
                "new Scanner",
                "new java.util.Scanner",
            ),
            REFERENCE_SOURCE.replace("System.out.println", "java.lang.System.out.println"),
            REFERENCE_SOURCE.replace(
                "import java.util.Scanner;",
                "import static java.lang.System.out;\nimport java.util.Scanner;",
            ),
            REFERENCE_SOURCE.replace("import java.util.Scanner;", "import java.util.*;"),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_extra_classes_methods_constructors_and_lambdas_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE + "\nclass Helper {}\n",
            REFERENCE_SOURCE.replace(
                "    public static void main",
                "    static void helper() {}\n\n    public static void main",
            ),
            REFERENCE_SOURCE.replace(
                "    static void printPicnic",
                "    Main() {}\n\n    static void printPicnic",
            ),
            REFERENCE_SOURCE.replace(
                "        Scanner scanner =",
                "        Runnable helper = () -> {};\n        Scanner scanner =",
            ),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_early_return_and_nested_control_flow_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                "        printPicnic(guestName, guestCount);",
                "        return;\n        printPicnic(guestName, guestCount);",
            ),
            REFERENCE_SOURCE.replace(
                '        System.out.println("What is your name?");',
                '        if (true) { System.out.println("What is your name?"); }',
            ),
            REFERENCE_SOURCE.replace(
                "        printPicnic(guestName, guestCount);",
                "        while (false) {}\n        printPicnic(guestName, guestCount);",
            ),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_wrong_literals_are_facts_but_wrong_operator_is_rejected(self) -> None:
        wrong_array = analyze(REFERENCE_SOURCE.replace('"Napkins"', '"Plates"'))
        self.assertTrue(wrong_array["straight_line"])
        self.assertEqual(wrong_array["arrays"][0]["values"], ["Blankets", "Cups", "Plates"])

        wrong_threshold = analyze(REFERENCE_SOURCE.replace("guestCount >= 8", "guestCount >= 9"))
        self.assertTrue(wrong_threshold["straight_line"])
        self.assertEqual(wrong_threshold["conditionals"][0]["right"], 9)

        wrong_text = analyze(REFERENCE_SOURCE.replace("Table: Large", "Table: Huge"))
        self.assertTrue(wrong_text["straight_line"])
        self.assertEqual(wrong_text["conditionals"][0]["when_true"], "Table: Huge")

        self.assert_policy_failure(REFERENCE_SOURCE.replace("guestCount >= 8", "guestCount > 8"))

    def test_reordered_statements_and_members_preserve_positions(self) -> None:
        moved_prompt = REFERENCE_SOURCE.replace(
            '''        System.out.println("What is your name?");
        String guestName = scanner.nextLine();''',
            '''        String guestName = scanner.nextLine();
        System.out.println("What is your name?");''',
        )
        prompt_analysis = analyze(moved_prompt)
        self.assertTrue(prompt_analysis["straight_line"])
        self.assertEqual(prompt_analysis["inputs"][0]["statement"], 3)
        self.assertEqual(prompt_analysis["writes"][0]["statement"], 4)

        helper_start = REFERENCE_SOURCE.index("    static void printPicnic")
        main_start = REFERENCE_SOURCE.index("    public static void main")
        helper = REFERENCE_SOURCE[helper_start:main_start].rstrip()
        main = REFERENCE_SOURCE[main_start:REFERENCE_SOURCE.rindex("}")].rstrip()
        reversed_members = (
            REFERENCE_SOURCE[:helper_start]
            + main
            + "\n\n"
            + helper
            + "\n}"
        )
        member_analysis = analyze(reversed_members)
        self.assertTrue(member_analysis["straight_line"])
        self.assertEqual(member_analysis["main_methods"][0]["member"], 1)
        self.assertEqual(member_analysis["static_methods"][0]["member"], 2)

    def test_parentheses_casts_member_and_helper_tricks_are_rejected(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                "Integer.parseInt(scanner.nextLine())",
                "Integer.parseInt((scanner.nextLine()))",
            ),
            REFERENCE_SOURCE.replace(
                "printPicnic(guestName, guestCount);",
                "printPicnic(guestName.trim(), guestCount);",
            ),
            REFERENCE_SOURCE.replace(
                '"Supply: " + supply',
                '"Supply: " + (supply)',
            ),
            REFERENCE_SOURCE.replace("new Scanner(System.in)", "new Scanner((System.in))"),
            REFERENCE_SOURCE.replace(
                '"Picnic: " + name',
                '"Picnic: " + String.valueOf(name)',
            ),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_duplicates_and_extra_cleanup_statement_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                '        System.out.println("What is your name?");',
                '        System.out.println("What is your name?");\n'
                '        System.out.println("What is your name?");',
            ),
            REFERENCE_SOURCE.replace(
                "        String guestName = scanner.nextLine();",
                "        String guestName = scanner.nextLine();\n"
                "        String otherName = scanner.nextLine();",
            ),
            REFERENCE_SOURCE.replace(
                "        printPicnic(guestName, guestCount);",
                "        printPicnic(guestName, guestCount);\n        scanner.close();",
            ),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_packages_annotations_varargs_and_var_are_unsupported(self) -> None:
        variants = (
            "package training;\n" + REFERENCE_SOURCE,
            REFERENCE_SOURCE.replace("public class Main", "@Deprecated public class Main"),
            REFERENCE_SOURCE.replace("String[] args", "String... args"),
            REFERENCE_SOURCE.replace("Scanner scanner =", "var scanner ="),
            REFERENCE_SOURCE.replace("static void printPicnic", "public static void printPicnic"),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_escaped_and_text_block_literals_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace('"Blankets"', '"Blank\\u0065ts"'),
            REFERENCE_SOURCE.replace('"Cups"', '"C\\165ps"'),
            REFERENCE_SOURCE.replace('"Napkins"', '"""Napkins"""'),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_invalid_oversized_and_deep_sources_fail_closed(self) -> None:
        deep_condition = "(" * 140 + "guestCount >= 8" + ")" * 140
        variants: tuple[str | bytes, ...] = (
            b"\xff\xfe" + REFERENCE_SOURCE.encode("utf-8"),
            b"a" * (64 * 1024 + 1),
            REFERENCE_SOURCE.replace("guestCount >= 8", deep_condition),
        )
        for source in variants:
            with self.subTest(source_type=type(source).__name__):
                self.assert_policy_failure(source)

    def test_semantic_errors_return_empty_facts(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace("supply : supplies", "supply : missingSupplies"),
            REFERENCE_SOURCE.replace("printPicnic(guestName", "printPicnic(missingName"),
        )
        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_python_validator_rejects_malformed_or_unbounded_envelopes(self) -> None:
        self.assertEqual(normalize_java_analysis(json.dumps(EXPECTED_ANALYSIS)), EXPECTED_ANALYSIS)

        extra_key = dict(EXPECTED_ANALYSIS)
        extra_key["trusted"] = True
        self.assertIsNone(normalize_java_analysis(json.dumps(extra_key)))

        bad_occurrence = json.loads(json.dumps(EXPECTED_ANALYSIS))
        bad_occurrence["inputs"][0]["occurrence"] = 2
        self.assertIsNone(normalize_java_analysis(json.dumps(bad_occurrence)))

        oversized = json.loads(json.dumps(EXPECTED_ANALYSIS))
        oversized["writes"][0]["text"] = "x" * 257
        self.assertIsNone(normalize_java_analysis(json.dumps(oversized)))

        parsed_with_unsupported_grammar = failed_java_analysis(analyzed=True, parsed=True)
        self.assertIsNone(normalize_java_analysis(json.dumps(parsed_with_unsupported_grammar)))

        parsed_false_with_facts = json.loads(json.dumps(EXPECTED_ANALYSIS))
        parsed_false_with_facts["parsed"] = False
        parsed_false_with_facts["straight_line"] = False
        self.assertIsNone(normalize_java_analysis(json.dumps(parsed_false_with_facts)))


if __name__ == "__main__":
    unittest.main()
