"""
Placeholder module for future username/password implementation.

Planned approach:
- Store user records in DB with unique username.
- Store password hashes only (bcrypt/argon2), never plaintext.
- Add signup/login endpoints that return session/token data.
"""


def not_implemented_response():
    return {
        "ok": False,
        "message": "Username/password auth not implemented yet. Use this module as your starting point.",
    }, 501
