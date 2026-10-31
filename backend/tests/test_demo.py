import unittest
import json
import tempfile
import os
import sys

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.db import init_db, get_all_notes, get_all_notebooks

class TestDemoRoutes(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        self.upload_dir = tempfile.mkdtemp()
        init_db(self.db_path)

        self.app = create_app({
            "TESTING": True,
            "DATABASE_PATH": self.db_path,
            "UPLOAD_FOLDER": self.upload_dir
        })
        self.client = self.app.test_client()

    def tearDown(self):
        try:
            os.close(self.db_fd)
            os.unlink(self.db_path)
        except Exception:
            pass

    def test_seed_demo_samples(self):
        """Tests that POST /api/demo/seed populates notes with LaTeX/Mermaid and a multi-page notebook."""
        res = self.client.post("/api/demo/seed")
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["notes"]), 2)
        self.assertIn("notebook", data)
        self.assertEqual(data["notebook"]["page_count"], 3)

        # Verify notes are queryable in SQLite
        notes = get_all_notes(db_path=self.db_path)
        self.assertGreaterEqual(len(notes), 2)
        math_note = next((n for n in notes if "Mathematical Foundations" in n["title"]), None)
        self.assertIsNotNone(math_note)
        self.assertIn("Bayes' Theorem", math_note["content"])
        self.assertIn("$P(A|B)", math_note["content"])

        # Verify multi-page notebook
        notebooks = get_all_notebooks(db_path=self.db_path)
        self.assertEqual(len(notebooks), 1)
        self.assertEqual(notebooks[0]["page_count"], 3)

    def test_idempotent_reseed(self):
        """Tests that calling /api/demo/seed multiple times replaces samples cleanly without duplicate explosion."""
        self.client.post("/api/demo/seed")
        res2 = self.client.post("/api/demo/seed")
        self.assertEqual(res2.status_code, 201)
        
        notes = get_all_notes(db_path=self.db_path)
        demo_notes = [n for n in notes if "demo" in n.get("tags", [])]
        self.assertEqual(len(demo_notes), 2)

    def test_clear_demo_samples(self):
        """Tests that DELETE /api/demo/clear cleanly removes demo notes and notebooks."""
        self.client.post("/api/demo/seed")
        res = self.client.delete("/api/demo/clear")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])

        notes = get_all_notes(db_path=self.db_path)
        demo_notes = [n for n in notes if "demo" in n.get("tags", [])]
        self.assertEqual(len(demo_notes), 0)

        notebooks = get_all_notebooks(search="Deep Learning & Neural Network Foundations", db_path=self.db_path)
        self.assertEqual(len(notebooks), 0)

if __name__ == "__main__":
    unittest.main()
