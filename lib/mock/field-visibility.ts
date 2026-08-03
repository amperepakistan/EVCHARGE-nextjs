import { OWNER_ID_MALL, OWNER_ID_SOCIETY } from '@/lib/mock/terminals';

/**
 * Stand-in for `field_visibility_rules` / `field_visibility_overrides` and the
 * `resolve_field_visibility` RPC that already exist in the schema but were
 * never wired up.
 *
 * `docs/feature-roles.md` says owner dashboards are tiered per owner rather
 * than all-or-nothing, so the two demo owners deliberately differ: the mall
 * group sees its revenue share, the housing society does not. Sign in as
 * owner.basic@ampere.pk to see the locked state.
 */
export type OwnerField = 'revenue' | 'uptime_pct' | 'leads_count' | 'energy_kwh';

const RULES: Record<string, Record<OwnerField, boolean>> = {
  [OWNER_ID_MALL]: {
    revenue: true,
    uptime_pct: true,
    leads_count: true,
    energy_kwh: true,
  },
  [OWNER_ID_SOCIETY]: {
    revenue: false,
    uptime_pct: true,
    leads_count: false,
    energy_kwh: true,
  },
};

export function canOwnerSee(ownerId: string, field: OwnerField): boolean {
  return RULES[ownerId]?.[field] ?? false;
}
