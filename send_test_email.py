from dotenv import load_dotenv

from email_service import send_suggestion_email


if __name__ == "__main__":
    load_dotenv()
    send_suggestion_email(
        suggestion_text="Test email from Randomania backend.",
        submitted_by="Backend Test",
    )
    print("Test email sent.")
