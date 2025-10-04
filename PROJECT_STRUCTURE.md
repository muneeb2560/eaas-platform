# EaaS Project Structure & Implementation Plan

## 🏗️ Complete Folder Structure

```
my-nextjs-app/ (root)
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── supabase/
│   ├── migrations/
│   │   ├── 20241004000001_initial_schema.sql
│   │   ├── 20241004000002_rls_policies.sql
│   │   └── 20241004000003_functions.sql
│   ├── config.toml
│   ├── seed.sql
│   └── types.ts
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── RecentEvaluations.tsx
│   │   │   │   └── TrendChart.tsx
│   │   │   └── loading.tsx
│   │   ├── experiments/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── results/
│   │   │   │       └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── components/
│   │   │       ├── ExperimentCard.tsx
│   │   │       ├── CreateExperimentForm.tsx
│   │   │       └── ResultsTable.tsx
│   │   ├── rubrics/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── components/
│   │   │       ├── RubricBuilder.tsx
│   │   │       ├── CriteriaEditor.tsx
│   │   │       └── RubricCard.tsx
│   │   ├── upload/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── FileUploader.tsx
│   │   │       ├── DataPreview.tsx
│   │   │       └── UploadProgress.tsx
│   │   └── api/
│   │       ├── experiments/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── results/
│   │       │           └── route.ts
│   │       ├── evaluations/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── status/
│   │       │           └── route.ts
│   │       ├── rubrics/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── upload/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── python-worker/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── ScatterPlot.tsx
│   │   │   └── DistributionChart.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── csv-parser.ts
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── calculations.ts
│   │   ├── hooks/
│   │   │   ├── useExperiments.ts
│   │   │   ├── useEvaluations.ts
│   │   │   ├── useRubrics.ts
│   │   │   └── useRealtimeUpdates.ts
│   │   ├── constants/
│   │   │   ├── evaluation-types.ts
│   │   │   ├── scoring-methods.ts
│   │   │   └── ui-constants.ts
│   │   └── providers/
│   │       ├── SupabaseProvider.tsx
│   │       ├── ToastProvider.tsx
│   │       └── ThemeProvider.tsx
│   └── types/
│       ├── database.ts
│       ├── experiments.ts
│       ├── evaluations.ts
│       ├── rubrics.ts
│       └── common.ts
├── api/ (Python Worker API)
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── evaluations.py
│   │   ├── scoring.py
│   │   └── health.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── evaluation_service.py
│   │   ├── scoring_service.py
│   │   ├── file_service.py
│   │   └── supabase_service.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── evaluation.py
│   │   ├── rubric.py
│   │   └── result.py
│   ├── workers/
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── evaluation_worker.py
│   │   └── scoring_worker.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── csv_processor.py
│   │   ├── score_calculator.py
│   │   ├── similarity_metrics.py
│   │   └── validators.py
│   └── config/
│       ├── __init__.py
│       ├── settings.py
│       └── database.py
├── data/ (Sample Data & Templates)
│   ├── sample-datasets/
│   │   ├── qa_evaluation_sample.csv
│   │   ├── text_generation_sample.csv
│   │   └── classification_sample.csv
│   ├── rubric-templates/
│   │   ├── qa_accuracy_rubric.json
│   │   ├── text_quality_rubric.json
│   │   └── classification_rubric.json
│   └── golden-examples/
│       ├── perfect_responses.csv
│       └── edge_cases.csv
├── tests/
│   ├── __tests__/
│   │   ├── components/
│   │   │   ├── FileUploader.test.tsx
│   │   │   ├── RubricBuilder.test.tsx
│   │   │   └── ResultsTable.test.tsx
│   │   ├── pages/
│   │   │   ├── dashboard.test.tsx
│   │   │   └── experiments.test.tsx
│   │   └── api/
│   │       ├── experiments.test.ts
│   │       └── evaluations.test.ts
│   ├── python/
│   │   ├── test_evaluation_service.py
│   │   ├── test_scoring_service.py
│   │   └── test_workers.py
│   ├── integration/
│   │   ├── full_evaluation_flow.test.ts
│   │   └── api_integration.test.ts
│   ├── fixtures/
│   │   ├── sample_data.json
│   │   └── mock_responses.json
│   └── setup/
│       ├── jest.config.js
│       ├── test-utils.tsx
│       └── supabase-test.ts
└── docs/
    ├── API.md
    ├── SETUP.md
    ├── DEPLOYMENT.md
    ├── CONTRIBUTING.md
    └── architecture/
        ├── database-schema.md
        ├── api-endpoints.md
        └── component-hierarchy.md
```

## 📋 Implementation Plan by Folder

### 1. Database Setup (`supabase/`)

#### `migrations/20241004000001_initial_schema.sql`
```sql
-- Create core tables for experiments, evaluation runs, and results
-- Enable RLS (Row Level Security)
-- Set up indexes for performance
```

#### `migrations/20241004000002_rls_policies.sql`
```sql
-- User authentication policies
-- Data access control policies
-- Multi-tenant security setup
```

#### `types.ts`
```typescript
// TypeScript definitions generated from Supabase schema
// Database table interfaces
// Helper types for queries
```

### 2. Frontend Core (`src/app/`)

#### Main Pages Implementation:

**`layout.tsx`** - Root layout with:
- Supabase provider setup
- Navigation sidebar
- Toast notifications
- Global error boundary

**`page.tsx`** - Landing/Overview page:
- Welcome dashboard
- Quick stats overview
- Recent activity feed
- Quick action buttons

**`dashboard/page.tsx`** - Main dashboard:
- Evaluation metrics summary
- Performance trend charts
- Recent experiments list
- Quick access to common actions

### 3. Feature Pages (`src/app/experiments/`, `src/app/rubrics/`, `src/app/upload/`)

#### Experiments Module:
- **List View**: All experiments with filters and search
- **Detail View**: Individual experiment results and analytics
- **Creation Form**: New experiment setup with rubric selection
- **Results Page**: Detailed evaluation results with export options

#### Rubrics Module:
- **Builder Interface**: Drag-and-drop criteria creation
- **Template Gallery**: Pre-built rubric templates
- **Editor**: Modify existing rubrics
- **Preview**: Test rubrics before saving

#### Upload Module:
- **File Upload**: CSV drag-and-drop with validation
- **Data Preview**: Table preview before processing
- **Progress Tracking**: Real-time upload and processing status

### 4. API Endpoints (`src/app/api/`)

#### RESTful API Structure:
- **GET/POST** `/api/experiments` - CRUD operations
- **GET/PUT/DELETE** `/api/experiments/[id]` - Individual experiment management
- **POST** `/api/evaluations` - Start new evaluation
- **GET** `/api/evaluations/[id]/status` - Progress tracking
- **POST** `/api/upload` - File upload handling
- **POST** `/api/webhook/python-worker` - Worker communication

### 5. Reusable Components (`src/components/`)

#### UI Components (`ui/`):
- Design system components (Button, Card, Input, etc.)
- Consistent styling with Tailwind CSS
- Accessibility features built-in
- TypeScript props with proper validation

#### Layout Components (`layout/`):
- Header with user menu and notifications
- Sidebar navigation with active states
- Responsive navigation for mobile
- Footer with system status

#### Charts (`charts/`):
- Recharts-based visualization components
- Interactive trend lines and comparisons
- Performance distribution charts
- Customizable chart configurations

### 6. Business Logic (`src/lib/`)

#### Supabase Integration (`supabase/`):
- Client-side Supabase configuration
- Server-side API helpers
- Real-time subscription management
- Type-safe database queries

#### Utilities (`utils/`):
- CSV parsing and validation
- Data formatting helpers
- Score calculation utilities
- File validation functions

#### Custom Hooks (`hooks/`):
- Data fetching with SWR patterns
- Real-time updates management
- Form state management
- Loading and error states

### 7. Python Worker API (`api/`)

#### FastAPI Application (`main.py`):
- REST API endpoints for evaluation processing
- WebSocket connections for real-time updates
- Background job management with Celery
- Health checks and monitoring

#### Services (`services/`):
- **Evaluation Service**: Core evaluation logic
- **Scoring Service**: Multiple scoring algorithms
- **File Service**: CSV processing and validation
- **Supabase Service**: Database communication

#### Workers (`workers/`):
- **Celery Configuration**: Background job processing
- **Evaluation Worker**: Batch evaluation processing
- **Scoring Worker**: Individual sample scoring

### 8. Sample Data & Templates (`data/`)

#### Sample Datasets:
- Question-answering evaluation sets
- Text generation examples
- Classification test cases
- Various CSV formats for testing

#### Rubric Templates:
- Common evaluation criteria
- Industry-standard rubrics
- Customizable templates
- JSON schema definitions

### 9. Testing Suite (`tests/`)

#### Frontend Tests:
- Component unit tests with Jest and React Testing Library
- Page integration tests
- API endpoint testing
- User flow testing

#### Python Tests:
- Service unit tests with pytest
- Worker integration tests
- End-to-end evaluation tests
- Performance benchmarking

### 10. Documentation (`docs/`)

#### Developer Documentation:
- Setup and installation guide
- API documentation with examples
- Architecture decision records
- Contributing guidelines

## 🚀 Implementation Priority Order

### Phase 1: Foundation (Week 1)
1. Supabase database schema and migrations
2. Next.js project structure and basic routing
3. UI component library setup
4. Python worker API foundation

### Phase 2: Core Features (Week 2-3)
1. File upload and CSV processing
2. Rubric builder and management
3. Basic evaluation engine
4. Experiment tracking

### Phase 3: Advanced Features (Week 4-5)
1. Real-time progress tracking
2. Dashboard with charts and analytics
3. Results export and comparison
4. Performance optimization

### Phase 4: Polish & Testing (Week 6)
1. Comprehensive testing suite
2. Error handling and validation
3. UI/UX improvements
4. Documentation completion

This structure provides a complete blueprint for building the EaaS platform with clear separation of concerns, scalable architecture, and comprehensive feature coverage.