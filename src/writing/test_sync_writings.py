import unittest
import tempfile
from pathlib import Path
from sync_writings import generate_uid, parse_semicolon_values, parse_txt


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


class TestParseTxtFootnote(unittest.TestCase):

    def _write_txt(self, content):
        """Write content to a temporary .txt file and return its path."""
        tmp = tempfile.NamedTemporaryFile(
            mode='w', suffix='.txt', delete=False, encoding='utf-8'
        )
        tmp.write(content)
        tmp.close()
        return Path(tmp.name)

    def test_single_line_footnote(self):
        fp = self._write_txt(
            '\\UID: 1\n'
            '\\Title: Test\n'
            '\\footnote: This is a footnote.\n'
            'Body content here.'
        )
        result = parse_txt(fp)
        uid, title, tags, related, date_published, summary, subtitle, footnote, content, warnings = result
        self.assertEqual(footnote, 'This is a footnote.')
        self.assertEqual(content, 'Body content here.')

    def test_footnote_with_quotes(self):
        fp = self._write_txt(
            '\\UID: 2\n'
            '\\Title: Test\n'
            '\\footnote: "This is a quoted footnote."\n'
            'Body content here.'
        )
        result = parse_txt(fp)
        footnote = result[7]
        self.assertEqual(footnote, 'This is a quoted footnote.')

    def test_no_footnote_returns_none(self):
        fp = self._write_txt(
            '\\UID: 3\n'
            '\\Title: Test\n'
            'Body content here.'
        )
        result = parse_txt(fp)
        footnote = result[7]
        self.assertIsNone(footnote)

    def test_empty_footnote_returns_none(self):
        fp = self._write_txt(
            '\\UID: 4\n'
            '\\Title: Test\n'
            '\\footnote:\n'
            'Body content here.'
        )
        result = parse_txt(fp)
        footnote = result[7]
        self.assertIsNone(footnote)

    def test_footnote_with_markdown(self):
        fp = self._write_txt(
            '\\UID: 5\n'
            '\\Title: Test\n'
            '\\footnote: See [this link](https://example.com) for more.\n'
            'Body content here.'
        )
        result = parse_txt(fp)
        footnote = result[7]
        self.assertEqual(footnote, 'See [this link](https://example.com) for more.')


class TestWritingJsonFieldNames(unittest.TestCase):
    """Verify writing.json uses lowercase id/body that HighlightComponent expects."""

    def test_writing_json_uses_uppercase_UID_and_Body(self):
        import json
        data_path = Path(__file__).resolve().parent.parent / 'data' / 'writing.json'
        if not data_path.exists():
            self.skipTest('writing.json not found')
        data = json.loads(data_path.read_text(encoding='utf-8'))
        for entry in data:
            self.assertIn('UID', entry, f'Entry missing "UID" field: {entry.get("Title")}')
            self.assertNotIn('id', entry, f'Entry uses "id" instead of "UID": {entry.get("Title")}')
            self.assertIn('Body', entry, f'Entry missing "Body" field: {entry.get("Title")}')
            self.assertNotIn('body', entry, f'Entry uses "body" instead of "Body": {entry.get("Title")}')
            self.assertIsInstance(entry['UID'], int, f'Entry "UID" should be int: {entry.get("Title")}')
            self.assertIsInstance(entry['Body'], str, f'Entry "Body" should be str: {entry.get("Title")}')

    def test_writing_json_entries_have_required_fields(self):
        import json
        data_path = Path(__file__).resolve().parent.parent / 'data' / 'writing.json'
        if not data_path.exists():
            self.skipTest('writing.json not found')
        data = json.loads(data_path.read_text(encoding='utf-8'))
        required = ['UID', 'Title', 'tags', 'Date', 'Body', 'datePublished']
        for entry in data:
            for field in required:
                self.assertIn(field, entry, f'Entry {entry.get("UID")} missing "{field}"')


if __name__ == '__main__':
    unittest.main()
