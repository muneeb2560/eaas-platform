from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import time

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    timestamp: float
    version: str
    services: Dict[str, str]

@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring service status."""
    return HealthResponse(
        status="healthy",
        timestamp=time.time(),
        version="1.0.0",
        services={
            "api": "healthy",
            "worker": "healthy",
            "database": "healthy"
        }
    )

@router.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes/container orchestration."""
    return {"status": "ready"}

@router.get("/live")
async def liveness_check():
    """Liveness check for Kubernetes/container orchestration."""
    return {"status": "alive"}