from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import boto3
import torch
import clip
from PIL import Image
import numpy as np
import io
import requests
from typing import List, Dict, Any, Optional, Tuple
import logging
from dotenv import load_dotenv
import time
from uuid import uuid4

# Завантаження змінних середовища з .env файлу
load_dotenv()

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Дозволяємо крос-доменні запити

# Налаштування S3 клієнта
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)
BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

# Завантаження моделі CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {device}")
model, preprocess = clip.load("ViT-B/32", device=device)
model.eval()  # Встановлення моделі в режим оцінки

# Глобальне сховище для векторів зображень
# В реальному проекті варто використовувати базу даних або спеціалізоване векторне сховище
image_vectors = {}  # {image_id: {"vector": embedding_vector, "metadata": {...}}}

def download_from_s3(bucket: str, key: str) -> bytes:
    """Завантажує файл з S3 і повертає його як байти"""
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        return response['Body'].read()
    except Exception as e:
        logger.error(f"Error downloading from S3: {e}")
        raise

def download_from_url(url: str) -> bytes:
    """Завантажує файл з URL і повертає його як байти"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.content
    except Exception as e:
        logger.error(f"Error downloading from URL: {e}")
        raise

def get_clip_embedding(image_bytes: bytes) -> np.ndarray:
    """Отримує ембеддінг зображення за допомогою CLIP"""
    try:
        # Відкриття зображення з байтів
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Препроцесинг та отримання ембеддінгу
        with torch.no_grad():
            image_input = preprocess(image).unsqueeze(0).to(device)
            image_features = model.encode_image(image_input)
            
        # Нормалізація вектора
        image_features /= image_features.norm(dim=-1, keepdim=True)
        
        return image_features.cpu().numpy().flatten()
    except Exception as e:
        logger.error(f"Error getting CLIP embedding: {e}")
        raise

def calculate_similarity(vector1: np.ndarray, vector2: np.ndarray) -> float:
    """Обчислює косинусну подібність між двома векторами"""
    return float(np.dot(vector1, vector2))

def find_similar_images(query_vector: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
    """Знаходить найбільш подібні зображення до заданого вектора"""
    if not image_vectors:
        return []
    
    similarities = []
    for image_id, data in image_vectors.items():
        similarity = calculate_similarity(query_vector, data["vector"])
        similarities.append({
            "image_id": image_id,
            "similarity": similarity,
            "metadata": data.get("metadata", {})
        })
    
    # Сортування за подібністю у спадному порядку
    similarities.sort(key=lambda x: x["similarity"], reverse=True)
    
    return similarities[:top_k]

@app.route('/api/hello', methods=['GET'])
def hello():
    """Простий маршрут, який повертає привітання"""
    return jsonify({
        "message": "Привіт від Python-сервісу з CLIP!",
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

@app.route('/api/embed', methods=['POST'])
def embed_image():
    """Створює і зберігає ембеддінг зображення"""
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    # Зображення може бути надано як S3 ключ або URL
    image_source = data.get("image_source")
    image_id = data.get("image_id", str(uuid4()))
    metadata = data.get("metadata", {})
    
    if not image_source:
        return jsonify({"error": "No image_source provided"}), 400
    
    try:
        start_time = time.time()
        
        # Завантаження зображення
        if image_source.startswith("http"):
            image_bytes = download_from_url(image_source)
        else:
            # Вважаємо, що це ключ S3
            image_bytes = download_from_s3(BUCKET_NAME, image_source)
        
        # Отримання ембеддінгу
        embedding = get_clip_embedding(image_bytes)
        
        # Збереження ембеддінгу в локальне сховище
        image_vectors[image_id] = {
            "vector": embedding,
            "metadata": metadata
        }
        
        processing_time = time.time() - start_time
        
        return jsonify({
            "message": "Embedding created successfully",
            "image_id": image_id,
            "processing_time_seconds": processing_time,
            "status": "success"
        })
    
    except Exception as e:
        logger.error(f"Error in embed_image: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/bulk-embed', methods=['POST'])
def bulk_embed_images():
    """Створює і зберігає ембеддінги для багатьох зображень"""
    data = request.json
    if not data or not isinstance(data.get("images"), list):
        return jsonify({"error": "Invalid request format. Expected 'images' list"}), 400
    
    images = data["images"]
    results = []
    
    for img_data in images:
        image_source = img_data.get("image_source")
        image_id = img_data.get("image_id", str(uuid4()))
        metadata = img_data.get("metadata", {})
        
        if not image_source:
            results.append({
                "image_id": image_id,
                "status": "error",
                "error": "No image_source provided"
            })
            continue
        
        try:
            # Завантаження зображення
            if image_source.startswith("http"):
                image_bytes = download_from_url(image_source)
            else:
                # Вважаємо, що це ключ S3
                image_bytes = download_from_s3(BUCKET_NAME, image_source)
            
            # Отримання ембеддінгу
            embedding = get_clip_embedding(image_bytes)
            
            # Збереження ембеддінгу в локальне сховище
            image_vectors[image_id] = {
                "vector": embedding,
                "metadata": metadata
            }
            
            results.append({
                "image_id": image_id,
                "status": "success"
            })
            
        except Exception as e:
            logger.error(f"Error processing image {image_id}: {e}")
            results.append({
                "image_id": image_id,
                "status": "error",
                "error": str(e)
            })
    
    return jsonify({
        "message": f"Processed {len(results)} images",
        "results": results,
        "status": "success"
    })

@app.route('/api/search', methods=['POST'])
def search_similar_images():
    """Шукає зображення подібні до запиту"""
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    query_type = data.get("query_type", "image")  # "image" або "text"
    top_k = int(data.get("top_k", 5))
    
    try:
        query_vector = None
        
        if query_type == "image":
            image_source = data.get("image_source")
            if not image_source:
                return jsonify({"error": "No image_source provided"}), 400
            
            # Завантаження зображення
            if image_source.startswith("http"):
                image_bytes = download_from_url(image_source)
            else:
                # Вважаємо, що це ключ S3
                image_bytes = download_from_s3(BUCKET_NAME, image_source)
            
            # Отримання ембеддінгу
            query_vector = get_clip_embedding(image_bytes)
        
        elif query_type == "text":
            text_query = data.get("text_query")
            if not text_query:
                return jsonify({"error": "No text_query provided"}), 400
            
            # Отримання ембеддінгу для тексту
            with torch.no_grad():
                text_tokens = clip.tokenize([text_query]).to(device)
                text_features = model.encode_text(text_tokens)
                text_features /= text_features.norm(dim=-1, keepdim=True)
                query_vector = text_features.cpu().numpy().flatten()
        
        else:
            return jsonify({"error": f"Invalid query_type: {query_type}"}), 400
        
        # Пошук подібних зображень
        similar_images = find_similar_images(query_vector, top_k)
        
        return jsonify({
            "message": f"Found {len(similar_images)} similar images",
            "results": similar_images,
            "status": "success"
        })
    
    except Exception as e:
        logger.error(f"Error in search_similar_images: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Повертає статистику про збережені ембеддінги"""
    return jsonify({
        "total_images": len(image_vectors),
        "device": device,
        "model": "ViT-B/32",
        "status": "success"
    })

@app.route('/api/clear', methods=['POST'])
def clear_vectors():
    """Очищає всі збережені вектори (для тестування)"""
    global image_vectors
    image_vectors = {}
    return jsonify({
        "message": "All vectors cleared",
        "status": "success"
    })

if __name__ == '__main__':
    # Порт можна змінити на потрібний вам
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)