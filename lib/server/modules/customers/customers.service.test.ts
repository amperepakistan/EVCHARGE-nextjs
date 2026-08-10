import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '@/lib/server/errors';
import type { ServerContext } from '@/lib/server/context';
import * as customersService from '@/lib/server/modules/customers/customers.service';

vi.mock('@/lib/server/modules/customers/customers.repository', () => ({
  listCustomersForVendor: vi.fn(),
  getCustomerForVendor: vi.fn(),
  listVendorTerminalsForOwner: vi.fn(),
}));

import * as customersRepo from '@/lib/server/modules/customers/customers.repository';

function makeCtx(): ServerContext {
  return {
    user: { userId: 'u1', role: 'vendor' },
    db: {} as ServerContext['db'],
    logger: { info: vi.fn(), error: vi.fn() },
  };
}

describe('customers.service tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when customer is not under vendor', async () => {
    vi.mocked(customersRepo.getCustomerForVendor).mockResolvedValue(null);
    await expect(
      customersService.getVendorCustomer(makeCtx(), 'vnd-a', 'own-other'),
    ).rejects.toMatchObject({ status: 404 } satisfies Partial<AppError>);
  });
});
