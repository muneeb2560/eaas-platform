import { NextRequest, NextResponse } from 'next/server';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  evaluation_runs_count: number;
}

// This would be imported from a shared location in a real app
const experimentsData: Experiment[] = [
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

// Helper to get mutable experiments array
function getExperiments(): Experiment[] {
  return experimentsData;
}

// GET /api/experiments/[id] - Get single experiment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const experiments = getExperiments();
    const experiment = experiments.find((exp: Experiment) => exp.id === id);
    
    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: experiment
    });
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiment' },
      { status: 500 }
    );
  }
}

// DELETE /api/experiments/[id] - Delete experiment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const experiments = getExperiments();
    const index = experiments.findIndex((exp: Experiment) => exp.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    const deletedExperiment = experiments.splice(index, 1)[0];
    
    console.log(`🗑️ Deleted experiment: ${deletedExperiment.name} (ID: ${id})`);

    return NextResponse.json({
      success: true,
      message: 'Experiment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    return NextResponse.json(
      { error: 'Failed to delete experiment' },
      { status: 500 }
    );
  }
}

// PUT /api/experiments/[id] - Update experiment
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updates = await request.json();
    const experiments = getExperiments();
    
    const index = experiments.findIndex((exp: Experiment) => exp.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    experiments[index] = {
      ...experiments[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    console.log(`📝 Updated experiment: ${experiments[index].name} (ID: ${id})`);

    return NextResponse.json({
      success: true,
      data: experiments[index]
    });
  } catch (error) {
    console.error('Error updating experiment:', error);
    return NextResponse.json(
      { error: 'Failed to update experiment' },
      { status: 500 }
    );
  }
}