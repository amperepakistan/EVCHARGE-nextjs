'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function logoutAction() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  redirect('/login');
}
