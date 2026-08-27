#!/usr/bin/env python3
"""Authentic and adversarial checks for the private C++ analyzer."""

from __future__ import annotations

import shutil
import tempfile
import time
import unittest
from pathlib import Path

import CppCollectionsAnalyzer as analyzer


FIXTURE = Path(__file__).parent / "fixtures" / "cpp-collections-reference.cpp.txt"
EXPECTED_KEYS = {
    "version",
    "profile",
    "analyzed",
    "parsed",
    "authored_frame",
    "part_record",
    "restock",
    "total_units",
    "low_stock",
    "supplied_harness",
}


class CppCollectionsAnalyzerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not Path(analyzer.CLANG).exists():
            local_clang = shutil.which("clang++")
            if local_clang is None:
                raise unittest.SkipTest("Clang is required for analyzer tests")
            analyzer.CLANG = local_clang
        cls.reference = FIXTURE.read_text(encoding="utf-8")

    def analyze_bytes(self, content: bytes) -> dict[str, object]:
        with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False) as temporary:
            temporary.write(content)
            path = Path(temporary.name)
        try:
            return analyzer.analyze(path)
        finally:
            path.unlink(missing_ok=True)

    def analyze_text(self, source: str) -> dict[str, object]:
        return self.analyze_bytes(source.encode("utf-8"))

    def assert_rejected(self, source: str) -> None:
        result = self.analyze_text(source)
        self.assertTrue(result["analyzed"])
        self.assertFalse(all(result[fact] for fact in analyzer.FACTS))

    def test_authentic_source_has_exact_closed_envelope_and_all_facts(self) -> None:
        started = time.monotonic()
        result = self.analyze_text(self.reference)
        duration = time.monotonic() - started

        self.assertEqual(set(result), EXPECTED_KEYS)
        self.assertEqual(result["version"], 1)
        self.assertEqual(result["profile"], analyzer.PROFILE)
        self.assertTrue(result["analyzed"])
        self.assertTrue(result["parsed"])
        self.assertTrue(all(result[fact] for fact in analyzer.FACTS))
        self.assertLess(duration, analyzer.CLANG_TIMEOUT_SECONDS)

    def test_comments_and_formatting_can_vary(self) -> None:
        source = self.reference.replace(
            "struct Part {",
            "// The record remains the same.\nstruct   Part/* stock row */ {",
        ).replace(
            "part.quantity = part.quantity + amount;",
            "part.quantity\n= part.quantity /* old */ + amount;",
        )
        result = self.analyze_text(source)
        self.assertTrue(all(result[fact] for fact in analyzer.FACTS))

    def test_hardcoded_output_is_rejected(self) -> None:
        main_offset = self.reference.index("int main()")
        source = self.reference[:main_offset] + """int main() {
            std::cout << "Parts: 3\\nTotal units: 17\\nLow stock: seals\\n";
            return 0;
        }
        """
        self.assert_rejected(source)

    def test_comment_only_decoy_is_rejected(self) -> None:
        source = self.reference.replace(
            "total = total + part.quantity;",
            "// total = total + part.quantity;\ntotal = 17;",
        )
        result = self.analyze_text(source)
        self.assertFalse(result["total_units"])
        self.assertFalse(result["authored_frame"])

    def test_unreachable_required_code_is_rejected(self) -> None:
        source = self.reference.replace(
            "part.quantity = part.quantity + amount;",
            "return;\npart.quantity = part.quantity + amount;",
        )
        self.assert_rejected(source)

    def test_behavior_alias_is_rejected(self) -> None:
        source = self.reference.replace(
            "part.quantity = part.quantity + amount;",
            "part.quantity += amount;",
        )
        result = self.analyze_text(source)
        self.assertFalse(result["restock"])
        self.assertFalse(result["authored_frame"])

    def test_moved_harness_statement_is_rejected(self) -> None:
        first = '    restock(parts, "bolts", 3);\n'
        source = self.reference.replace(first, "").replace(
            '    restock(parts, "cables", 1);\n',
            '    restock(parts, "cables", 1);\n' + first,
        )
        result = self.analyze_text(source)
        self.assertFalse(result["supplied_harness"])
        self.assertFalse(result["authored_frame"])

    def test_extra_function_and_duplicate_decoy_are_rejected(self) -> None:
        source = self.reference + "\nint decoy() { return 17; }\n"
        result = self.analyze_text(source)
        self.assertFalse(result["authored_frame"])
        duplicate = self.reference.replace(
            "int main() {",
            "int total_units(std::vector<Part> parts) { return 17; }\nint main() {",
        )
        self.assert_rejected(duplicate)

    def test_macros_pragmas_and_malformed_source_are_rejected(self) -> None:
        macro = "#define amount hidden_amount\n" + self.reference
        self.assert_rejected(macro)
        pragma = "#pragma clang diagnostic ignored \"-Wall\"\n" + self.reference
        self.assert_rejected(pragma)
        malformed = self.reference.replace("int main() {", "int main( {")
        result = self.analyze_text(malformed)
        self.assertTrue(result["analyzed"])
        self.assertFalse(result["parsed"])
        self.assertFalse(any(result[fact] for fact in analyzer.FACTS))

    def test_encoding_confusion_and_source_bounds_are_rejected(self) -> None:
        for content in (
            b"\xef\xbb\xbf" + self.reference.encode("utf-8"),
            self.reference.encode("utf-8") + b"\x00",
            b"\xff\xfe" + self.reference.encode("utf-8"),
            b" " * (analyzer.MAX_SOURCE_BYTES + 1),
        ):
            result = self.analyze_bytes(content)
            self.assertTrue(result["analyzed"])
            self.assertFalse(result["parsed"])
            self.assertFalse(any(result[fact] for fact in analyzer.FACTS))


if __name__ == "__main__":
    unittest.main()
