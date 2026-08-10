import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionFromCookies, SESSION_COOKIE } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import {
  defaultLogger,
  type ServerContext,
  type SessionUser,
} from '@/lib/server/context';

/** Resolve Bearer (Flutter) or session cookie (dashboard) without throwing. */
export async function resolveSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const header = req.headers.get('authorization');
  let token: string | undefined;

  if (header?.startsWith('Bearer ')) {
    token = header.slice('Bearer '.length).trim();
  } else {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  }

  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

/** Thin Next.js adapter — may use NextRequest. Do not call from lib/server/modules. */
export async function createContext(req: NextRequest): Promise<ServerContext> {
  return {
    user: await resolveSessionUser(req),
    db: supabaseServer(),
    logger: defaultLogger,
  };
}

/** For dashboard Server Components — cookie session only. */
export async function createContextFromCookies(): Promise<ServerContext> {
  const payload = await getSessionFromCookies();
  return {
    user: payload ? { userId: payload.userId, role: payload.role } : null,
    db: supabaseServer(),
    logger: defaultLogger,
  };
}
