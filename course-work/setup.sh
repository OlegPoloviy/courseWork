#!/bin/bash

if [ ! -d "venv" ]; then
    echo "Creating venv..."
    python3 -m venv venv
fi

# Активація віртуального середовища
echo "Activating venv..."
source venv/bin/activate

# Встановлення залежностей
echo "Installing dependancies..."
pip install -r requirements.txt

echo "Venv created!"
echo "Run app - python3 server.py"