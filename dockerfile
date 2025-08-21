FROM python:3.10-slim

WORKDIR /app

# Dependencias del sistema (si necesitas compilar paquetes)
RUN apt-get update && apt-get install -y build-essential curl --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Instalar Poetry
RUN pip install --no-cache-dir poetry

# Copy lock files and install (sin crear virtualenv)
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --only main

# Copiar app
COPY . .

ENV PORT=8000
EXPOSE 8000

# Usar Uvicorn (puedes cambiar por gunicorn+uvicorn-workers si lo necesitas)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
