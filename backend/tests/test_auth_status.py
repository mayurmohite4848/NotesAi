import unittest
import os
from backend.app import create_app

class TestAuthStatusEndpoint(unittest.TestCase):
    def setUp(self):
        self.app = create_app({"TESTING": True})
        self.client = self.app.test_client()

    def test_auth_status_without_token(self):
        res = self.client.get("/api/auth/status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("supabase_jwt_configured", data)
        self.assertIn("jwt_secret_length", data)
        self.assertIn("auth_mode", data)

    def test_auth_status_with_token(self):
        res = self.client.get("/api/auth/status", headers={"Authorization": "Bearer invalid.token.payload"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("token_verification", data)
        self.assertFalse(data["token_verification"]["valid"])

if __name__ == "__main__":
    unittest.main()
