# EaaS API Reference

## Overview

The EaaS platform consists of two main APIs:
1. **Next.js API Routes** - Frontend API endpoints
2. **Python FastAPI** - Backend processing engine

## Base URLs

- Frontend API: `http://localhost:3000/api`
- Python API: `http://localhost:8000`

## Authentication

All API requests require authentication via Supabase Auth tokens.

```typescript
// Example with Supabase client
const { data, error } = await supabase.auth.getSession()
const token = data.session?.access_token

// Include in requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Frontend API Endpoints

### Experiments

#### GET /api/experiments
Retrieve all experiments for the authenticated user.

**Response:**
```json
{
  \"experiments\": [
    {
      \"id\": \"uuid\",
      \"name\": \"My First Experiment\",
      \"description\": \"Testing Q&A accuracy\",
      \"status\": \"active\",
      \"created_at\": \"2024-01-01T00:00:00Z\",
      \"updated_at\": \"2024-01-01T00:00:00Z\"
    }
  ]
}
```

#### POST /api/experiments
Create a new experiment.

**Request:**
```json
{
  \"name\": \"Experiment Name\",
  \"description\": \"Optional description\"
}
```

**Response:**
```json
{
  \"experiment\": {
    \"id\": \"uuid\",
    \"name\": \"Experiment Name\",
    \"description\": \"Optional description\",
    \"status\": \"active\",
    \"created_at\": \"2024-01-01T00:00:00Z\"
  }
}
```

#### GET /api/experiments/[id]
Retrieve a specific experiment.

#### PUT /api/experiments/[id]
Update an experiment.

#### DELETE /api/experiments/[id]
Delete an experiment.

### Evaluation Runs

#### GET /api/experiments/[id]/evaluation-runs
Get all evaluation runs for an experiment.

#### POST /api/evaluations
Start a new evaluation run.

**Request:**
```json
{
  \"experiment_id\": \"uuid\",
  \"rubric_id\": \"uuid\",
  \"dataset_file_url\": \"https://storage.url/file.csv\",
  \"batch_size\": 100
}
```

**Response:**
```json
{
  \"evaluation_run\": {
    \"id\": \"uuid\",
    \"status\": \"queued\",
    \"total_samples\": 1000,
    \"completed_samples\": 0,
    \"created_at\": \"2024-01-01T00:00:00Z\"
  }
}
```

#### GET /api/evaluations/[id]/status
Get real-time status of an evaluation run.

**Response:**
```json
{
  \"id\": \"uuid\",
  \"status\": \"running\",
  \"progress\": 0.45,
  \"completed_samples\": 450,
  \"total_samples\": 1000,
  \"average_score\": 0.78,
  \"estimated_completion\": \"2024-01-01T01:00:00Z\",
  \"errors\": []
}
```

### Rubrics

#### GET /api/rubrics
Retrieve all rubrics (own + templates).

#### POST /api/rubrics
Create a new rubric.

**Request:**
```json
{
  \"name\": \"Custom Q&A Rubric\",
  \"description\": \"For evaluating question-answer pairs\",
  \"criteria\": {
    \"accuracy\": {
      \"weight\": 0.4,
      \"description\": \"Factual correctness\",
      \"scale\": { \"min\": 0, \"max\": 1 }
    },
    \"completeness\": {
      \"weight\": 0.3,
      \"description\": \"How thoroughly the answer addresses the question\",
      \"scale\": { \"min\": 0, \"max\": 1 }
    }
  }
}
```

### File Upload

#### POST /api/upload
Upload CSV dataset file.

**Request:** FormData with file

**Response:**
```json
{
  \"file_url\": \"https://storage.url/uploads/file.csv\",
  \"file_name\": \"dataset.csv\",
  \"file_size\": 1024000,
  \"preview\": {
    \"headers\": [\"prompt\", \"expected_output\", \"actual_output\"],
    \"sample_rows\": 5,
    \"total_rows\": 1000
  }
}
```

## Python API Endpoints

### Health Check

#### GET /health
Service health status.

**Response:**
```json
{
  \"status\": \"healthy\",
  \"timestamp\": 1704067200.0,
  \"version\": \"1.0.0\",
  \"services\": {
    \"api\": \"healthy\",
    \"worker\": \"healthy\",
    \"database\": \"healthy\"
  }
}
```

### Evaluation Processing

#### POST /api/evaluations/start
Start background evaluation processing.

**Request:**
```json
{
  \"experiment_id\": \"uuid\",
  \"dataset_file_url\": \"https://storage.url/file.csv\",
  \"rubric_config\": {
    \"criteria\": {
      \"accuracy\": { \"weight\": 0.4 },
      \"completeness\": { \"weight\": 0.3 }
    }
  },
  \"batch_size\": 100
}
```

**Response:**
```json
{
  \"evaluation_id\": \"uuid\",
  \"status\": \"queued\",
  \"message\": \"Evaluation queued successfully\",
  \"estimated_completion_time\": \"2024-01-01T01:00:00Z\"
}
```

#### GET /api/evaluations/{evaluation_id}/status
Get evaluation progress.

#### DELETE /api/evaluations/{evaluation_id}
Cancel a running evaluation.

### Scoring

#### POST /api/scoring/evaluate
Score a single prompt-output pair.

**Request:**
```json
{
  \"prompt\": \"What is the capital of France?\",
  \"expected_output\": \"Paris\",
  \"actual_output\": \"The capital of France is Paris.\",
  \"rubric_criteria\": {
    \"accuracy\": { \"weight\": 0.5 },
    \"completeness\": { \"weight\": 0.3 }
  }
}
```

**Response:**
```json
{
  \"overall_score\": 0.85,
  \"detailed_scores\": {
    \"accuracy\": 0.9,
    \"completeness\": 0.8,
    \"relevance\": 0.95
  },
  \"feedback\": \"Response is accurate and complete with good relevance to the question.\"
}
```

#### POST /api/scoring/batch
Score multiple outputs in batch.

## WebSocket Endpoints

### Real-time Updates

#### WS /api/evaluations/{evaluation_id}/updates
Real-time evaluation progress updates.

**Messages:**
```json
{
  \"type\": \"progress_update\",
  \"data\": {
    \"completed_samples\": 150,
    \"total_samples\": 1000,
    \"current_average_score\": 0.82,
    \"estimated_completion\": \"2024-01-01T00:45:00Z\"
  }
}
```

## Error Handling

### Standard Error Format

```json
{
  \"error\": {
    \"code\": \"VALIDATION_ERROR\",
    \"message\": \"Invalid rubric configuration\",
    \"details\": {
      \"field\": \"criteria.accuracy.weight\",
      \"issue\": \"Weight must be between 0 and 1\"
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- Frontend API: 100 requests/minute per user
- Python API: 1000 requests/minute per user
- File uploads: 10 files/hour per user
- Evaluation starts: 5 concurrent evaluations per user

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Start evaluation
const { data, error } = await supabase
  .from('evaluation_runs')
  .insert({
    experiment_id: 'uuid',
    dataset_file_url: 'url',
    rubric_config: rubricData
  })
```

### Python

```python
import requests

# Score single output
response = requests.post(
    'http://localhost:8000/api/scoring/evaluate',
    json={
        'prompt': 'What is AI?',
        'actual_output': 'AI is artificial intelligence...',
        'rubric_criteria': criteria
    }
)

result = response.json()
```

## Webhooks

Configure webhooks to receive notifications when evaluations complete:

```json
{
  \"event\": \"evaluation.completed\",
  \"data\": {
    \"evaluation_id\": \"uuid\",
    \"experiment_id\": \"uuid\",
    \"status\": \"completed\",
    \"final_score\": 0.85,
    \"total_samples\": 1000
  }
}
```"