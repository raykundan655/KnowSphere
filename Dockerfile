# Use official Python 3.11 slim image
FROM python:3.11-slim

# Install system dependencies needed for compiling certifi or other build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy requirements from root to cache them in a Docker layer
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Hugging Face sentence-transformers model during the build phase
# This stores the weights inside the Docker image at build-time, completely bypassing network downloads at startup!
RUN python -c "from langchain_huggingface import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')"

# Copy the entire Backend code to /app
COPY Backend/ /app/

# Expose port 8000 for FastAPI
EXPOSE 8000

# Set environment variables for stdout buffering
ENV PYTHONUNBUFFERED=1

# Command to run the backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
