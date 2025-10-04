import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for development (would be replaced with database in production)
let experiments: any[] = [
  {
    id: "exp_1",
    name: "Q&A Model Evaluation",
    description: "Testing question-answering accuracy with comprehensive rubrics",
    status: 'active',
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    evaluation_runs_count: 3
  },
  {
    id: "exp_2", 
    name: "Text Generation Quality",
    description: "Evaluating text generation coherence and creativity",
    status: 'active',
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    evaluation_runs_count: 1
  }
];

// GET /api/experiments - Get all experiments
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: experiments,
      count: experiments.length
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}

// POST /api/experiments - Create new experiment
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Experiment name is required' },
        { status: 400 }
      );
    }

    const newExperiment = {
      id: `exp_${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      evaluation_runs_count: 0
    };

    experiments.push(newExperiment);

    console.log(`✅ Created experiment: ${newExperiment.name} (ID: ${newExperiment.id})`);

    return NextResponse.json({
      success: true,
      data: newExperiment
    });

  } catch (error) {
    console.error('Error creating experiment:', error);
    return NextResponse.json(
      { error: 'Failed to create experiment' },
      { status: 500 }
    );
  }
}