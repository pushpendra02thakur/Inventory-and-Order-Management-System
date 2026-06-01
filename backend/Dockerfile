FROM python:3.10-slim

WORKDIR /app

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Expose port
EXPOSE 8000

# Start uvicorn with dynamic PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
