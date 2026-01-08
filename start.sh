#!/bin/bash
echo "=========================================="
echo "Journal App - Starting..."
echo "=========================================="
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed (check for Flask)
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt --quiet
    echo
else
    echo "Dependencies already installed."
    echo
fi

# Create necessary directories
mkdir -p logs
mkdir -p instance
mkdir -p backups
mkdir -p flask_session

# Check if .env exists
if [ ! -f ".env" ]; then
    echo
    echo "WARNING: .env file not found!"
    echo "Please create .env file from .env.example"
    echo "Run: cp .env.example .env"
    echo "Then generate password hash: python3 hash_password.py YourPassword"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

# Run the app
echo "Starting server..."
echo
python3 serv.py

read -p "Press Enter to exit..."
