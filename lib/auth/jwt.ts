import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@/types/database.types';

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

/** Edge-safe JWT sign (works in middleware + Route Handlers). */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  const userId = payload.sub;
  const role = payload.role;

  if (!userId || typeof role !== 'string') {
    throw new Error('Invalid token payload');
  }

  return { userId, role: role as UserRole };
}
