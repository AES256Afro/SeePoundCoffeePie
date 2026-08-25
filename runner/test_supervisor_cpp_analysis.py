#!/usr/bin/env python3
"""Container-backed regressions for trusted beginner-C++ AST facts."""

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
    analyze_cpp_source_file,
    clear_case_state,
)


REFERENCE_SOURCE = """\
#include <iostream>
#include <string>

int main() {
    int points_per_detail = 5;
    std::cout << "Welcome to the Observation Desk!\\n";
    std::cout << "What is your name?\\n";
    std::string observer_name;
    std::getline(std::cin, observer_name);
    std::cout << "How many details did you notice?\\n";
    int details = 0;
    std::cin >> details;
    int focus_points = details * points_per_detail;
    std::cout << observer_name << ", you recorded " << details
              << " details and earned " << focus_points << " focus points.\\n";
    return 0;
}
"""


def analyze(source: str | bytes) -> dict[str, object]:
    clear_case_state()
    learner = pwd.getpwnam("cadet")
    WORKSPACE.chmod(0o700)
    os.chown(WORKSPACE, learner.pw_uid, learner.pw_gid)
    source_path = WORKSPACE / "mission.cpp"
    source_path.write_bytes(source.encode("utf-8") if isinstance(source, str) else source)
    os.chown(source_path, learner.pw_uid, learner.pw_gid)
    source_path.chmod(0o600)
    try:
        return analyze_cpp_source_file()
    finally:
        clear_case_state()


class CppAnalysisTests(unittest.TestCase):
    def test_supervisor_cli_analyzes_only_with_the_trusted_flag(self) -> None:
        def run_supervisor(*extra_arguments: str) -> dict[str, object]:
            clear_case_state()
            (WORKSPACE / "source.txt").write_text(REFERENCE_SOURCE, encoding="utf-8")
            (WORKSPACE / "stdin.txt").write_text("Avery Stone\n2\n", encoding="utf-8")
            environment = dict(os.environ)
            environment["SPP_LOCAL_QEMU"] = "1"
            completed = subprocess.run(
                ["/usr/bin/python3", "/opt/runner/supervisor.py", "cpp", *extra_arguments],
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
            protected["stdout"].splitlines()[-1],
            "Avery Stone, you recorded 2 details and earned 10 focus points.",
        )
        self.assertNotIn("python_analysis", protected)
        self.assertTrue(protected["cpp_analysis"]["analyzed"])
        self.assertTrue(protected["cpp_analysis"]["straight_line"])

        ordinary = run_supervisor()
        self.assertEqual(ordinary["outcome"], "completed")
        self.assertEqual(ordinary["cpp_analysis"], {
            "version": 1,
            "analyzed": False,
            "parsed": False,
            "straight_line": False,
            "headers": [],
            "main_signature": False,
            "returns_zero": False,
            "declarations": [],
            "inputs": [],
            "cout_chains": [],
        })

    def test_reference_solution_produces_bounded_semantic_facts(self) -> None:
        self.assertEqual(
            analyze(REFERENCE_SOURCE),
            {
                "version": 1,
                "analyzed": True,
                "parsed": True,
                "straight_line": True,
                "headers": ["iostream", "string"],
                "main_signature": True,
                "returns_zero": True,
                "declarations": [
                    {
                        "target": "points_per_detail",
                        "occurrence": 1,
                        "statement": 1,
                        "kind": "integer",
                        "value": 5,
                    },
                    {"target": "observer_name", "occurrence": 1, "statement": 4, "kind": "string"},
                    {"target": "details", "occurrence": 1, "statement": 7, "kind": "integer", "value": 0},
                    {
                        "target": "focus_points",
                        "occurrence": 1,
                        "statement": 9,
                        "kind": "multiply_names",
                        "names": ["details", "points_per_detail"],
                    },
                ],
                "inputs": [
                    {"occurrence": 1, "statement": 5, "kind": "getline_cin", "target": "observer_name"},
                    {"occurrence": 2, "statement": 8, "kind": "cin_extract", "target": "details"},
                ],
                "cout_chains": [
                    {"occurrence": 1, "statement": 2, "fields": []},
                    {"occurrence": 2, "statement": 3, "fields": []},
                    {"occurrence": 3, "statement": 6, "fields": []},
                    {
                        "occurrence": 4,
                        "statement": 10,
                        "fields": ["observer_name", "details", "focus_points"],
                    },
                ],
            },
        )

    def test_multiline_getline_and_cout_are_still_direct_statements(self) -> None:
        source = REFERENCE_SOURCE.replace(
            "std::getline(std::cin, observer_name);",
            "std::getline(\n        std::cin,\n        observer_name\n    );",
        ).replace(
            'std::cout << observer_name << ", you recorded " << details',
            'std::cout\n              << observer_name\n              << ", you recorded "\n              << details',
        )

        analysis = analyze(source)

        self.assertTrue(analysis["parsed"])
        self.assertTrue(analysis["straight_line"])
        self.assertEqual(analysis["inputs"], [
            {"occurrence": 1, "statement": 5, "kind": "getline_cin", "target": "observer_name"},
            {"occurrence": 2, "statement": 8, "kind": "cin_extract", "target": "details"},
        ])
        self.assertEqual(analysis["cout_chains"][-1], {
            "occurrence": 4,
            "statement": 10,
            "fields": ["observer_name", "details", "focus_points"],
        })

    def test_comments_and_string_contents_cannot_create_facts_or_directives(self) -> None:
        source = REFERENCE_SOURCE.replace(
            'std::cout << "Welcome to the Observation Desk!\\n";',
            '''// int decoy = 99; std::cin >> decoy;
    std::cout << R"note(Welcome
#if 0
int fake = 5;
#endif
)note" << "\\n";''',
        )

        analysis = analyze(source)

        self.assertTrue(analysis["parsed"])
        self.assertTrue(analysis["straight_line"])
        self.assertEqual([fact["target"] for fact in analysis["declarations"]], [
            "points_per_detail",
            "observer_name",
            "details",
            "focus_points",
        ])
        self.assertEqual(analysis["cout_chains"][0]["fields"], [])

    def test_preprocessor_macros_conditionals_and_line_splicing_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                "int points_per_detail = 5;",
                "#define POINT_RULE int points_per_detail = 5;\n    POINT_RULE",
            ),
            REFERENCE_SOURCE.replace(
                "int points_per_detail = 5;",
                "#if 1\n    int points_per_detail = 5;\n    #endif",
            ),
            REFERENCE_SOURCE.replace(
                "int points_per_detail = 5;",
                "int points_per_\\\n    detail = 5;",
            ),
            REFERENCE_SOURCE.replace(
                "int points_per_detail = 5;",
                '_Pragma("clang diagnostic push")\n    int points_per_detail = 5;',
            ),
        )

        for source in variants:
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["analyzed"])
                self.assertFalse(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])
                self.assertEqual(analysis["declarations"], [])

    def test_early_return_and_control_flow_cannot_hide_required_lines(self) -> None:
        early = REFERENCE_SOURCE.replace(
            "int points_per_detail = 5;",
            "return 0;\n    int points_per_detail = 5;",
        ).replace("    return 0;\n}", "}")
        conditional = REFERENCE_SOURCE.replace(
            'std::cout << "Welcome to the Observation Desk!\\n";',
            'if (true) {\n        std::cout << "Welcome to the Observation Desk!\\n";\n    }',
        )

        for source in (early, conditional):
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])

    def test_extra_functions_classes_and_lambdas_are_outside_the_grammar(self) -> None:
        helper = REFERENCE_SOURCE.replace(
            "int main() {",
            "void helper() {}\n\nint main() {",
        )
        class_declaration = REFERENCE_SOURCE.replace(
            "int main() {",
            "class Helper {};\n\nint main() {",
        )
        lambda_declaration = REFERENCE_SOURCE.replace(
            "int points_per_detail = 5;",
            "auto helper = [] { return 5; };\n    int points_per_detail = 5;",
        )

        for source in (helper, class_declaration, lambda_declaration):
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])

    def test_duplicates_aliases_and_unsupported_qualifiers_fail_closed(self) -> None:
        duplicate = REFERENCE_SOURCE.replace(
            "int details = 0;",
            "int details = 0;\n    int details = 0;",
        )
        alias = REFERENCE_SOURCE.replace(
            "int points_per_detail = 5;",
            "using Count = int;\n    Count points_per_detail = 5;",
        )
        qualified = REFERENCE_SOURCE.replace(
            "int points_per_detail = 5;",
            "const int points_per_detail = 5;",
        )

        duplicate_analysis = analyze(duplicate)
        self.assertFalse(duplicate_analysis["parsed"])

        for source in (alias, qualified):
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])
                matching = [
                    fact for fact in analysis["declarations"]
                    if fact["target"] == "points_per_detail"
                ]
                if matching:
                    self.assertEqual(matching[0]["kind"], "unsupported")

    def test_wrong_multiplication_never_normalizes_as_the_required_fact(self) -> None:
        wrong_operator = REFERENCE_SOURCE.replace(
            "int focus_points = details * points_per_detail;",
            "int focus_points = details + points_per_detail;",
        )
        wrong_name = REFERENCE_SOURCE.replace(
            "int focus_points = details * points_per_detail;",
            "int other = 5;\n    int focus_points = details * other;",
        )

        operator_analysis = analyze(wrong_operator)
        self.assertTrue(operator_analysis["parsed"])
        self.assertFalse(operator_analysis["straight_line"])
        self.assertEqual(
            next(fact for fact in operator_analysis["declarations"] if fact["target"] == "focus_points")["kind"],
            "unsupported",
        )

        name_analysis = analyze(wrong_name)
        self.assertTrue(name_analysis["straight_line"])
        self.assertEqual(
            next(fact for fact in name_analysis["declarations"] if fact["target"] == "focus_points")["names"],
            ["details", "other"],
        )

    def test_cout_casts_manipulators_and_wrapped_expressions_are_rejected(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                '<< " details and earned " << focus_points',
                '<< " details and earned " << static_cast<int>(focus_points)',
            ),
            REFERENCE_SOURCE.replace(
                '<< " details and earned " << focus_points',
                '<< " details and earned " << std::hex << focus_points',
            ),
            REFERENCE_SOURCE.replace(
                '<< " details and earned " << focus_points',
                '<< " details and earned " << (focus_points)',
            ),
        )

        for source in variants:
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])

    def test_preprocessor_digraph_fails_closed(self) -> None:
        source = REFERENCE_SOURCE.replace(
            "int points_per_detail = 5;",
            "%:define POINT_RULE int points_per_detail = 5;\n    POINT_RULE",
        )

        analysis = analyze(source)

        self.assertTrue(analysis["analyzed"])
        self.assertFalse(analysis["parsed"])
        self.assertFalse(analysis["straight_line"])

        brace_digraph = REFERENCE_SOURCE.replace("int main() {", "int main() <%").replace(
            "\n}\n",
            "\n%>\n",
        )
        brace_analysis = analyze(brace_digraph)
        self.assertTrue(brace_analysis["analyzed"])
        self.assertFalse(brace_analysis["parsed"])
        self.assertFalse(brace_analysis["straight_line"])

    def test_attributes_and_noncanonical_integer_spellings_are_rejected(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                "int points_per_detail = 5;",
                "[[maybe_unused]] int points_per_detail = 5;",
            ),
            REFERENCE_SOURCE.replace("int points_per_detail = 5;", "int points_per_detail = 05;"),
            REFERENCE_SOURCE.replace("int details = 0;", "int details = 000;"),
        )

        for source in variants:
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])

    def test_statement_indexes_preserve_prompt_before_input_order(self) -> None:
        moved_getline = REFERENCE_SOURCE.replace(
            '    std::cout << "What is your name?\\n";\n    std::string observer_name;\n'
            "    std::getline(std::cin, observer_name);",
            "    std::string observer_name;\n"
            "    std::getline(std::cin, observer_name);\n"
            '    std::cout << "What is your name?\\n";',
        )

        analysis = analyze(moved_getline)

        self.assertTrue(analysis["straight_line"])
        self.assertEqual(analysis["inputs"][0]["statement"], 4)
        self.assertEqual(analysis["cout_chains"][1]["statement"], 5)

    def test_unsupported_encoding_and_headers_fail_before_ast_facts(self) -> None:
        variants = (
            b"\xff\xfe" + REFERENCE_SOURCE.encode("utf-8"),
            REFERENCE_SOURCE.replace("#include <string>", "#include <vector>"),
            REFERENCE_SOURCE.replace("#include <string>\n", ""),
        )

        for source in variants:
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["analyzed"])
                self.assertFalse(analysis["parsed"])
                self.assertEqual(analysis["headers"], [])


if __name__ == "__main__":
    unittest.main()
