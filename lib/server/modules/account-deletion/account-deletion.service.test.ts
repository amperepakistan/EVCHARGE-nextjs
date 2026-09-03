import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/modules/account-deletion/account-deletion.repository', () => ({
  findPendingByUserId: vi.fn(),
  findLatestByUserId: vi.fn(),
  createRequest: vi.fn(),
  cancelPendingRequest: vi.fn(),
  findRequestById: vi.fn(),
  listPendingWithUsers: vi.fn(),
  scrubAndDeactivateUser: vi.fn(async () => {}),
  markApproved: vi.fn(),
  markRejected: vi.fn(),
}));

import { AppError } from '@/lib/server/errors';
import type { ServerContext } from '@/lib/server/context';
import * as repo from '@/lib/server/modules/account-deletion/account-deletion.repository';
import {
  approveRequest,
  cancelMyRequest,
  createMyRequest,
  getMyRequest,
  rejectRequest,
} from '@/lib/server/modules/account-deletion/account-deletion.service';

const DRIVER_ID = '11111111-1111-1111-1111-111111111111';
const ADMIN_ID = '22222222-2222-2222-2222-222222222222';
const REQUEST_ID = '33333333-3333-3333-3333-333333333333';

function ctx(role: 'driver' | 'super_admin' | 'staff' | 'vendor', userId = DRIVER_ID): ServerContext {
  return {
    user: { userId, role },
    db: {} as ServerContext['db'],
    logger: { info: vi.fn(), error: vi.fn() },
  };
}

function pendingRequest(overrides: Partial<repo.DeletionRequestRecord> = {}): repo.DeletionRequestRecord {
  return {
    id: REQUEST_ID,
    userId: DRIVER_ID,
    reason: null,
    status: 'pending',
    adminNote: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createMyRequest', () => {
  it('rejects non-drivers', async () => {
    await expect(createMyRequest(ctx('vendor'), {})).rejects.toMatchObject({ status: 403 });
  });

  it('rejects when a pending request already exists', async () => {
    vi.mocked(repo.findPendingByUserId).mockResolvedValue(pendingRequest());
    await expect(createMyRequest(ctx('driver'), {})).rejects.toMatchObject({ status: 409 });
    expect(repo.createRequest).not.toHaveBeenCalled();
  });

  it('creates a pending request', async () => {
    vi.mocked(repo.findPendingByUserId).mockResolvedValue(null);
    vi.mocked(repo.createRequest).mockResolvedValue(pendingRequest({ reason: 'moving' }));

    const result = await createMyRequest(ctx('driver'), { reason: 'moving' });

    expect(result).toMatchObject({ id: REQUEST_ID, status: 'pending', reason: 'moving' });
    expect(repo.createRequest).toHaveBeenCalledWith(expect.anything(), DRIVER_ID, 'moving');
  });
});

describe('getMyRequest / cancelMyRequest', () => {
  it('returns null when there is no request', async () => {
    vi.mocked(repo.findLatestByUserId).mockResolvedValue(null);
    await expect(getMyRequest(ctx('driver'))).resolves.toBeNull();
  });

  it('cancels a pending request', async () => {
    vi.mocked(repo.cancelPendingRequest).mockResolvedValue(
      pendingRequest({ status: 'cancelled' }),
    );
    const result = await cancelMyRequest(ctx('driver'));
    expect(result.status).toBe('cancelled');
  });

  it('404s when there is nothing to cancel', async () => {
    vi.mocked(repo.cancelPendingRequest).mockResolvedValue(null);
    await expect(cancelMyRequest(ctx('driver'))).rejects.toMatchObject({ status: 404 });
  });
});

describe('approveRequest', () => {
  it('scrubs PII then marks approved', async () => {
    vi.mocked(repo.findRequestById).mockResolvedValue(pendingRequest());
    vi.mocked(repo.markApproved).mockResolvedValue(
      pendingRequest({ status: 'approved', reviewedBy: ADMIN_ID }),
    );

    const result = await approveRequest(ctx('super_admin', ADMIN_ID), REQUEST_ID);

    expect(repo.scrubAndDeactivateUser).toHaveBeenCalledWith(expect.anything(), DRIVER_ID);
    expect(repo.markApproved).toHaveBeenCalledWith(expect.anything(), REQUEST_ID, ADMIN_ID);
    expect(result.status).toBe('approved');
  });

  it('rejects non-admins', async () => {
    await expect(approveRequest(ctx('driver'), REQUEST_ID)).rejects.toBeInstanceOf(AppError);
  });
});

describe('rejectRequest', () => {
  it('requires an admin note', async () => {
    await expect(rejectRequest(ctx('staff', ADMIN_ID), REQUEST_ID, {})).rejects.toMatchObject({
      status: 400,
    });
  });

  it('marks rejected with the note', async () => {
    vi.mocked(repo.findRequestById).mockResolvedValue(pendingRequest());
    vi.mocked(repo.markRejected).mockResolvedValue(
      pendingRequest({ status: 'rejected', adminNote: 'keep account' }),
    );

    const result = await rejectRequest(ctx('staff', ADMIN_ID), REQUEST_ID, {
      adminNote: 'keep account',
    });

    expect(repo.scrubAndDeactivateUser).not.toHaveBeenCalled();
    expect(result.status).toBe('rejected');
  });
});
