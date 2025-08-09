FROM python:3.11-slim

WORKDIR /app

# Instalar Poetry
RUN pip install poetry

# Copiar dependencias
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false && poetry install --no-dev

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto
EXPOSE 8000

# Ejecutar FastAPI con Uvicorn y soporte para streaming
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
