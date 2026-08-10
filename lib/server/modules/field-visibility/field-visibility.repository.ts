import type { ServerContext } from '@/lib/server/context';

export async function resolveFieldVisibility(
  ctx: ServerContext,
  entityType: 'owner' | 'vendor',
  entityId: string,
  fieldKey: string,
): Promise<boolean> {
  const { data, error } = await ctx.db.rpc('resolve_field_visibility', {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_field_key: fieldKey,
  });

  if (error) {
    throw new Error(error.message);
  }
  return Boolean(data);
}
