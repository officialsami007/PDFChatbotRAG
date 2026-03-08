# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 1 — Build the React frontend                         ║
# ╚══════════════════════════════════════════════════════════════╝
FROM node:20-slim AS frontend-build

WORKDIR /frontend

# Install dependencies first (better layer caching)
COPY frontend/package*.json ./
RUN npm install

# Copy all frontend source files
COPY frontend/ .

# Set VITE_API_URL to empty using proper Docker ENV syntax
# Empty = React uses relative URLs (/upload, /ask) hitting same server
ENV VITE_API_URL=""

# Build React
RUN npm run build

# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 2 — Python backend + serve built frontend            ║
# ╚══════════════════════════════════════════════════════════════╝
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir aiofiles

# Copy all backend source files
COPY backend/ .

# Copy the built React app from Stage 1 into backend/static/
COPY --from=frontend-build /frontend/dist ./static

# Create folder for ChromaDB persistence
RUN mkdir -p /app/chroma_db

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]