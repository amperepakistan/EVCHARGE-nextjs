import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as customersRepo from '@/lib/server/modules/customers/customers.repository';

export async function listVendorCustomers(ctx: ServerContext, vendorId: string) {
  try {
    return await customersRepo.listCustomersForVendor(ctx, vendorId);
  } catch (err) {
    ctx.logger.error('[customers] list failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list customers');
  }
}

export async function getVendorCustomer(
  ctx: ServerContext,
  vendorId: string,
  ownerId: string,
) {
  try {
    const customer = await customersRepo.getCustomerForVendor(ctx, vendorId, ownerId);
    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }
    return customer;
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[customers] get failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load customer');
  }
}

export async function listCustomerTerminals(
  ctx: ServerContext,
  vendorId: string,
  ownerId: string,
) {
  try {
    return await customersRepo.listVendorTerminalsForOwner(ctx, vendorId, ownerId);
  } catch (err) {
    ctx.logger.error('[customers] terminals failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list terminals');
  }
}
