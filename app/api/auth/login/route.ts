import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/terminal';
import { setSessionCookie } from '@/lib/auth/session';
import { apiError } from '@/lib/auth/request';
import { findMockUser } from '@/lib/mock/users';

/**
 * POST /api/auth/login
 *
 * MVP build: credentials are checked against `lib/mock/users.ts` instead of
 * the Supabase `users` table, because this phase runs entirely on dummy data.
 * Everything else is unchanged and real — the same `jose` JWT is signed and
 * the same httpOnly cookie is set, so `middleware.ts` and
 * `getSessionFromCookies()` need no special-casing.
 *
 * To go live: swap `findMockUser` back for the Supabase lookup plus
 * `bcrypt.compare`. Nothing else in this file changes.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid credentials', 400);
    }

    const { email, password } = parsed.data;
    const user = findMockUser(email, password);

    if (!user) {
      return apiError('Invalid email or password', 401);
    }

    const response = NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
      error: null,
    });

    await setSessionCookie(response, { userId: user.id, role: user.role });

    return response;
  } catch (err) {
    console.error('[auth/login] unexpected', err);
    return apiError('Unable to login', 500);
  }
}
