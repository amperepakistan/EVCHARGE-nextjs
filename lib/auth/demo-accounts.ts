/**
 * Demo accounts matching `scripts/seed-demo-users.mjs`.
 * Admin/staff stay seedable but are hidden from the login chips.
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
];
