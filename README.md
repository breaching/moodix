# Moodix

## Journal TCC auto-heberge

Application web de **journal numerique** pour la Therapie Cognitive Comportementale (TCC).

> **Avertissement Medical**
>
> Cette application n'est **PAS un outil medical**. Elle sert uniquement de **carnet numerique** pour aider les patients a suivre leurs pensees, emotions et comportements dans le cadre d'un programme TCC **sous supervision professionnelle**.

## Fonctionnalites

### Suivi Quotidien
- **Sommeil** : Cycles de sommeil avec historique visuel
- **Activites** : Journal par plage horaire avec scores plaisir/maitrise/satisfaction
- **Humeur** : Evaluation quotidienne (0-10)
- **Consommables** : Tracking personnalisable (exercice, cafeine, medicaments...)

### Cercles Vicieux (Cycles TCC)
- Analyse structuree des pensees automatiques
- Documentation : situations, emotions, pensees, comportements, consequences

### Analyse & Statistiques
- Graphiques d'evolution (sommeil, humeur)
- Top activites par score de plaisir
- Statistiques hebdomadaires

### Interface
- Mode sombre/clair
- 5 themes de couleurs
- Design responsive mobile-first
- Animations fluides

### Fonctionnalites Avancees
- Notifications navigateur programmables
- Auto-sauvegarde temps reel + mode hors ligne
- Export PDF personnalisable
- Import/Export JSON
- Multi-utilisateurs avec gestion admin

## Demarrage Rapide

### Prerequis
- Python 3.8+
- Node.js 18+ (pour le build frontend)

### Installation

```bash
# Cloner le repository
git clone https://github.com/YOUR_USERNAME/moodix.git
cd moodix

# Backend
pip install -r requirements.txt

# Frontend (optionnel - dist/ est deja inclus)
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
