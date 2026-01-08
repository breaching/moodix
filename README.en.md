# Moodix - Self-hosted CBT Journal

A web application for a **digital journal** for Cognitive Behavioral Therapy (CBT).

> **Medical Disclaimer**
>
> This application is **NOT a medical tool**. It serves solely as a **digital notebook** to help patients track their thoughts, emotions, and behaviors as part of a CBT program **under professional supervision**.

[Lire en Français](README.md)

![Dashboard Overview](screenshots/dashboard.png)

## Features

### Daily Tracking
- **Sleep**: Sleep cycles with visual history
- **Activities**: Hourly journal with pleasure/mastery/satisfaction scores
- **Mood**: Daily evaluation (0-10)
- **Consumables**: Customizable tracking (exercise, caffeine, medication...)

![Daily Tracking Interface](screenshots/daily.png)

### CBT Cycles (Vicious Cycles)
- Structured analysis of automatic thoughts
- Documentation: situations, emotions, thoughts, behaviors, consequences

![CBT Cycles Editor](screenshots/cbt_cycles.png)

### Analysis & Statistics
- Evolution charts (sleep, mood)
- Top activities by pleasure score
- Weekly statistics

### Interface
- Dark/Light mode
- 5 color themes
- Mobile-first responsive design
- Fluid animations

### Advanced Features
- Programmable browser notifications
- Real-time auto-save + offline mode
- Customizable PDF export
- JSON Import/Export
- Multi-user with admin management

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+ (for frontend build)

### Installation

```bash
# Clone the repository
git clone https://github.com/breaching/moodix.git
cd moodix

# Backend
pip install -r requirements.txt

# Frontend (optional - dist/ is already included)
npm install
npm run build

# Start the server
python serv.py
```

Now you can access the application at `http://localhost:5000`.

**Default credentials**: `admin` / `admin`

**IMPORTANT: Change the default password immediately!**

## Configuration

### Change Password

To change the default password, run the `hash_password.py` script and replace the `APP_PASSWORD_HASH` in your `.env` file.

```bash
python hash_password.py YourStrongPassword
# Copy the generated hash
```

### Environment Variables

Create a `.env` file in the root directory by copying the `.env.example` file.

```env
FLASK_ENV=production
APP_USERNAME=your_username
APP_PASSWORD_HASH=<paste_the_generated_hash_here>
SECRET_KEY=<a_random_64_chars_key>
```

To generate a secure `SECRET_KEY`, you can use the following command:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Project Structure

```
moodix/
├── src/                    # React/TypeScript source code
│   ├── components/         # React Components
│   ├── stores/             # Zustand Stores
│   ├── api/                # API Client
│   └── utils/              # Utilities
├── dist/                   # Frontend build (generated)
├── serv.py                 # Flask Server
├── requirements.txt        # Python Dependencies
├── package.json            # Node.js Dependencies
├── .env.example            # Configuration Template
├── hash_password.py        # Hash Generator
├── start.bat               # Windows Start Script
└── start.sh                # Linux/Mac Start Script
```

## Technologies Used

- **Backend**: Flask, SQLAlchemy, bcrypt
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand
- **Database**: SQLite
- **Build Tool**: Vite

## Production Deployment

For production, it is recommended to use a proper WSGI server like Gunicorn or Waitress.

### WSGI Server

**Linux/Mac (Gunicorn)**:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 serv:app
```

**Windows (Waitress)**:
```bash
pip install waitress
waitress-serve --port=5000 serv:app
```

### Reverse Proxy (Example with Nginx)

Using a reverse proxy like Nginx is recommended to handle HTTPS, serve static files, and provide an additional layer of security.

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration (e.g., with Let's Encrypt)
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

## Security

**Implemented Features**:
- Rate limiting on login attempts
- Input validation
- CSRF protection
- Secure session cookies
- SQL Injection protection (via ORM)
- Password hashing (bcrypt)

**To be configured by the administrator**:
- HTTPS/SSL (e.g., using Let's Encrypt)
- Firewall rules
- Automated backups

## License

This project is under the MIT License. See the `LICENSE` file for details.
