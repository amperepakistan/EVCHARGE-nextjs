import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/jwt', () => ({
  signToken: vi.fn(async () => 'signed.jwt.token'),
}));

vi.mock('@/lib/server/modules/auth/auth.repository', () => ({
  findUserByCredentials: vi.fn(),
}));

import { signToken } from '@/lib/auth/jwt';
import { AppError } from '@/lib/server/errors';
import { findUserByCredentials } from '@/lib/server/modules/auth/auth.repository';
import { login } from '@/lib/server/modules/auth/auth.service';

describe('auth.service login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid body', async () => {
    await expect(login({ email: 'bad', password: 'short' })).rejects.toBeInstanceOf(AppError);
  });

  it('rejects bad credentials', async () => {
    vi.mocked(findUserByCredentials).mockReturnValue(null);
    await expect(
      login({ email: 'nobody@ampere.pk', password: 'demo1234' }),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid email or password' });
  });

  it('returns user and token on success', async () => {
    vi.mocked(findUserByCredentials).mockReturnValue({
      id: 'usr-admin-1',
      email: 'admin@ampere.pk',
      password: 'demo1234',
      role: 'super_admin',
      fullName: 'Platform Admin',
      organisation: 'Ampere',
    });

    const result = await login({ email: 'admin@ampere.pk', password: 'demo1234' });

    expect(result.token).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      id: 'usr-admin-1',
      email: 'admin@ampere.pk',
      role: 'super_admin',
      fullName: 'Platform Admin',
    });
    expect(signToken).toHaveBeenCalledWith({
      userId: 'usr-admin-1',
      role: 'super_admin',
    });
  });
});
