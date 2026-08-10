import { findMockUser, type MockUser } from '@/lib/mock/users';

/**
 * MVP: credentials checked against mock users.
 * Swap for Supabase `users` + bcrypt when going live.
 */
export function findUserByCredentials(email: string, password: string): MockUser | null {
  return findMockUser(email, password);
}
