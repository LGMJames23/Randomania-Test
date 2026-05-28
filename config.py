import os
from dotenv import load_dotenv

load_dotenv()


def _as_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    PORT = int(os.getenv("PORT", "5000"))
    DATABASE_PATH = os.getenv("DATABASE_PATH", "./randomania.db")

    SUGGESTION_RECIPIENTS = [
        email.strip()
        for email in os.getenv(
            "SUGGESTION_RECIPIENTS",
            "143994@mtsd.org,thaguy10113519@outlook.com",
        ).split(",")
        if email.strip()
    ]

    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASS = os.getenv("SMTP_PASS", "")
    SMTP_FROM = os.getenv("SMTP_FROM", "")
    SMTP_USE_TLS = _as_bool(os.getenv("SMTP_USE_TLS", "true"), default=True)

    @classmethod
    def smtp_configured(cls) -> bool:
        return bool(
            cls.SMTP_HOST
            and cls.SMTP_PORT
            and cls.SMTP_FROM
            and cls.SUGGESTION_RECIPIENTS
        )
