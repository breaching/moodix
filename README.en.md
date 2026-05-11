# Moodix - Self-hosted CBT Journal

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![React](https://img.shields.io/badge/react-18-61dafb)
![Self-hosted](https://img.shields.io/badge/deploy-self--hosted-purple)
![Bilingual](https://img.shields.io/badge/i18n-FR%20%2F%20EN-1F6FEB)

Bilingual (FR/EN) web app for digital Cognitive Behavioral Therapy journaling. Designed to be self-hosted by the patient or practitioner.

[Lire en français](README.md)

> **Medical disclaimer.** This is not a medical tool. It's a digital notebook to help a patient track thoughts, emotions, and behaviors as part of a CBT program under professional supervision. No automated clinical analysis is produced.

![Dashboard overview](screenshots/dashboard.png)

## Why this project

Commercial CBT apps centralize highly sensitive data with third parties. Moodix deploys on your own infrastructure (VPS, homelab, Raspberry Pi). Data stays with the user, in a local SQLite file.

## What makes it different

- **Data sovereignty**: everything lives in a local SQLite file on your infrastructure. No outbound calls, no telemetry, no SaaS in the middle.
- **Network-tolerant auto-save**: writes are queued in `localStorage` when the network is down, replayed when it's back. A patient filling their daily log doesn't lose data if the VPN drops mid-session.
- **Multi-user without auth complexity**: separate admin role, bcrypt, Flask-Limiter rate limiting, CSRF protection via `Origin` header check. No SSO, no OAuth.
- **Full CBT model**: not just a mood tracker. Daily tracking (sleep, hourly activities with pleasure/mastery/satisfaction scores, consumables), structured vicious cycles, and evolution charts.

## Features

### Daily tracking

- **Sleep**: cycles with visual history.
- **Activities**: hourly journal (6 a.m. to 2 a.m. next day) with pleasure / mastery / satisfaction scores.
- **Mood**: daily evaluation (0 to 10).
- **Consumables**: configurable tracking (exercise, caffeine, medication, custom).

![Daily tracking interface](screenshots/daily.png)

### CBT cycles

Structured analysis of automatic thoughts: situation, emotions, thoughts, behaviors, consequences.

![CBT cycles editor](screenshots/cbt_cycles.png)

### Analysis

- Sleep and mood evolution charts.
- Top activities by pleasure score.
- Weekly statistics.

### Interface

- Dark and light mode.
- 5 color themes (violet, blue, green, rose, orange).
- Mobile-first responsive.
- Bilingual FR/EN (auto-detected via `navigator.language`).

### Robustness

- Network-tolerant auto-save: writes are queued in `localStorage`, replayed when the network is back.
- Multi-user with separate admin role.
- Customizable PDF export (`reportlab`).
- JSON import/export for data portability.

## Quick start

Prerequisites: Python 3.8+ and Node.js 18+ (only to rebuild the frontend, `dist/` is already committed).

```bash
git clone https://github.com/breaching/moodix.git
cd moodix

pip install -r requirements.txt

# Frontend optional, already pre-built
npm install && npm run build

python serv.py
```

App at `http://localhost:5000`.

Default credentials: `admin` / `admin`. Change immediately.

## Configuration

### Change the admin password

```bash
python hash_password.py YourStrongPassword
# Paste the hash in .env (APP_PASSWORD_HASH)
```

### Environment variables

```env
FLASK_ENV=production
APP_USERNAME=your_username
APP_PASSWORD_HASH=<generated_hash>
SECRET_KEY=<random_64_chars>
```

Generate a secure `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Security

Implemented in code:

- bcrypt password hashing.
- Login rate limiting (`Flask-Limiter`).
- Input sanitization (`bleach`).
- CSRF protection via `Origin` header check.
- Secure session cookies.
- SQLAlchemy ORM against SQL injection.

To configure on the admin side:

- TLS via Let's Encrypt and a reverse proxy.
- Firewall.
- Regular SQLite backups.

## Production deployment

WSGI server:

```bash
# Linux / Mac
gunicorn -w 4 -b 0.0.0.0:5000 serv:app

# Windows
waitress-serve --port=5000 serv:app
```

Nginx reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Tech stack

- **Backend**: Flask 3, SQLAlchemy, bcrypt, Flask-Limiter, bleach, reportlab.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, Vite.
- **Database**: SQLite.

## Project status

Personal project, maintained irregularly. Issues and PRs welcome, no SLA on responses. For serious clinical use, verify applicable regulatory compliance in your jurisdiction (GDPR, health-data hosting, etc.).

## License

MIT, see [LICENSE](LICENSE).
