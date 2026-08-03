import type { UserRole } from '@/types/database.types';
import { OWNER_ID_MALL, OWNER_ID_SOCIETY, VENDOR_ID } from '@/lib/mock/terminals';

export interface MockUser {
  id: string;
  email: string;
  /** Plaintext on purpose — this is a demo build with no database behind it.
   *  Hashing a hardcoded constant would add ceremony, not security. */
  password: string;
  role: UserRole;
  fullName: string;
  /** Which vendor/owner tenant this login is scoped to. */
  vendorId?: string;
  ownerId?: string;
  organisation: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'usr-vendor-1',
    email: 'vendor@ampere.pk',
    password: 'demo1234',
    role: 'vendor',
    fullName: 'Bilal Ahmed',
    vendorId: VENDOR_ID,
    organisation: 'VoltGrid Services',
  },
  {
    id: 'usr-owner-1',
    email: 'owner@ampere.pk',
    password: 'demo1234',
    role: 'owner',
    fullName: 'Sana Iqbal',
    ownerId: OWNER_ID_MALL,
    organisation: 'Dolmen Group',
  },
  {
    // Second owner exists to demonstrate field-visibility tiering — this one
    // cannot see revenue. See lib/mock/field-visibility.ts.
    id: 'usr-owner-2',
    email: 'owner.basic@ampere.pk',
    password: 'demo1234',
    role: 'owner',
    fullName: 'Imran Shah',
    ownerId: OWNER_ID_SOCIETY,
    organisation: 'Askari Housing Society',
  },
  {
    id: 'usr-admin-1',
    email: 'admin@ampere.pk',
    password: 'demo1234',
    role: 'super_admin',
    fullName: 'Platform Admin',
    organisation: 'Ampere',
  },
];

export function findMockUser(email: string, password: string): MockUser | null {
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return null;
  return user;
}

export function mockUserById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

/** Demo accounts surfaced as quick-fill buttons on the sign-in page. */
export const demoAccounts = mockUsers.map((u) => ({
  email: u.email,
  password: u.password,
  label: u.organisation,
  role: u.role,
}));
