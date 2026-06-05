import unittest
from sync_writings import generate_uid, parse_semicolon_values


class TestParseSemicolonValues(unittest.TestCase):

    def test_basic_semicolon_split(self):
        values, warnings = parse_semicolon_values("a; b; c")
        self.assertEqual(values, ["a", "b", "c"])
        self.assertEqual(warnings, [])

    def test_quoted_values_have_quotes_stripped(self):
        values, warnings = parse_semicolon_values('"Review: Movies"; "Books"')
        self.assertEqual(values, ["Review: Movies", "Books"])
        self.assertEqual(warnings, [])

    def test_mixed_quoted_and_unquoted(self):
        values, warnings = parse_semicolon_values('unquoted; "quoted: value"')
        self.assertEqual(values, ["unquoted", "quoted: value"])
        self.assertEqual(warnings, [])

    def test_empty_input(self):
        values, warnings = parse_semicolon_values("")
        self.assertEqual(values, [])
        self.assertEqual(warnings, [])

    def test_single_value_no_delimiter(self):
        values, warnings = parse_semicolon_values("single_value")
        self.assertEqual(values, ["single_value"])
        self.assertEqual(warnings, [])

    def test_empty_value_is_dropped_with_warning(self):
        values, warnings = parse_semicolon_values('""', "tags")
        self.assertEqual(values, [])
        self.assertEqual(warnings, ["empty value at position 1 in \\tags"])

    def test_unclosed_quote_emits_warning(self):
        values, warnings = parse_semicolon_values('"unclosed', "tags")
        self.assertEqual(values, ['"unclosed'])
        self.assertEqual(warnings, ["unclosed quote in \\tags"])

    def test_double_wrapped_quotes_strip_once(self):
        values, warnings = parse_semicolon_values('""abc""')
        self.assertEqual(values, ['"abc"'])
        self.assertEqual(warnings, [])

    def test_single_bare_quote_is_empty_with_warning(self):
        values, warnings = parse_semicolon_values('"')
        self.assertEqual(values, [])
        self.assertEqual(warnings, ["unclosed quote in \\field"])

    def test_two_quotes_around_nothing_is_empty_with_warning(self):
        values, warnings = parse_semicolon_values('""')
        self.assertEqual(values, [])
        self.assertEqual(warnings, ["empty value at position 1 in \\field"])

    def test_leading_quote_only_not_stripped(self):
        values, warnings = parse_semicolon_values('"abc')
        self.assertEqual(values, ['"abc'])
        self.assertEqual(warnings, ["unclosed quote in \\field"])

    def test_trailing_quote_only_not_stripped(self):
        values, warnings = parse_semicolon_values('abc"')
        self.assertEqual(values, ['abc"'])
        self.assertEqual(warnings, [])

    def test_semicolon_inside_quotes_is_not_delimiter(self):
        values, warnings = parse_semicolon_values('a; "b; c"')
        self.assertEqual(values, ["a", "b; c"])
        self.assertEqual(warnings, [])

    def test_unclosed_quote_after_closed_quote(self):
        values, warnings = parse_semicolon_values('"ok"; "unclosed', "tags")
        self.assertEqual(values, ["ok", '"unclosed'])
        self.assertEqual(warnings, ["unclosed quote in \\tags"])

    def test_field_name_appears_in_warning(self):
        _, warnings = parse_semicolon_values('""', "related")
        self.assertEqual(warnings, ["empty value at position 1 in \\related"])


class TestGenerateUid(unittest.TestCase):

    def test_returns_smallest_positive_integer(self):
        uid = generate_uid(set())
        self.assertEqual(uid, 1)

    def test_returns_different_values_on_successive_calls(self):
        used = set()
        uids = set()
        for _ in range(100):
            uid = generate_uid(used)
            uids.add(uid)
            used.add(uid)
        self.assertEqual(len(uids), 100)

    def test_skips_used_uids(self):
        first = generate_uid(set())
        used = {first}
        second = generate_uid(used)
        self.assertNotEqual(second, first)

    def test_skips_multiple_used_uids(self):
        used = set()
        generated = []
        for _ in range(10):
            uid = generate_uid(used)
            used.add(uid)
            generated.append(uid)
        self.assertEqual(len(generated), 10)
        self.assertEqual(len(set(generated)), 10)


if __name__ == '__main__':
    unittest.main()
