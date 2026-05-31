import unittest
import uuid as uuid_mod
from sync_writings import generate_uid


class TestGenerateUid(unittest.TestCase):

    def test_returns_valid_uuid4_string(self):
        uid = generate_uid(set())
        parsed = uuid_mod.UUID(uid)
        self.assertEqual(parsed.version, 4)

    def test_returns_different_values_on_successive_calls(self):
        used = set()
        uids = {generate_uid(used) for _ in range(100)}
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
