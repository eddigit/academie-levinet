# ============================================================================
# Dockerfile Unifié - Académie Levinet
# Build multi-stage: Node.js pour le frontend, Python pour le backend
# ============================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json frontend/yarn.lock* ./

# Install dependencies (with legacy-peer-deps to resolve date-fns conflict)
RUN npm install --legacy-peer-deps

# Copy source code
COPY frontend/ ./

# Build React app
ENV CI=false
RUN npm run build

# Stage 2: Python Backend + Serve Frontend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Set working directory to backend
WORKDIR /app/backend

# Expose port (Railway/Render will set PORT env var)
EXPOSE 8080

# Start server
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}"]

