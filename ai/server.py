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
import datetime
from uuid import uuid4
import json
import asyncio

# SQLAlchemy для асинхронної роботи
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Float, Text, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.future import select

# Завантаження змінних середовища з .env файлу
load_dotenv()

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Дозволяємо крос-доменні запити

# Налаштування SQLAlchemy - переконуємося, що використовуємо asyncpg драйвер
# Modified line - remove the schema parameter
DATABASE_URL = "postgresql+asyncpg://postgres:07092006@localhost:5432/test"
if "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
if "schema=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("schema=")[0]  # Видаляємо параметр schema


logger.info(f"Using database URL: {DATABASE_URL}")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Визначення моделей SQLAlchemy
class MilitaryEquipment(Base):
    __tablename__ = "MilitaryEquipment"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    country = Column(String, nullable=False)
    inService = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
    year = Column(Integer, nullable=True)
    imageUrl = Column(String, nullable=True)
    technicalSpecs = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Зв'язок one-to-many з ImageEmbedding
    imageEmbeddings = relationship("ImageEmbedding", back_populates="militaryEquipment", cascade="all, delete")

class ImageEmbedding(Base):
    __tablename__ = "ImageEmbedding"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    imageSource = Column(String, nullable=False)
    vectorDataJson = Column(Text, nullable=True)  # JSON string для зберігання вектора
    metadataJson = Column(JSON, nullable=True)  # Renamed from metadata to avoid conflict with SQLAlchemy reserved word
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Зовнішній ключ і зв'язок many-to-one
    militaryEquipmentId = Column(String, ForeignKey("MilitaryEquipment.id", ondelete="CASCADE"), nullable=False)
    militaryEquipment = relationship("MilitaryEquipment", back_populates="imageEmbeddings")

# Налаштування S3 клієнта
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)
AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET')

# Перевірка налаштувань S3
if not AWS_S3_BUCKET or not os.getenv('AWS_ACCESS_KEY_ID') or not os.getenv('AWS_SECRET_ACCESS_KEY'):
    logger.warning("S3 configuration is incomplete. Please check your .env file.")

# Завантаження моделі CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {device}")
model, preprocess = clip.load("ViT-B/32", device=device)
model.eval()  # Встановлення моделі в режим оцінки

# Асинхронна функція для створення таблиць в БД - не використовуємо, як вказано
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")

# Функція для запуску асинхронного створення таблиць - не використовуємо, як вказано
def setup_database():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(create_tables())
    loop.close()

# Видалено before_first_request декоратор, який викликав помилку

def download_from_s3(bucket: str, key: str) -> bytes:
    """Завантажує файл з S3 і повертає його як байти"""
    try:
        logger.info(f"Downloading from S3: bucket={bucket}, key={key}")
        response = s3.get_object(Bucket=bucket, Key=key)
        return response['Body'].read()
    except Exception as e:
        logger.error(f"Error downloading from S3: {e}")
        raise

def download_from_url(url: str) -> bytes:
    """Завантажує файл з URL і повертає його як байти"""
    try:
        logger.info(f"Downloading from URL: {url}")
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

async def find_similar_images(session, query_vector: np.ndarray, top_k: int = 5) -> List[Dict]:
    """
    Знаходить схожі зображення в базі даних
    
    Примітка: PostgreSQL + pgvector підтримує пошук подібних векторів напряму в SQL,
    але для спрощення ми будемо завантажувати вектори і порівнювати їх у Python
    """
    results = []
    
    # Отримуємо всі ембеддінги з бази даних
    stmt = select(ImageEmbedding).join(MilitaryEquipment)
    result = await session.execute(stmt)
    embeddings = result.scalars().all()
    
    for embedding in embeddings:
        # Отримуємо вектор з JSON рядка
        if embedding.vectorDataJson:
            vector_data = np.array(json.loads(embedding.vectorDataJson))
            
            # Розраховуємо подібність
            similarity = calculate_similarity(query_vector, vector_data)
            
            results.append({
                "image_id": embedding.id,
                "similarity": similarity,
                "metadata": {
                    "militaryEquipment": {
                        "id": embedding.militaryEquipment.id,
                        "name": embedding.militaryEquipment.name,
                        "type": embedding.militaryEquipment.type,
                        "imageUrl": embedding.militaryEquipment.imageUrl,
                        "country": embedding.militaryEquipment.country
                    },
                    "imageSource": embedding.imageSource
                }
            })
    
    # Сортуємо за подібністю і повертаємо перші top_k
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

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
async def embed_image():
    """Creates and stores image embedding, accepting equipment_id in either top level or metadata"""
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
   
    # Get image source
    image_source = data.get("image_source")
    
    # First try to get equipment_id from top level, then from metadata if not found
    equipment_id = data.get("equipment_id")
    metadata = data.get("metadata", {})
    if not equipment_id and isinstance(metadata, dict):
        equipment_id = metadata.get("equipment_id")
   
    # Validate required fields
    if not image_source or not equipment_id:
        return jsonify({"error": "image_source and equipment_id are required (either at top level or in metadata)"}), 400
   
    try:
        start_time = time.time()
        
        async with async_session() as session:
            # Check if equipment exists
            stmt = select(MilitaryEquipment).where(MilitaryEquipment.id == equipment_id)
            result = await session.execute(stmt)
            equipment = result.scalar_one_or_none()
            
            if not equipment:
                return jsonify({"error": f"Military equipment with ID {equipment_id} not found"}), 404
       
            # Load the image
            if image_source.startswith("http"):
                # URL image
                logger.info(f"Loading image from URL: {image_source}")
                image_bytes = download_from_url(image_source)
            else:
                # Assume it's an S3 key
                logger.info(f"Loading image from S3 with key: {image_source}")
                image_bytes = download_from_s3(AWS_S3_BUCKET, image_source)
       
            if image_bytes is None:
                return jsonify({"error": "Failed to load image data"}), 500

            # Get embedding
            embedding = get_clip_embedding(image_bytes)
            
            # Create new embedding record
            embedding_id = str(uuid4())
            embedding_record = ImageEmbedding(
                id=embedding_id,
                imageSource=image_source,
                vectorDataJson=json.dumps(embedding.tolist()),  # Convert numpy array to JSON
                militaryEquipmentId=equipment_id,
                metadataJson=metadata
            )
            
            # Add and save to database
            session.add(embedding_record)
            await session.commit()
       
            processing_time = time.time() - start_time
       
            return jsonify({
                "message": "Embedding created successfully",
                "embedding_id": embedding_id,
                "processing_time_seconds": processing_time,
                "status": "success"
            })
   
    except Exception as e:
        logger.error(f"Error in embed_image: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/bulk-embed', methods=['POST'])
async def bulk_embed_images():
    """Створює і зберігає ембеддінги для багатьох зображень"""
    data = request.json
    if not data or not isinstance(data.get("images"), list):
        return jsonify({"error": "Invalid request format. Expected 'images' list"}), 400
   
    images = data["images"]
    results = []
   
    async with async_session() as session:
        for img_data in images:
            image_source = img_data.get("image_source")
            equipment_id = img_data.get("equipment_id")
            metadata = img_data.get("metadata", {})
           
            if not image_source or not equipment_id:
                results.append({
                    "equipment_id": equipment_id,
                    "status": "error",
                    "error": "image_source and equipment_id are required"
                })
                continue
           
            try:
                # Перевіряємо, чи існує обладнання
                stmt = select(MilitaryEquipment).where(MilitaryEquipment.id == equipment_id)
                result = await session.execute(stmt)
                equipment = result.scalar_one_or_none()
                
                if not equipment:
                    results.append({
                        "equipment_id": equipment_id,
                        "status": "error",
                        "error": f"Military equipment with ID {equipment_id} not found"
                    })
                    continue
                
                # Завантаження зображення
                if image_source.startswith("http"):
                    image_bytes = download_from_url(image_source)
                else:
                    # Вважаємо, що це ключ S3
                    image_bytes = download_from_s3(AWS_S3_BUCKET, image_source)
               
                # Отримання ембеддінгу
                embedding = get_clip_embedding(image_bytes)
                
                # Створюємо новий запис ембеддінгу
                embedding_id = str(uuid4())
                embedding_record = ImageEmbedding(
                    id=embedding_id,
                    imageSource=image_source,
                    vectorDataJson=json.dumps(embedding.tolist()),
                    militaryEquipmentId=equipment_id,
                    metadataJson=metadata
                )
                
                # Додаємо до сесії
                session.add(embedding_record)
               
                results.append({
                    "equipment_id": equipment_id,
                    "embedding_id": embedding_id,
                    "status": "success"
                })
               
            except Exception as e:
                logger.error(f"Error processing image for equipment {equipment_id}: {e}")
                results.append({
                    "equipment_id": equipment_id,
                    "status": "error",
                    "error": str(e)
                })
        
        # Зберігаємо всі зміни в базі даних
        await session.commit()
   
    return jsonify({
        "message": f"Processed {len(results)} images",
        "results": results,
        "status": "success"
    })

@app.route('/api/search', methods=['POST'])
async def search_similar_images():
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
                image_bytes = download_from_s3(AWS_S3_BUCKET, image_source)
           
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
       
        async with async_session() as session:
            # Пошук подібних зображень
            similar_images = await find_similar_images(session, query_vector, top_k)
       
            return jsonify({
                "message": f"Found {len(similar_images)} similar images",
                "results": similar_images,
                "status": "success"
            })
   
    except Exception as e:
        logger.error(f"Error in search_similar_images: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
async def get_stats():
    """Повертає статистику про збережені ембеддінги"""
    try:
        async with async_session() as session:
            # Підраховуємо загальну кількість ембедингів
            result = await session.execute(select(ImageEmbedding))
            embedding_count = len(result.scalars().all())
            
            # Підраховуємо кількість обладнання, для якого є ембединги
            result = await session.execute(
                select(MilitaryEquipment.id)
                .join(ImageEmbedding, MilitaryEquipment.id == ImageEmbedding.militaryEquipmentId)
                .group_by(MilitaryEquipment.id)
            )
            equipment_count = len(result.all())
            
            return jsonify({
                "total_embeddings": embedding_count,
                "equipment_with_embeddings": equipment_count,
                "device": device,
                "model": "ViT-B/32",
                "status": "success"
            })
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/clear', methods=['POST'])
async def clear_vectors():
    """Очищає всі збережені вектори (для тестування)"""
    try:
        async with async_session() as session:
            # Видаляємо всі ембеддінги
            await session.execute(ImageEmbedding.__table__.delete())
            await session.commit()
            
            return jsonify({
                "message": "All embeddings cleared",
                "status": "success"
            })
    except Exception as e:
        logger.error(f"Error clearing embeddings: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Порт можна змінити на потрібний вам
    port = int(os.getenv('PORT', 8080))
    debug_mode = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    
    # Для асинхронного Flask використовуємо hypercorn
    from hypercorn.asyncio import serve
    from hypercorn.config import Config
    
    config = Config()
    config.bind = [f"0.0.0.0:{port}"]
    config.debug = debug_mode
    
    print(f"Starting server on port {port}, debug mode: {debug_mode}")
    print(f"Database URL: {DATABASE_URL}")
    
    # Не створюємо таблиці БД, як вказано в коментарі
    # setup_database()
    
    # Запускаємо сервер
    asyncio.run(serve(app, config))