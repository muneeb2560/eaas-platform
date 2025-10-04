import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get user experiments (if you have an experiments table)
    const { data: experiments, error: experimentsError } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', user.id);

    // Get user evaluations (if you have an evaluations table)
    const { data: evaluations, error: evaluationsError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', user.id);

    // Prepare export data
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
      },
      profile: profile || null,
      experiments: experiments || [],
      evaluations: evaluations || [],
      exportDate: new Date().toISOString(),
      mode: 'production'
    };

    // Create filename
    const filename = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;

    // Return as downloadable JSON file
    return new NextResponse(
      JSON.stringify(exportData, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      }
    );

  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}