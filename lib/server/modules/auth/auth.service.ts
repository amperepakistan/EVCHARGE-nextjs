import { signToken } from '@/lib/auth/jwt';
import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as authRepo from '@/lib/server/modules/auth/auth.repository';
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from '@/lib/server/modules/auth/auth.schema';

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
  let user;
  try {
    user = await authRepo.findUserByCredentials(input.email, input.password);
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to login');
  }

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

export async function signup(raw: unknown): Promise<LoginResult> {
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid signup body');
  }
  return signupWithInput(parsed.data);
}

export async function signupWithInput(input: SignupInput): Promise<LoginResult> {
  let user;
  try {
    user = await authRepo.createDriverUser({
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      throw new AppError(409, 'Email already registered');
    }
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to signup');
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

export async function getMe(ctx: ServerContext): Promise<PublicAuthUser> {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    const user = await authRepo.findUserById(ctx.user.userId);
    if (!user) {
      throw new AppError(401, 'Unauthorized');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Unable to load profile');
  }
}
