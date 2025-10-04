from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

router = APIRouter()

class EvaluationRequest(BaseModel):
    experiment_id: str
    dataset_file_url: str
    rubric_config: Dict[str, Any]
    batch_size: Optional[int] = 100

class EvaluationResponse(BaseModel):
    evaluation_id: str
    status: str
    message: str
    estimated_completion_time: Optional[datetime] = None

class EvaluationStatus(BaseModel):
    evaluation_id: str
    status: str
    progress: float
    completed_samples: int
    total_samples: int
    current_average_score: Optional[float] = None
    errors: List[str] = []

@router.post("/start", response_model=EvaluationResponse)
async def start_evaluation(request: EvaluationRequest, background_tasks: BackgroundTasks):
    evaluation_id = str(uuid.uuid4())
    
    try:
        return EvaluationResponse(
            evaluation_id=evaluation_id,
            status="queued",
            message="Evaluation queued successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start evaluation: {str(e)}")

@router.get("/{evaluation_id}/status", response_model=EvaluationStatus)
async def get_evaluation_status(evaluation_id: str):
    return EvaluationStatus(
        evaluation_id=evaluation_id,
        status="running",
        progress=0.45,
        completed_samples=450,
        total_samples=1000,
        current_average_score=0.78
    )

@router.delete("/{evaluation_id}")
async def cancel_evaluation(evaluation_id: str):
    return {"message": f"Evaluation {evaluation_id} cancelled successfully"}