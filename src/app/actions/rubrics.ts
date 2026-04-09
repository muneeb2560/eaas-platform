// @ts-nocheck
"use server";

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Fetch all rubrics for the authenticated user (and templates)
export async function getRubricsAction() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If not logged in in dev mode, maybe fallback to templates or empty
    console.warn("No authenticated user found for rubrics fetch");
  }

  const { data, error } = await supabase
    .from('rubrics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rubrics:', error);
    return [];
  }

  // Map database format to the exact frontend state shape your UI expects
  return data.map((row) => {
    const rawCriteria = row.criteria as any;
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      category: rawCriteria?.category || 'Custom', 
      criteria: rawCriteria?.items || [],
      isActive: rawCriteria?.isActive !== false,
      isTemplate: row.is_template,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      usageCount: rawCriteria?.usageCount || 0
    };
  });
}

export async function createRubricAction(rubricData: any) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be logged in to create a rubric.');

  const { error } = await supabase
    .from('rubrics')
    .insert({
      user_id: user.id,
      name: rubricData.name,
      description: rubricData.description,
      is_template: rubricData.isTemplate || false,
      // Wrap frontend extra state into the JSON criteria block to avoid DB migrations
      criteria: { 
        items: rubricData.criteria || [], 
        category: rubricData.category || 'Custom',
        usageCount: 0,
        isActive: true
      }
    });

  if (error) throw new Error(error.message);

  revalidatePath('/rubrics');
  return true;
}

export async function deleteRubricAction(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('rubrics').delete().eq('id', id);
  
  if (error) {
    console.error("Error deleting", error);
    return false;
  }
  
  revalidatePath('/rubrics');
  return true;
}

export async function updateRubricAction(id: string, updates: any) {
  const supabase = await createServerClient();
  
  // First get the old rubric to cleanly merge the JSON criteria
  const { data: old } = await supabase.from('rubrics').select('*').eq('id', id).single();
  if (!old) return false;

  const rawCriteria = (old.criteria || {}) as any;

  const { error } = await supabase
    .from('rubrics')
    .update({
      name: updates.name ?? old.name,
      description: updates.description ?? old.description,
      is_template: updates.isTemplate ?? old.is_template,
      criteria: {
        items: updates.criteria ?? rawCriteria.items,
        category: updates.category ?? rawCriteria.category,
        usageCount: updates.usageCount ?? rawCriteria.usageCount,
        isActive: updates.isActive ?? rawCriteria.isActive
      }
    })
    .eq('id', id);

  if (error) {
    console.error("Error updating", error);
    return false;
  }

  revalidatePath('/rubrics');
  return true;
}

export async function cloneRubricAction(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: original } = await supabase.from('rubrics').select('*').eq('id', id).single();
  if (!original) return false;

  const rawCriteria = (original.criteria || {}) as any;

  const { error } = await supabase.from('rubrics').insert({
    user_id: user.id,
    name: `${original.name} (Copy)`,
    description: original.description,
    is_template: false, // clones are not templates
    criteria: {
      ...rawCriteria,
      usageCount: 0
    }
  });

  if (error) return false;

  revalidatePath('/rubrics');
  return true;
}
