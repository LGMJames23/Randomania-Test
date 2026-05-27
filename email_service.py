import smtplib
from email.message import EmailMessage

from config import Config


def send_suggestion_email(suggestion_text: str, submitted_by: str) -> None:
    if not Config.smtp_configured():
        raise RuntimeError(
            "SMTP is not fully configured. Set SMTP_* and SUGGESTION_RECIPIENTS in .env."
        )

    msg = EmailMessage()
    msg["Subject"] = "Randomania Suggestion Submission"
    msg["From"] = Config.SMTP_FROM
    msg["To"] = ", ".join(Config.SUGGESTION_RECIPIENTS)
    msg.set_content(
        f"Randomania suggestion received.\n\n"
        f"Submitted by: {submitted_by}\n\n"
        f"Suggestion:\n{suggestion_text}\n"
    )

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=20) as smtp:
        if Config.SMTP_USE_TLS:
            smtp.starttls()
        smtp.login(Config.SMTP_USER, Config.SMTP_PASS)
        smtp.send_message(msg)
