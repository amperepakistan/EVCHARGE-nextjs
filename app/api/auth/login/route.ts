import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/terminal';
import { signToken } from '@/lib/auth/jwt';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { apiError } from '@/lib/auth/request';

/**
 * POST /api/auth/login
 * - Dashboard: sets httpOnly session cookie
 * - Flutter: use `data.token` with Authorization: Bearer
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid credentials', 400);
    }

    const { email, password } = parsed.data;
    const { data: user, error } = await supabaseServer()
      .from('users')
      .select('id, email, role, full_name, password_hash, is_active')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('[auth/login] db error', error.message);
      return apiError('Unable to login', 500);
    }

    if (!user || !user.is_active) {
      return apiError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return apiError('Invalid email or password', 401);
    }

    const token = await signToken({ userId: user.id, role: user.role });

    const response = NextResponse.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
      },
      error: null,
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('[auth/login] unexpected', err);
    return apiError('Unable to login', 500);
  }
}
