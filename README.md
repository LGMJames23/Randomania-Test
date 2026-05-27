# Randomania Backend (Testing Server)

This backend provides:

- Suggestion submission + storage in SQLite
- Suggestion email delivery to:
  - `143994@mtsd.org`
  - `thaguy10113519@outlook.com`
- Random score feature (`+1` to `+10` each interaction)
- Placeholder auth endpoints for future username/password implementation

## 1) Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Configure environment

Copy `.env.example` to `.env` and fill SMTP values:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SUGGESTION_RECIPIENTS` (already set to both requested emails)

If SMTP is not configured, suggestions are still saved in DB, but email sending will fail and return `email_sent: false`.

## 3) Run

```bash
python app.py
```

Server defaults to `http://localhost:5000`.

To verify outbound email quickly:

```bash
python send_test_email.py
```

## 4) API quick test

### Health
`GET /health`

### Submit suggestion
`POST /api/suggestions`

Body:
```json
{
  "text": "Add daily challenges",
  "submitted_by": "Guest"
}
```

### Add random score on user interaction
`POST /api/interactions`

Body (optional):
```json
{
  "session_id": "browser-session-123"
}
```

If `session_id` is omitted, one is generated and returned.

## Frontend integration note

`script.js` is already wired to call this backend on:
- suggestion submit (`/api/suggestions`)
- button/screen interactions (`/api/interactions`)

If your API is hosted somewhere else, set:

```html
<script>
  window.RANDOMANIA_API_BASE_URL = "https://your-testing-server.example.com";
</script>
```

before loading `script.js`.

### Get current score
`GET /api/scores/<session_id>`

### Auth placeholders
- `POST /api/auth/signup` -> 501
- `POST /api/auth/login` -> 501
