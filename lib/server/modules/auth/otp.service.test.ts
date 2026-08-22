import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/jwt', () => ({
  signToken: vi.fn(async () => 'signed.jwt.token'),
}));

vi.mock('@/lib/server/modules/auth/otp.repository', () => ({
  saveChallenge: vi.fn(async () => {}),
  findChallenge: vi.fn(),
  incrementAttempts: vi.fn(async () => {}),
  deleteChallenge: vi.fn(async () => {}),
  verifyChallengeCode: vi.fn(),
  findUserByPhone: vi.fn(),
  createDriverUserByPhone: vi.fn(),
}));

import { signToken } from '@/lib/auth/jwt';
import { AppError } from '@/lib/server/errors';
import * as otpRepo from '@/lib/server/modules/auth/otp.repository';
import { DEV_OTP_CODE } from '@/lib/server/modules/auth/otp.sender';
import { requestOtp, verifyOtp } from '@/lib/server/modules/auth/otp.service';

const PHONE = '+923001234567';

function challenge(overrides: Partial<otpRepo.OtpChallenge> = {}): otpRepo.OtpChallenge {
  return {
    phoneNumber: PHONE,
    codeHash: 'hashed',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    attempts: 0,
    lastSentAt: new Date(Date.now() - 60_000).toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requestOtp', () => {
  it('rejects a non-PK number', async () => {
    await expect(requestOtp({ phoneNumber: '+14155551234' })).rejects.toBeInstanceOf(AppError);
  });

  it('stores a challenge for a local-format number and echoes the dev code', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(null);

    const result = await requestOtp({ phoneNumber: '0300 1234567' });

    expect(result.phoneNumber).toBe(PHONE);
    expect(result.devCode).toBe(DEV_OTP_CODE);
    expect(otpRepo.saveChallenge).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: PHONE, code: DEV_OTP_CODE }),
    );
  });

  it('rate limits a resend inside the cooldown', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(
      challenge({ lastSentAt: new Date().toISOString() }),
    );

    await expect(requestOtp({ phoneNumber: PHONE })).rejects.toMatchObject({ status: 429 });
    expect(otpRepo.saveChallenge).not.toHaveBeenCalled();
  });
});

describe('verifyOtp', () => {
  it('rejects a code of the wrong shape', async () => {
    await expect(verifyOtp({ phoneNumber: PHONE, code: '12' })).rejects.toBeInstanceOf(AppError);
  });

  it('rejects when no challenge is pending', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(null);
    await expect(verifyOtp({ phoneNumber: PHONE, code: DEV_OTP_CODE })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects an expired code and clears it', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(
      challenge({ expiresAt: new Date(Date.now() - 1_000).toISOString() }),
    );

    await expect(verifyOtp({ phoneNumber: PHONE, code: DEV_OTP_CODE })).rejects.toMatchObject({
      status: 400,
    });
    expect(otpRepo.deleteChallenge).toHaveBeenCalledWith(PHONE);
  });

  it('counts a wrong code against the attempt budget', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(challenge({ attempts: 2 }));
    vi.mocked(otpRepo.verifyChallengeCode).mockResolvedValue(false);

    await expect(verifyOtp({ phoneNumber: PHONE, code: '9999' })).rejects.toMatchObject({
      status: 401,
    });
    expect(otpRepo.incrementAttempts).toHaveBeenCalledWith(PHONE, 2);
    expect(otpRepo.createDriverUserByPhone).not.toHaveBeenCalled();
  });

  it('burns the code after too many attempts', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(challenge({ attempts: 5 }));

    await expect(verifyOtp({ phoneNumber: PHONE, code: DEV_OTP_CODE })).rejects.toMatchObject({
      status: 429,
    });
    expect(otpRepo.deleteChallenge).toHaveBeenCalledWith(PHONE);
  });

  it('signs in an existing driver', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(challenge());
    vi.mocked(otpRepo.verifyChallengeCode).mockResolvedValue(true);
    vi.mocked(otpRepo.findUserByPhone).mockResolvedValue({
      id: 'usr-driver-1',
      email: null,
      phoneNumber: PHONE,
      role: 'driver',
      fullName: 'Ali',
    });

    const result = await verifyOtp({ phoneNumber: PHONE, code: DEV_OTP_CODE });

    expect(result.isNewUser).toBe(false);
    expect(result.token).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      id: 'usr-driver-1',
      email: null,
      phoneNumber: PHONE,
      role: 'driver',
      fullName: 'Ali',
    });
    expect(signToken).toHaveBeenCalledWith({ userId: 'usr-driver-1', role: 'driver' });
    expect(otpRepo.createDriverUserByPhone).not.toHaveBeenCalled();
    expect(otpRepo.deleteChallenge).toHaveBeenCalledWith(PHONE);
  });

  it('creates the account on first verification', async () => {
    vi.mocked(otpRepo.findChallenge).mockResolvedValue(challenge());
    vi.mocked(otpRepo.verifyChallengeCode).mockResolvedValue(true);
    vi.mocked(otpRepo.findUserByPhone).mockResolvedValue(null);
    vi.mocked(otpRepo.createDriverUserByPhone).mockResolvedValue({
      id: 'usr-driver-2',
      email: null,
      phoneNumber: PHONE,
      role: 'driver',
      fullName: '',
    });

    const result = await verifyOtp({ phoneNumber: PHONE, code: DEV_OTP_CODE });

    expect(result.isNewUser).toBe(true);
    expect(otpRepo.createDriverUserByPhone).toHaveBeenCalledWith({
      phoneNumber: PHONE,
      fullName: undefined,
    });
  });
});
