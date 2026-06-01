FROM python:3.10-slim

WORKDIR /app

# Install python dependencies
# psycopg2-binary includes precompiled postgres libs — no apt-get needed
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose backend port (Railway uses $PORT dynamically)
EXPOSE 8000

# Run uvicorn - Railway injects $PORT env variable automatically
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
