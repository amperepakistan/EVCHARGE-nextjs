/**
 * Demo accounts matching `scripts/seed-demo-users.mjs`.
 * Run that script against your Supabase project before using these.
 */
export const demoAccounts = [
  {
    email: 'vendor@evcharge.pk',
    password: 'Vendor123!',
    label: 'Demo Vendor',
    role: 'vendor' as const,
  },
  {
    email: 'owner@evcharge.pk',
    password: 'Owner123!',
    label: 'Demo Owner',
    role: 'owner' as const,
  },
  {
    email: 'admin@evcharge.pk',
    password: 'Admin123!',
    label: 'Demo Admin',
    role: 'super_admin' as const,
  },
  {
    email: 'staff@evcharge.pk',
    password: 'Staff123!',
    label: 'Demo Staff',
    role: 'staff' as const,
  },
];
