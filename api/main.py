from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from routes import evaluations, scoring, health
from config.settings import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 EaaS Python Worker API starting up...")
    yield
    # Shutdown
    print("🛑 EaaS Python Worker API shutting down...")

app = FastAPI(
    title="EaaS Python Worker API",
    description="Backend evaluation processing for Evaluation-as-a-Service platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(evaluations.router, prefix="/api/evaluations", tags=["evaluations"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["scoring"])

@app.get("/")
async def root():
    return {
        "message": "EaaS Python Worker API",
        "version": "1.0.0",
        "status": "running"
    }

# Explicit Railway Healthcheck route to intercept 404 proxy drops 
@app.get("/api/health")
async def railway_health():
    return {"status": "healthy"}

if __name__ == "__main__":
    # Natively absorb Railway's dynamic PORT environment footprint avoiding CLI string breaks
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )