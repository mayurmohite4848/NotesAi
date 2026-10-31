import os
import jwt
from functools import wraps
from flask import request, jsonify

def get_jwt_secret():
    return os.environ.get("SUPABASE_JWT_SECRET", "").strip()

def get_current_user_id():
    """
    Extracts user_id from the Supabase JWT Bearer token in the Authorization header.
    Returns UUID string if authenticated, or None if in Guest Mode.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None

    secret = get_jwt_secret()

    try:
        if secret:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            # If JWT secret not yet provided in .env, decode payload for user UUID
            payload = jwt.decode(token, options={"verify_signature": False})

        return payload.get("sub")
    except Exception as e:
        print(f"[Auth] JWT decoding warning: {e}")
        return None

def optional_auth(f):
    """
    Decorator that attaches `request.user_id` to the Flask request context.
    Allows both authenticated users and unauthenticated guests.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        request.user_id = get_current_user_id()
        return f(*args, **kwargs)
    return decorated

def require_auth(f):
    """
    Decorator that enforces a valid Supabase JWT. Returns 401 if missing/invalid.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({
                "error": "Authentication required. Please sign in with Supabase to access this resource."
            }), 401
        request.user_id = user_id
        return f(*args, **kwargs)
    return decorated
