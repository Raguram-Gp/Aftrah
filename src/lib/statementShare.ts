import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { StatementKind, StatementSnapshot } from '@/lib/statementSnapshot';

export const createStatementShare = async (args: {
  kind: StatementKind;
  entityId?: string | null;
  title: string;
  payload: StatementSnapshot;
}): Promise<string> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Cannot create statement share link.');
  }

  const { data, error } = await supabase
    .from('statement_shares')
    .insert({
      kind: args.kind,
      entity_id: args.entityId ?? null,
      title: args.title,
      payload: args.payload,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? 'Failed to create statement share link.');
  }

  return `${window.location.origin}/s/${data.id}`;
};
