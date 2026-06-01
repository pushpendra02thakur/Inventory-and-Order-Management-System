FROM python:3.10-slim

WORKDIR /app

# Install system dependencies needed for psycopg2 and binary extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose backend port (Railway uses $PORT dynamically)
EXPOSE 8000

# Run uvicorn - Railway injects $PORT env variable automatically
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
