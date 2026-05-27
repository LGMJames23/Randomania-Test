import random

from db import get_db


def add_random_score(session_id: str) -> dict:
    score_delta = random.randint(1, 10)
    with get_db() as conn:
        row = conn.execute(
            "SELECT score FROM user_scores WHERE session_id = ?",
            (session_id,),
        ).fetchone()

        if row is None:
            new_score = score_delta
            conn.execute(
                "INSERT INTO user_scores (session_id, score) VALUES (?, ?)",
                (session_id, new_score),
            )
        else:
            new_score = int(row["score"]) + score_delta
            conn.execute(
                "UPDATE user_scores SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
                (new_score, session_id),
            )

    return {
        "session_id": session_id,
        "delta": score_delta,
        "score": new_score,
    }


def get_score(session_id: str) -> dict:
    with get_db() as conn:
        row = conn.execute(
            "SELECT score FROM user_scores WHERE session_id = ?",
            (session_id,),
        ).fetchone()

    return {
        "session_id": session_id,
        "score": int(row["score"]) if row else 0,
    }
