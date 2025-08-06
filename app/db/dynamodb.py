import boto3
from app.config import settings

dynamodb = boto3.resource(
    'dynamodb',
    region_name=settings.DYNAMODB_REGION,
    aws_access_key_id=settings.DYNAMODB_ACCESS_KEY,
    aws_secret_access_key=settings.DYNAMODB_SECRET_KEY
)

table = dynamodb.Table(settings.DYNAMODB_TABLE)

def put_conversation_item(item: dict):
    table.put_item(Item=item)
