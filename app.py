import uuid

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from auth_placeholder import not_implemented_response
from config import Config
from db import init_db, get_db
from email_service import send_suggestion_email
from score_service import add_random_score, get_score

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "randomania-backend"})


@app.post("/api/suggestions")
def create_suggestion():
    body = request.get_json(silent=True) or {}
    suggestion_text = str(body.get("text", "")).strip()
    submitted_by = str(body.get("submitted_by", "Anonymous")).strip() or "Anonymous"

    if not suggestion_text:
        return jsonify({"ok": False, "message": "Suggestion text is required."}), 400

    with get_db() as conn:
        conn.execute(
            "INSERT INTO suggestions (submitted_by, suggestion_text) VALUES (?, ?)",
            (submitted_by, suggestion_text),
        )

    email_sent = False
    email_error = None
    try:
        send_suggestion_email(suggestion_text, submitted_by)
        email_sent = True
    except Exception as err:  # noqa: BLE001
        email_error = str(err)

    return jsonify(
        {
            "ok": True,
            "saved": True,
            "email_sent": email_sent,
            "email_error": email_error,
            "recipients": Config.SUGGESTION_RECIPIENTS,
        }
    )


@app.get("/api/suggestions")
def list_suggestions():
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, submitted_by, suggestion_text, created_at
            FROM suggestions
            ORDER BY id DESC
            LIMIT 100
            """
        ).fetchall()

    data = [
        {
            "id": int(row["id"]),
            "submitted_by": row["submitted_by"],
            "text": row["suggestion_text"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]
    return jsonify({"ok": True, "items": data})


@app.post("/api/interactions")
def track_interaction():
    body = request.get_json(silent=True) or {}
    session_id = str(body.get("session_id", "")).strip() or str(uuid.uuid4())
    score_data = add_random_score(session_id)
    return jsonify({"ok": True, **score_data})


@app.get("/api/scores/<session_id>")
def fetch_score(session_id: str):
    if not session_id.strip():
        return jsonify({"ok": False, "message": "session_id is required"}), 400
    return jsonify({"ok": True, **get_score(session_id)})


@app.post("/api/auth/signup")
def signup_placeholder():
    return not_implemented_response()


@app.post("/api/auth/login")
def login_placeholder():
    return not_implemented_response()


@app.post("/api/smtp-test")
def smtp_test():
    body = request.get_json(silent=True) or {}
    test_text = str(body.get("text", "SMTP test from Randomania backend")).strip()
    try:
        send_suggestion_email(test_text, "SMTP Tester")
        return jsonify({"ok": True, "message": "SMTP test email sent."})
    except Exception as err:  # noqa: BLE001
        return jsonify({"ok": False, "message": str(err)}), 500


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=Config.PORT, debug=(Config.PORT == 5000))
