from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Дозволяємо крос-доменні запити

@app.route('/api/hello', methods=['GET'])
def hello():
    """Простий маршрут, який повертає привітання"""
    return jsonify({
        "message": "Привіт від Python-сервісу!",
        "status": "success"
    })

@app.route('/api/echo', methods=['POST'])
def echo():
    """Маршрут, який повертає дані, які були надіслані"""
    data = request.json
    return jsonify({
        "message": "Отримані дані",
        "data": data,
        "status": "success"
    })

if __name__ == '__main__':
    # Порт можна змінити на потрібний вам
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)