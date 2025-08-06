from pymongo import MongoClient
from app.config import settings

mongo_client = MongoClient(settings.MONGO_URI)
mongo_db = mongo_client[settings.MONGO_DB]
mongo_collection = mongo_db[settings.MONGO_COLLECTION]
