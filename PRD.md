# Product Requirements Document (PRD)
## Evaluation-as-a-Service (EaaS) Platform

### 1. Project Overview

**Product Name**: Evaluation-as-a-Service (EaaS)  
**Version**: Developer MVP v1.0  
**Target Environment**: Localhost Development  
**Primary Goal**: Create a comprehensive platform for automated evaluation of AI model outputs using customizable rubrics and scoring mechanisms.

### 2. Product Vision

EaaS is a developer-focused platform that enables AI teams to upload prompt/output datasets, define evaluation rubrics, and run automated assessments on model performance. The platform provides a centralized dashboard for tracking evaluation trends, comparing model versions, and maintaining evaluation history with experiment tracking.

### 3. Core Features & Requirements

#### 3.1 Data Management
- **CSV Upload Interface**: Support uploading evaluation datasets in CSV format
  - Required columns: `prompt`, `expected_output`, `actual_output`
  - Optional columns: `category`, `difficulty`, `metadata`
  - File validation and error handling
  - Preview functionality before processing

- **Rubric Management**: 
  - Create custom evaluation rubrics with multiple criteria
  - Support different scoring scales (1-5, 1-10, percentage)
  - Weighted scoring across multiple dimensions
  - Pre-built templates for common evaluation types

#### 3.2 Evaluation Engine
- **Automated Scoring**: 
  - Python-based scoring workers for evaluation processing
  - Support multiple evaluation methods (semantic similarity, exact match, custom scoring functions)
  - Parallel processing for large datasets
  - Real-time progress tracking

- **Experiment Tracking**:
  - Unique experiment IDs for each evaluation run
  - Metadata storage (model version, dataset info, timestamp)
  - Reproducible evaluation parameters

#### 3.3 Dashboard & Visualization
- **Evaluation Results Dashboard**:
  - Summary statistics and score distributions
  - Detailed results table with filtering capabilities
  - Export functionality for results

- **Trend Analysis**:
  - Historical performance tracking
  - Model version comparison views
  - Performance trend charts and metrics
  - Regression detection alerts

#### 3.4 Data Storage & Backend
- **Supabase Integration**:
  - User authentication and authorization
  - Evaluation data storage with proper indexing
  - Real-time subscriptions for live updates
  - Row-level security for multi-tenant support

### 4. Technical Architecture

#### 4.1 Frontend (Next.js)
- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context + useReducer for complex state
- **Data Fetching**: Supabase client with real-time subscriptions
- **File Handling**: React Dropzone for CSV uploads
- **Charts**: Recharts or Chart.js for data visualization

#### 4.2 Backend (Supabase)
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for file uploads
- **Real-time**: Supabase Realtime for live updates
- **API**: Supabase Edge Functions for custom logic

#### 4.3 Scoring Workers (Python)
- **Framework**: FastAPI for API endpoints
- **Processing**: Celery or RQ for background job processing
- **Libraries**: 
  - pandas for data manipulation
  - scikit-learn for similarity metrics
  - transformers for semantic evaluation
  - numpy for numerical operations

### 5. Database Schema

#### 5.1 Core Tables
```sql
-- Users (handled by Supabase Auth)

-- Experiments
experiments:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - name (text)
  - description (text)
  - created_at (timestamp)
  - updated_at (timestamp)
  - status (enum: pending, running, completed, failed)

-- Evaluation Runs
evaluation_runs:
  - id (uuid, primary key)
  - experiment_id (uuid, foreign key)
  - dataset_file_url (text)
  - rubric_config (jsonb)
  - total_samples (integer)
  - completed_samples (integer)
  - average_score (decimal)
  - started_at (timestamp)
  - completed_at (timestamp)
  - status (enum: queued, running, completed, failed)

-- Evaluation Results
evaluation_results:
  - id (uuid, primary key)
  - evaluation_run_id (uuid, foreign key)
  - sample_index (integer)
  - prompt (text)
  - expected_output (text)
  - actual_output (text)
  - overall_score (decimal)
  - detailed_scores (jsonb)
  - feedback (text)
  - created_at (timestamp)

-- Rubrics
rubrics:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - name (text)
  - description (text)
  - criteria (jsonb)
  - is_template (boolean)
  - created_at (timestamp)
```

### 6. User Stories

#### 6.1 Data Upload & Setup
- As a developer, I want to upload a CSV file with prompts and outputs so that I can evaluate my model's performance
- As a developer, I want to create custom rubrics so that I can evaluate outputs based on specific criteria
- As a developer, I want to preview my data before processing so that I can ensure correct formatting

#### 6.2 Evaluation Management
- As a developer, I want to start an evaluation run so that I can assess my model's performance automatically
- As a developer, I want to track evaluation progress in real-time so that I know when results are ready
- As a developer, I want to assign experiment IDs so that I can organize and reference specific evaluation runs

#### 6.3 Results & Analysis
- As a developer, I want to view detailed evaluation results so that I can understand my model's strengths and weaknesses
- As a developer, I want to compare different evaluation runs so that I can track performance improvements
- As a developer, I want to export results so that I can share findings with my team

#### 6.4 Dashboard & Monitoring
- As a developer, I want to see evaluation trends over time so that I can monitor model performance degradation
- As a developer, I want to compare new vs old model versions so that I can validate improvements
- As a developer, I want to filter and search results so that I can analyze specific subsets of data

### 7. Non-Functional Requirements

#### 7.1 Performance
- Support evaluation datasets up to 10,000 samples
- Real-time progress updates during evaluation
- Dashboard load time < 2 seconds
- File upload support up to 50MB

#### 7.2 Usability
- Intuitive drag-and-drop file upload
- Clear progress indicators and status messages
- Responsive design for desktop and tablet
- Accessible UI following WCAG guidelines

#### 7.3 Reliability
- Graceful error handling with user-friendly messages
- Data validation at multiple levels
- Automatic retry mechanism for failed evaluations
- Data backup and recovery capabilities

### 8. Success Metrics

#### 8.1 Developer Productivity
- Time to complete first evaluation run < 5 minutes
- Average evaluation processing time per sample < 500ms
- Dashboard query response time < 1 second

#### 8.2 Platform Adoption
- Successful evaluation runs completion rate > 95%
- User retention rate for repeat evaluations
- Feature utilization across core functionality

### 9. Future Enhancements (Out of Scope for MVP)

- Multi-user collaboration and sharing
- API access for programmatic evaluation
- Integration with popular ML frameworks
- Advanced analytics and reporting
- Automated model comparison workflows
- Custom scoring algorithm uploads
- Batch evaluation scheduling
- Performance optimization for large datasets

### 10. Development Phases

#### Phase 1: Core Infrastructure (Weeks 1-2)
- Project setup and basic architecture
- Supabase configuration and schema
- Basic Next.js frontend structure
- Python worker foundation

#### Phase 2: Data Management (Weeks 3-4)
- CSV upload functionality
- Data validation and preprocessing
- Basic rubric management
- Database integration

#### Phase 3: Evaluation Engine (Weeks 5-6)
- Python scoring workers
- Job queue implementation
- Progress tracking
- Result storage

#### Phase 4: Dashboard & Visualization (Weeks 7-8)
- Results dashboard
- Basic charting and trends
- Export functionality
- UI/UX polish

This PRD provides a comprehensive foundation for building the EaaS platform as a localhost development environment, focusing on core functionality without deployment complexities.