import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '@/lib/server/errors';
import { loginSchema } from '@/lib/server/modules/auth/auth.schema';
import {
  createTerminalSchema,
  suggestTerminalSchema,
  updateTerminalSchema,
} from '@/lib/server/modules/terminals/terminals.schema';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import type { ServerContext } from '@/lib/server/context';

vi.mock('@/lib/server/modules/terminals/terminals.repository', () => ({
  listPublicTerminals: vi.fn(),
  listTerminalsForOwner: vi.fn(),
  listTerminalsForVendor: vi.fn(),
  getTerminalForVendor: vi.fn(),
  getLatestStatusSnapshots: vi.fn(),
  getTerminalById: vi.fn(),
  insertTerminal: vi.fn(async (_ctx, input) => ({ id: 'term-1', ...input })),
  insertScoutTerminal: vi.fn(async (_ctx, input) => ({ id: 'term-1', ...input })),
  updateTerminalById: vi.fn(async (_ctx, id, input) => ({ id, ...input })),
  deleteTerminalById: vi.fn(async () => undefined),
}));

import * as terminalsRepo from '@/lib/server/modules/terminals/terminals.repository';

function makeCtx(user: ServerContext['user']): ServerContext {
  return {
    user,
    db: {} as ServerContext['db'],
    logger: { info: vi.fn(), error: vi.fn() },
  };
}

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@evcharge.pk',
      password: 'password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = loginSchema.safeParse({
      email: 'admin@evcharge.pk',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('createTerminalSchema', () => {
  it('requires name and coordinates', () => {
    const result = createTerminalSchema.safeParse({
      name: 'Karachi DC-01',
      latitude: 24.8607,
      longitude: 67.0011,
      chargerClass: 'DC',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateTerminalSchema', () => {
  it('allows partial updates', () => {
    const result = updateTerminalSchema.safeParse({ name: 'Renamed' });
    expect(result.success).toBe(true);
  });
});

describe('terminals.service role guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects create without auth', async () => {
    await expect(
      terminalsService.createTerminal(makeCtx(null), {
        name: 'X',
        latitude: 1,
        longitude: 2,
      }),
    ).rejects.toMatchObject({ status: 401 } satisfies Partial<AppError>);
  });

  it('rejects create for owner role', async () => {
    await expect(
      terminalsService.createTerminal(
        makeCtx({ userId: 'u1', role: 'owner' }),
        { name: 'X', latitude: 1, longitude: 2 },
      ),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('allows create for vendor', async () => {
    const result = await terminalsService.createTerminal(
      makeCtx({ userId: 'u1', role: 'vendor' }),
      { name: 'X', latitude: 1, longitude: 2 },
    );
    expect(result).toMatchObject({ id: 'term-1', name: 'X' });
    expect(terminalsRepo.insertTerminal).toHaveBeenCalledOnce();
  });

  it('rejects delete for vendor', async () => {
    await expect(
      terminalsService.deleteTerminal(makeCtx({ userId: 'u1', role: 'vendor' }), 'term-1'),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('allows delete for staff', async () => {
    const result = await terminalsService.deleteTerminal(
      makeCtx({ userId: 'u1', role: 'staff' }),
      'term-1',
    );
    expect(result).toEqual({ id: 'term-1' });
    expect(terminalsRepo.deleteTerminalById).toHaveBeenCalledOnce();
  });

  it('rejects driver suggestions without auth', async () => {
    await expect(
      terminalsService.suggestTerminal(makeCtx(null), {
        name: 'Scout DC',
        latitude: 24.86,
        longitude: 67.0,
      }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('rejects suggestions from non-drivers', async () => {
    await expect(
      terminalsService.suggestTerminal(makeCtx({ userId: 'u1', role: 'vendor' }), {
        name: 'Scout DC',
        latitude: 24.86,
        longitude: 67.0,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('stores driver suggestions as non-public driver_submitted', async () => {
    const result = await terminalsService.suggestTerminal(
      makeCtx({ userId: 'drv-1', role: 'driver' }),
      {
        name: 'Scout DC',
        latitude: 24.86,
        longitude: 67.0,
        city: 'Karachi',
        notes: 'Behind the mall',
      },
    );
    expect(result).toMatchObject({ id: 'term-1', name: 'Scout DC' });
    expect(terminalsRepo.insertScoutTerminal).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Scout DC',
        amenities: ['__ampere_scout__', 'user:drv-1', 'notes:Behind the mall'],
      }),
    );
  });

  it('accepts a valid suggestion payload', () => {
    const result = suggestTerminalSchema.safeParse({
      name: 'Scout DC',
      latitude: 24.86,
      longitude: 67.0,
      notes: 'Optional',
    });
    expect(result.success).toBe(true);
  });

  it('returns 404 when vendor requests another vendor terminal', async () => {
    vi.mocked(terminalsRepo.getTerminalForVendor).mockResolvedValue(null);
    await expect(
      terminalsService.getTerminalForVendor(makeCtx({ userId: 'u1', role: 'vendor' }), 'vnd-a', 'term-b'),
    ).rejects.toMatchObject({ status: 404 });
  });
});
