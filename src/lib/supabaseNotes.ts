import { getSupabaseClient } from './supabase';

export interface ReagentNote {
  id?: string;
  user_id: string;
  reagent_id: string;
  note_content: string;
  updated_at?: string;
}

export async function fetchUserNotes(userId: string): Promise<Record<string, string>> {
  const client = getSupabaseClient();
  if (!client) return {};

  const { data, error } = await client
    .from('reagent_notes')
    .select('reagent_id, note_content')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching reagent notes:', error);
    return {};
  }

  const map: Record<string, string> = {};
  if (data) {
    data.forEach((row: any) => {
      map[row.reagent_id] = row.note_content;
    });
  }
  return map;
}

export async function saveUserNote(userId: string, reagentId: string, noteContent: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  // Upsert based on unique constraint (user_id, reagent_id)
  const { error } = await client
    .from('reagent_notes')
    .upsert(
      {
        user_id: userId,
        reagent_id: reagentId,
        note_content: noteContent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,reagent_id' }
    );

  if (error) {
    console.error('Error saving reagent note:', error);
    return false;
  }
  return true;
}
