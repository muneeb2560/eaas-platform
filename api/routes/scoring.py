from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class ScoreRequest(BaseModel):
    prompt: str
    expected_output: str
    actual_output: str
    rubric_criteria: Dict[str, Any]

class ScoreResponse(BaseModel):
    overall_score: float
    detailed_scores: Dict[str, float]
    feedback: str

@router.post("/evaluate", response_model=ScoreResponse)
async def score_single_output(request: ScoreRequest):
    # Mock scoring implementation
    mock_scores = {
        "accuracy": 0.85,
        "relevance": 0.92,
        "coherence": 0.78,
        "completeness": 0.88
    }
    
    overall_score = sum(mock_scores.values()) / len(mock_scores)
    
    return ScoreResponse(
        overall_score=overall_score,
        detailed_scores=mock_scores,
        feedback="Response demonstrates good accuracy and relevance with room for improvement in coherence."
    )

@router.post("/batch", response_model=List[ScoreResponse])
async def score_batch_outputs(requests: List[ScoreRequest]):
    results = []
    for request in requests:
        result = await score_single_output(request)
        results.append(result)
    return results