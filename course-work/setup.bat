@echo off

IF NOT EXIST venv (
    echo Creating venv...
    python -m venv venv
)

echo Activating venv...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Venv created!
echo Run app - python server.py
