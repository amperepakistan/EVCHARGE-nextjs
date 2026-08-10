import type { ServerContext } from '@/lib/server/context';
import type { PatchDriverInput } from '@/lib/server/modules/drivers/drivers.schema';

export type DriverProfile = {
  id: string;
  userId: string | null;
  email: string | null;
  phoneNumber: string | null;
  preferredVehicleKey: string | null;
  fullName: string | null;
};

export async function findDriverByUserId(
  ctx: ServerContext,
  userId: string,
): Promise<DriverProfile | null> {
  const { data: driver, error } = await ctx.db
    .from('drivers')
    .select('id, user_id, email, phone_number, preferred_vehicle_key')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!driver) return null;

  const { data: user } = await ctx.db
    .from('users')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle();

  return {
    id: driver.id,
    userId: driver.user_id,
    email: driver.email,
    phoneNumber: driver.phone_number,
    preferredVehicleKey: driver.preferred_vehicle_key,
    fullName: user?.full_name ?? null,
  };
}

export async function updateDriverForUser(
  ctx: ServerContext,
  userId: string,
  input: PatchDriverInput,
): Promise<DriverProfile> {
  if (input.fullName !== undefined) {
    const { error } = await ctx.db
      .from('users')
      .update({ full_name: input.fullName })
      .eq('id', userId);
    if (error) throw new Error(error.message);
  }

  const driverPatch: {
    phone_number?: string | null;
    preferred_vehicle_key?: string | null;
  } = {};
  if (input.phoneNumber !== undefined) driverPatch.phone_number = input.phoneNumber;
  if (input.preferredVehicleKey !== undefined) {
    driverPatch.preferred_vehicle_key = input.preferredVehicleKey;
  }

  if (Object.keys(driverPatch).length > 0) {
    const { error } = await ctx.db.from('drivers').update(driverPatch).eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  const profile = await findDriverByUserId(ctx, userId);
  if (!profile) throw new Error('Driver profile missing');
  return profile;
}
