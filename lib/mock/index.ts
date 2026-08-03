/**
 * Single import surface for the dummy-data MVP.
 *
 * Dashboard pages import from here and never call `supabaseServer()`, so
 * cutting over to the real API later means changing these modules rather than
 * touching any page markup.
 */
export * from '@/lib/mock/types';
export * from '@/lib/mock/terminals';
export * from '@/lib/mock/users';
export * from '@/lib/mock/operations';
export * from '@/lib/mock/field-visibility';
