import { signToken } from '@/lib/auth/jwt';
import { AppError } from '@/lib/server/errors';
import { findUserByCredentials } from '@/lib/server/modules/auth/auth.repository';
import { loginSchema, type LoginInput } from '@/lib/server/modules/auth/auth.schema';

export type PublicAuthUser = {
  id: string;
  email: string;
  role: string;
  fullName: string;
};

export type LoginResult = {
  user: PublicAuthUser;
  token: string;
};

export async function login(raw: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid credentials');
  }

  return loginWithInput(parsed.data);
}

export async function loginWithInput(input: LoginInput): Promise<LoginResult> {
  const user = findUserByCredentials(input.email, input.password);
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = await signToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    token,
  };
}
