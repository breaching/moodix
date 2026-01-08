# Moodix

## Journal TCC auto-hébergé

Application web de **journal numérique** pour la Thérapie Cognitive Comportementale (TCC).

> **Avertissement Médical**
>
> Cette application n'est **PAS un outil médical**. Elle sert uniquement de **carnet numérique** pour aider les patients à suivre leurs pensées, émotions et comportements dans le cadre d'un programme TCC **sous supervision professionnelle**.

![Aperçu du Tableau de Bord](screenshots/dashboard.png)

## Fonctionnalités

### Suivi Quotidien
- **Sommeil** : Cycles de sommeil avec historique visuel
- **Activités** : Journal par plage horaire avec scores plaisir/maîtrise/satisfaction
- **Humeur** : Évaluation quotidienne (0-10)
- **Consommables** : Tracking personnalisable (exercice, caféine, médicaments...)

![Interface de Suivi Quotidien](screenshots/daily.png)

### Cercles Vicieux (Cycles TCC)
- Analyse structurée des pensées automatiques
- Documentation : situations, émotions, pensées, comportements, conséquences

![Éditeur de Cercles Vicieux](screenshots/cbt_cycles.png)

### Analyse & Statistiques
- Graphiques d'évolution (sommeil, humeur)
- Top activités par score de plaisir
- Statistiques hebdomadaires

### Interface
- Mode sombre/clair
- 5 thèmes de couleurs
- Design responsive mobile-first
- Animations fluides

### Fonctionnalités Avancées
- Notifications navigateur programmables
- Auto-sauvegarde temps réel + mode hors ligne
- Export PDF personnalisable
- Import/Export JSON
- Multi-utilisateurs avec gestion admin

## Démarrage Rapide

### Prérequis
- Python 3.8+
- Node.js 18+ (pour le build frontend)

### Installation

```bash
# Cloner le repository (exemple)
git clone https://github.com/breaching/moodix.git
cd moodix

# Backend
pip install -r requirements.txt

# Frontend (optionnel - dist/ est déjà inclus)
npm install
npm run build

# Lancer
python serv.py
```

Acces : `http://localhost:5000`

**Identifiants par defaut** : `admin` / `admin`

**A CHANGER IMMEDIATEMENT !**

## Configuration

### Changer le mot de passe

```bash
python hash_password.py VotreMotDePasseFort
# Copier le hash dans .env
```

### Variables d'environnement (.env)

```env
FLASK_ENV=production
APP_USERNAME=votre_username
APP_PASSWORD_HASH=<hash_genere>
SECRET_KEY=<cle_aleatoire_64_chars>
```

Generer SECRET_KEY :
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Structure du Projet

```
moodix/
├── src/                    # Code source React/TypeScript
│   ├── components/         # Composants React
│   ├── stores/             # Stores Zustand
│   ├── api/                # Client API
│   └── utils/              # Utilitaires
├── dist/                   # Build frontend (genere)
├── serv.py                 # Serveur Flask
├── requirements.txt        # Dependances Python
├── package.json            # Dependances Node.js
├── .env.example            # Template configuration
├── hash_password.py        # Generateur de hash
├── start.bat               # Script demarrage Windows
└── start.sh                # Script demarrage Linux/Mac
```

## Technologies

- **Backend** : Flask, SQLAlchemy, bcrypt
- **Frontend** : React 18, TypeScript, Tailwind CSS, Zustand
- **Base de donnees** : SQLite
- **Build** : Vite

## Deploiement Production

### Serveur WSGI

**Linux/Mac (Gunicorn)** :
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 serv:app
```

**Windows (Waitress)** :
```bash
pip install waitress
waitress-serve --port=5000 serv:app
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Securite

**Implemente** :
- Rate limiting (5 tentatives login / 15min)
- Validation des entrees
- Protection CSRF
- Cookies de session securises
- Protection injection SQL (ORM)
- Hachage mots de passe (bcrypt)

**A configurer** :
- HTTPS/SSL (Let's Encrypt)
- Pare-feu
- Sauvegardes automatisees

## License

MIT License - Voir fichier LICENSE

---

# English Version

## Self-hosted CBT Journal

Web application for a **digital journal** for Cognitive Behavioral Therapy (CBT).

> **Medical Disclaimer**
>
> This application is **NOT a medical tool**. It serves solely as a **digital notebook** to help patients track their thoughts, emotions, and behaviors as part of a CBT program **under professional supervision**.

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

![Charts and Statistics](screenshots/stats.png)

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

# Start
python serv.py
```

Access: `http://localhost:5000`

**Default credentials**: `admin` / `admin`

**CHANGE IMMEDIATELY!**

## Configuration

### Change Password

```bash
python hash_password.py YourStrongPassword
# Copy the hash into .env
```

### Environment Variables (.env)

```env
FLASK_ENV=production
APP_USERNAME=your_username
APP_PASSWORD_HASH=<generated_hash>
SECRET_KEY=<random_64_chars_key>
```

Generate SECRET_KEY:
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

## Technologies

- **Backend**: Flask, SQLAlchemy, bcrypt
- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand
- **Database**: SQLite
- **Build**: Vite

## Production Deployment

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

## Security

**Implemented**:
- Rate limiting, Input validation, CSRF Protection, Secure session cookies, SQL Injection protection, Password hashing.

## License

MIT License - See LICENSE file
