# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 1 — Build the React frontend                         ║
# ╚══════════════════════════════════════════════════════════════╝
FROM node:20-slim AS frontend-build

WORKDIR /frontend

# Install dependencies first (better caching)
COPY frontend/package*.json ./
RUN npm install

# Copy all frontend source files
COPY frontend/ .

# Build React app
# VITE_API_URL is empty so React calls the SAME server (relative URLs)
# e.g. /upload, /ask — no hardcoded localhost needed
RUN VITE_API_URL="" npm run build
# Output: /frontend/dist/


# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 2 — Python backend + serve built frontend            ║
# ╚══════════════════════════════════════════════════════════════╝
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# aiofiles is required by FastAPI to serve static files
RUN pip install --no-cache-dir aiofiles

# Copy all backend source files
COPY backend/ .

# Copy the built React app from Stage 1 into backend/static/
COPY --from=frontend-build /frontend/dist ./static

# Create folder for ChromaDB persistence
RUN mkdir -p /app/chroma_db

# Expose port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]