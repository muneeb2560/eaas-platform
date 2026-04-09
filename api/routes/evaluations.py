from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from services.evaluator import process_evaluation
import uuid

router = APIRouter()

class EvaluationRequest(BaseModel):
    experiment_id: str
    evaluation_id: str
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
    # Pass the heavy evaluation lifting to FastAPI background workers to prevent blocking API
    try:
        background_tasks.add_task(
            process_evaluation,
            evaluation_id=request.evaluation_id,
            experiment_id=request.experiment_id,
            dataset_url=request.dataset_file_url,
            rubric_config=request.rubric_config,
            batch_size=request.batch_size
        )
        
        return EvaluationResponse(
            evaluation_id=request.evaluation_id,
            status="queued",
            message="Evaluation queue dispatched successfully to Python FastApi"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start evaluation processing: {str(e)}")
@router.get("/{evaluation_id}/status", response_model=EvaluationStatus)
@router.delete("/{evaluation_id}")
async def cancel_evaluation(evaluation_id: str):
    return {"message": f"Evaluation {evaluation_id} cancellation event received"}