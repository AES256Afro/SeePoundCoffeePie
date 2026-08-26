#!/usr/bin/env python3
"""Container-backed regressions for trusted beginner-C# Roslyn facts."""

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
    analyze_csharp_source_file,
    clear_case_state,
    failed_csharp_analysis,
    normalize_csharp_analysis,
)


REFERENCE_SOURCE = """\
using System;

void PrintBadge(string name, int visits)
{
    Console.WriteLine($"Badge: {name} | Visits: {visits}");
}

string[] areas = { "Studio", "Lab", "Library" };

Console.WriteLine("What is your name?");
string guestName = Console.ReadLine() ?? "";

Console.WriteLine("How many visits have you completed?");
int visitCount = int.Parse(Console.ReadLine() ?? "0");

if (visitCount >= 3)
{
    Console.WriteLine("Access: Member");
}
else
{
    Console.WriteLine("Access: Guest");
}

foreach (string area in areas)
{
    Console.WriteLine($"Area: {area}");
}

PrintBadge(guestName, visitCount);
"""


EXPECTED_ANALYSIS = {
    "version": 1,
    "analyzed": True,
    "parsed": True,
    "straight_line": True,
    "usings": ["System"],
    "local_functions": [
        {
            "occurrence": 1,
            "statement": 1,
            "name": "PrintBadge",
            "return_type": "void",
            "parameters": [
                {"position": 1, "name": "name", "type": "string"},
                {"position": 2, "name": "visits", "type": "int"},
            ],
            "interpolation": {
                "parts": ["Badge: ", " | Visits: ", ""],
                "fields": ["name", "visits"],
            },
        },
    ],
    "arrays": [
        {
            "occurrence": 1,
            "statement": 2,
            "target": "areas",
            "element_type": "string",
            "values": ["Studio", "Lab", "Library"],
        },
    ],
    "inputs": [
        {
            "occurrence": 1,
            "statement": 4,
            "target": "guestName",
            "kind": "read_line_coalesce_string",
            "fallback": "",
        },
        {
            "occurrence": 2,
            "statement": 6,
            "target": "visitCount",
            "kind": "int_parse_read_line_coalesce_string",
            "fallback": "0",
        },
    ],
    "writes": [
        {
            "occurrence": 1,
            "statement": 3,
            "text": "What is your name?",
        },
        {
            "occurrence": 2,
            "statement": 5,
            "text": "How many visits have you completed?",
        },
    ],
    "conditionals": [
        {
            "occurrence": 1,
            "statement": 7,
            "left": "visitCount",
            "operator": ">=",
            "right": 3,
            "when_true": "Access: Member",
            "when_false": "Access: Guest",
        },
    ],
    "foreach_loops": [
        {
            "occurrence": 1,
            "statement": 8,
            "element_type": "string",
            "target": "area",
            "collection": "areas",
            "interpolation": {
                "parts": ["Area: ", ""],
                "fields": ["area"],
            },
        },
    ],
    "calls": [
        {
            "occurrence": 1,
            "statement": 9,
            "target": "PrintBadge",
            "arguments": ["guestName", "visitCount"],
        },
    ],
}


def analyze(source: str | bytes) -> dict[str, object]:
    clear_case_state()
    learner = pwd.getpwnam("cadet")
    WORKSPACE.chmod(0o700)
    os.chown(WORKSPACE, learner.pw_uid, learner.pw_gid)
    source_path = WORKSPACE / "Program.cs"
    source_path.write_bytes(source.encode("utf-8") if isinstance(source, str) else source)
    os.chown(source_path, learner.pw_uid, learner.pw_gid)
    source_path.chmod(0o600)
    try:
        return analyze_csharp_source_file()
    finally:
        clear_case_state()


class CsharpAnalysisTests(unittest.TestCase):
    def assert_policy_failure(self, source: str) -> None:
        self.assertEqual(
            analyze(source),
            failed_csharp_analysis(analyzed=True, parsed=False),
        )

    def test_supervisor_cli_analyzes_only_with_the_trusted_flag(self) -> None:
        def run_supervisor(*extra_arguments: str) -> dict[str, object]:
            clear_case_state()
            (WORKSPACE / "source.txt").write_text(REFERENCE_SOURCE, encoding="utf-8")
            (WORKSPACE / "stdin.txt").write_text("Alex Kim\n4\n", encoding="utf-8")
            environment = dict(os.environ)
            environment["SPP_LOCAL_QEMU"] = "1"
            completed = subprocess.run(
                ["/usr/bin/python3", "/opt/runner/supervisor.py", "csharp", *extra_arguments],
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
                "How many visits have you completed?",
                "Access: Member",
                "Area: Studio",
                "Area: Lab",
                "Area: Library",
                "Badge: Alex Kim | Visits: 4",
            ],
        )
        self.assertNotIn("python_analysis", protected)
        self.assertNotIn("cpp_analysis", protected)
        self.assertEqual(protected["csharp_analysis"], EXPECTED_ANALYSIS)

        ordinary = run_supervisor()
        self.assertEqual(ordinary["outcome"], "completed")
        self.assertEqual(ordinary["csharp_analysis"], failed_csharp_analysis())

    def test_reference_solution_produces_exact_bounded_facts(self) -> None:
        self.assertEqual(analyze(REFERENCE_SOURCE), EXPECTED_ANALYSIS)

    def test_multiline_direct_forms_and_comments_remain_valid(self) -> None:
        source = REFERENCE_SOURCE.replace(
            '    Console.WriteLine($"Badge: {name} | Visits: {visits}");',
            '''    // Console.WriteLine("decoy");
    Console.WriteLine(
        $"Badge: {name} | Visits: {visits}"
    );''',
        ).replace(
            'int visitCount = int.Parse(Console.ReadLine() ?? "0");',
            '''int visitCount = int.Parse(
    Console.ReadLine() ?? "0"
);''',
        ).replace(
            '    Console.WriteLine($"Area: {area}");',
            '''    Console.WriteLine(
        $"Area: {area}"
    );''',
        )

        analysis = analyze(source)

        self.assertTrue(analysis["parsed"])
        self.assertTrue(analysis["straight_line"])
        self.assertEqual(analysis, EXPECTED_ANALYSIS)

    def test_comments_and_string_decoys_cannot_create_facts(self) -> None:
        source = REFERENCE_SOURCE.replace(
            'Console.WriteLine("What is your name?");',
            '''// string guestName = Console.ReadLine() ?? "";
Console.WriteLine("What is your name? // PrintBadge(decoy, decoy)");''',
        )

        analysis = analyze(source)

        self.assertTrue(analysis["parsed"])
        self.assertTrue(analysis["straight_line"])
        self.assertEqual(len(analysis["inputs"]), 2)
        self.assertEqual(len(analysis["calls"]), 1)
        self.assertEqual(analysis["writes"][0]["text"], "What is your name? // PrintBadge(decoy, decoy)")

    def test_directives_and_disabled_code_fail_before_facts(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace("using System;", "#define ENABLED\nusing System;"),
            REFERENCE_SOURCE.replace(
                "string[] areas =",
                "#if true\nstring[] areas =",
            ).replace(
                'Console.WriteLine("What is your name?");',
                '#endif\nConsole.WriteLine("What is your name?");',
            ),
            REFERENCE_SOURCE.replace(
                "using System;",
                "#if false\nConsole.WriteLine(\"decoy\");\n#endif\nusing System;",
            ),
            REFERENCE_SOURCE.replace("using System;", "#nullable enable\nusing System;"),
        )

        for source in variants:
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["analyzed"])
                self.assertFalse(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])
                self.assertEqual(analysis["local_functions"], [])

    def test_aliases_var_and_qualified_members_are_outside_the_grammar(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace("using System;", "using Out = System.Console;").replace(
                "Console.",
                "Out.",
            ),
            REFERENCE_SOURCE.replace(
                'string guestName = Console.ReadLine() ?? "";',
                'var guestName = Console.ReadLine() ?? "";',
            ),
            REFERENCE_SOURCE.replace(
                'Console.WriteLine("What is your name?");',
                'System.Console.WriteLine("What is your name?");',
            ),
        )

        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_verbatim_and_unicode_escaped_identifiers_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace("PrintBadge", "@PrintBadge"),
            REFERENCE_SOURCE.replace("guestName", "@guestName"),
            REFERENCE_SOURCE.replace("visitCount", "@visitCount"),
            REFERENCE_SOURCE.replace("areas", "@areas"),
            REFERENCE_SOURCE.replace("string area in", "string @area in").replace(
                "{area}",
                "{@area}",
            ),
            REFERENCE_SOURCE.replace("PrintBadge", "Pr\\u0069ntBadge"),
            REFERENCE_SOURCE.replace("guestName", "guestN\\u0061me"),
            REFERENCE_SOURCE.replace("Console.WriteLine", "Cons\\u006fle.Writ\\u0065Line"),
        )

        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_escaped_verbatim_and_raw_strings_fail_closed(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace('"Studio"', '"St\\u0075dio"'),
            REFERENCE_SOURCE.replace('"What is your name?"', '"What is your\\u0020name?"'),
            REFERENCE_SOURCE.replace('"Access: Member"', '"Access:\\u0020Member"'),
            REFERENCE_SOURCE.replace('$"Badge: {name}', '$"Badge:\\u0020{name}'),
            REFERENCE_SOURCE.replace('"Studio"', '@"Studio"'),
            REFERENCE_SOURCE.replace('"Studio"', '"""Studio"""'),
        )

        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_unreachable_or_nested_required_lines_fail_closed(self) -> None:
        unreachable = REFERENCE_SOURCE.replace(
            "PrintBadge(guestName, visitCount);",
            "return;\nPrintBadge(guestName, visitCount);",
        )
        nested = REFERENCE_SOURCE.replace(
            'Console.WriteLine("What is your name?");',
            'if (true) { Console.WriteLine("What is your name?"); }',
        )

        for source in (unreachable, nested):
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_extra_method_type_local_function_and_lambda_fail_closed(self) -> None:
        extra_local_function = REFERENCE_SOURCE.replace(
            "string[] areas =",
            "void Helper() {}\n\nstring[] areas =",
        )
        extra_type = REFERENCE_SOURCE + "\nclass Helper {}\n"
        lambda_declaration = REFERENCE_SOURCE.replace(
            "string[] areas =",
            "Func<int> helper = () => 3;\n\nstring[] areas =",
        )

        for source in (extra_local_function, extra_type, lambda_declaration):
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_wrong_literals_are_facts_but_wrong_operator_is_rejected(self) -> None:
        wrong_array = analyze(REFERENCE_SOURCE.replace('"Library"', '"Office"'))
        self.assertTrue(wrong_array["straight_line"])
        self.assertEqual(wrong_array["arrays"][0]["values"], ["Studio", "Lab", "Office"])

        wrong_threshold = analyze(REFERENCE_SOURCE.replace("visitCount >= 3", "visitCount >= 4"))
        self.assertTrue(wrong_threshold["straight_line"])
        self.assertEqual(wrong_threshold["conditionals"][0]["right"], 4)

        wrong_text = analyze(REFERENCE_SOURCE.replace("Access: Member", "Access: Veteran"))
        self.assertTrue(wrong_text["straight_line"])
        self.assertEqual(wrong_text["conditionals"][0]["when_true"], "Access: Veteran")

        wrong_operator = analyze(REFERENCE_SOURCE.replace("visitCount >= 3", "visitCount > 3"))
        self.assertEqual(
            wrong_operator,
            failed_csharp_analysis(analyzed=True, parsed=False),
        )

    def test_reordered_statements_preserve_trusted_positions(self) -> None:
        moved_prompt = REFERENCE_SOURCE.replace(
            '''Console.WriteLine("What is your name?");
string guestName = Console.ReadLine() ?? "";''',
            '''string guestName = Console.ReadLine() ?? "";
Console.WriteLine("What is your name?");''',
        )
        prompt_analysis = analyze(moved_prompt)
        self.assertTrue(prompt_analysis["straight_line"])
        self.assertEqual(prompt_analysis["inputs"][0]["statement"], 3)
        self.assertEqual(prompt_analysis["writes"][0]["statement"], 4)

        moved_call = REFERENCE_SOURCE.replace(
            '''foreach (string area in areas)
{
    Console.WriteLine($"Area: {area}");
}

PrintBadge(guestName, visitCount);''',
            '''PrintBadge(guestName, visitCount);

foreach (string area in areas)
{
    Console.WriteLine($"Area: {area}");
}''',
        )
        call_analysis = analyze(moved_call)
        self.assertTrue(call_analysis["straight_line"])
        self.assertEqual(call_analysis["calls"][0]["statement"], 8)
        self.assertEqual(call_analysis["foreach_loops"][0]["statement"], 9)

    def test_parentheses_casts_member_and_helper_tricks_are_rejected(self) -> None:
        variants = (
            REFERENCE_SOURCE.replace(
                'int.Parse(Console.ReadLine() ?? "0")',
                'int.Parse((Console.ReadLine() ?? "0"))',
            ),
            REFERENCE_SOURCE.replace(
                "PrintBadge(guestName, visitCount);",
                "PrintBadge(guestName.Trim(), visitCount);",
            ),
            REFERENCE_SOURCE.replace('$"Area: {area}"', '$"Area: {(area)}"'),
            REFERENCE_SOURCE.replace(
                'Console.ReadLine() ?? ""',
                '(string)(Console.ReadLine() ?? "")',
            ),
        )

        for source in variants:
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_duplicate_required_constructs_fail_closed(self) -> None:
        duplicate_prompt = REFERENCE_SOURCE.replace(
            'Console.WriteLine("What is your name?");',
            'Console.WriteLine("What is your name?");\nConsole.WriteLine("What is your name?");',
        )
        duplicate_input = REFERENCE_SOURCE.replace(
            'string guestName = Console.ReadLine() ?? "";',
            'string guestName = Console.ReadLine() ?? "";\nstring otherName = Console.ReadLine() ?? "";',
        )

        for source in (duplicate_prompt, duplicate_input):
            with self.subTest(source=source):
                self.assert_policy_failure(source)

    def test_invalid_encoding_and_semantic_errors_return_empty_facts(self) -> None:
        variants = (
            b"\xff\xfe" + REFERENCE_SOURCE.encode("utf-8"),
            REFERENCE_SOURCE.replace("using System;", "using Missing.Namespace;"),
            REFERENCE_SOURCE.replace(
                "foreach (string area in areas)",
                "foreach (string area in missingAreas)",
            ),
        )

        for source in variants:
            with self.subTest(source=source):
                analysis = analyze(source)
                self.assertTrue(analysis["analyzed"])
                self.assertFalse(analysis["parsed"])
                self.assertFalse(analysis["straight_line"])
                self.assertEqual(analysis["usings"], [])
                self.assertEqual(analysis["local_functions"], [])

    def test_python_validator_rejects_malformed_or_unbounded_envelopes(self) -> None:
        accepted = normalize_csharp_analysis(json.dumps(EXPECTED_ANALYSIS))
        self.assertEqual(accepted, EXPECTED_ANALYSIS)

        extra_key = dict(EXPECTED_ANALYSIS)
        extra_key["trusted"] = True
        self.assertIsNone(normalize_csharp_analysis(json.dumps(extra_key)))

        bad_occurrence = json.loads(json.dumps(EXPECTED_ANALYSIS))
        bad_occurrence["inputs"][0]["occurrence"] = 2
        self.assertIsNone(normalize_csharp_analysis(json.dumps(bad_occurrence)))

        oversized = json.loads(json.dumps(EXPECTED_ANALYSIS))
        oversized["writes"][0]["text"] = "x" * 257
        self.assertIsNone(normalize_csharp_analysis(json.dumps(oversized)))

        parsed_false_with_facts = json.loads(json.dumps(EXPECTED_ANALYSIS))
        parsed_false_with_facts["parsed"] = False
        parsed_false_with_facts["straight_line"] = False
        self.assertIsNone(normalize_csharp_analysis(json.dumps(parsed_false_with_facts)))

        parsed_without_supported_grammar = failed_csharp_analysis(analyzed=True, parsed=True)
        self.assertIsNone(normalize_csharp_analysis(json.dumps(parsed_without_supported_grammar)))

        wrong_using = json.loads(json.dumps(EXPECTED_ANALYSIS))
        wrong_using["usings"] = ["Other"]
        self.assertIsNone(normalize_csharp_analysis(json.dumps(wrong_using)))


if __name__ == "__main__":
    unittest.main()
