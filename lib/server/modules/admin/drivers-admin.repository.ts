import type { ServerContext } from '@/lib/server/context';

export type AdminDriverListRow = {
  id: string;
  userId: string | null;
  email: string | null;
  phoneNumber: string | null;
  preferredVehicleKey: string | null;
  fullName: string | null;
  isActive: boolean | null;
  createdAt: string;
  sessionCount: number;
  totalKwh: number;
};

export type AdminDriverDetail = AdminDriverListRow & {
  recentSessions: {
    id: string;
    terminal_id: string;
    terminal_name: string | null;
    started_at: string;
    ended_at: string | null;
    kwh_delivered: number | null;
    amount_charged: number | null;
  }[];
};

export async function listDrivers(
  ctx: ServerContext,
  limit = 200,
): Promise<AdminDriverListRow[]> {
  const { data: drivers, error } = await ctx.db
    .from('drivers')
    .select('id, user_id, email, phone_number, preferred_vehicle_key, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const rows = drivers ?? [];
  if (rows.length === 0) return [];

  const userIds = rows.map((d) => d.user_id).filter((id): id is string => Boolean(id));
  const driverIds = rows.map((d) => d.id);

  const [{ data: users }, { data: sessions, error: sessionError }] = await Promise.all([
    userIds.length > 0
      ? ctx.db.from('users').select('id, full_name, email, is_active').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string; is_active: boolean }[] }),
    ctx.db
      .from('charging_sessions')
      .select('driver_id, kwh_delivered')
      .in('driver_id', driverIds),
  ]);

  if (sessionError) throw new Error(sessionError.message);

  const userById = new Map((users ?? []).map((u) => [u.id, u]));
  const statsByDriver = new Map<string, { count: number; kwh: number }>();
  for (const s of sessions ?? []) {
    if (!s.driver_id) continue;
    const prev = statsByDriver.get(s.driver_id) ?? { count: 0, kwh: 0 };
    statsByDriver.set(s.driver_id, {
      count: prev.count + 1,
      kwh: prev.kwh + Number(s.kwh_delivered ?? 0),
    });
  }

  return rows.map((d) => {
    const user = d.user_id ? userById.get(d.user_id) : undefined;
    const stats = statsByDriver.get(d.id) ?? { count: 0, kwh: 0 };
    return {
      id: d.id,
      userId: d.user_id,
      email: user?.email ?? d.email,
      phoneNumber: d.phone_number,
      preferredVehicleKey: d.preferred_vehicle_key,
      fullName: user?.full_name ?? null,
      isActive: user?.is_active ?? null,
      createdAt: d.created_at,
      sessionCount: stats.count,
      totalKwh: stats.kwh,
    };
  });
}

export async function getDriverDetail(
  ctx: ServerContext,
  driverId: string,
): Promise<AdminDriverDetail | null> {
  const { data: driver, error } = await ctx.db
    .from('drivers')
    .select('id, user_id, email, phone_number, preferred_vehicle_key, created_at')
    .eq('id', driverId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!driver) return null;

  let fullName: string | null = null;
  let isActive: boolean | null = null;
  let email = driver.email;

  if (driver.user_id) {
    const { data: user, error: userError } = await ctx.db
      .from('users')
      .select('full_name, email, is_active')
      .eq('id', driver.user_id)
      .maybeSingle();
    if (userError) throw new Error(userError.message);
    fullName = user?.full_name ?? null;
    isActive = user?.is_active ?? null;
    email = user?.email ?? driver.email;
  }

  const [{ data: sessions, error: sessionError }, { data: allStats, error: statsError }] =
    await Promise.all([
      ctx.db
        .from('charging_sessions')
        .select('id, terminal_id, started_at, ended_at, kwh_delivered, amount_charged')
        .eq('driver_id', driverId)
        .order('started_at', { ascending: false })
        .limit(50),
      ctx.db
        .from('charging_sessions')
        .select('kwh_delivered')
        .eq('driver_id', driverId),
    ]);

  if (sessionError) throw new Error(sessionError.message);
  if (statsError) throw new Error(statsError.message);

  const terminalIds = [...new Set((sessions ?? []).map((s) => s.terminal_id))];
  let nameById = new Map<string, string>();
  if (terminalIds.length > 0) {
    const { data: terminals, error: termError } = await ctx.db
      .from('terminals')
      .select('id, name')
      .in('id', terminalIds);
    if (termError) throw new Error(termError.message);
    nameById = new Map((terminals ?? []).map((t) => [t.id, t.name]));
  }

  const recentSessions = (sessions ?? []).map((s) => ({
    ...s,
    terminal_name: nameById.get(s.terminal_id) ?? null,
  }));

  const totalKwh = (allStats ?? []).reduce(
    (sum, s) => sum + Number(s.kwh_delivered ?? 0),
    0,
  );

  return {
    id: driver.id,
    userId: driver.user_id,
    email,
    phoneNumber: driver.phone_number,
    preferredVehicleKey: driver.preferred_vehicle_key,
    fullName,
    isActive,
    createdAt: driver.created_at,
    sessionCount: (allStats ?? []).length,
    totalKwh,
    recentSessions,
  };
}

export async function findDriverUserId(
  ctx: ServerContext,
  driverId: string,
): Promise<string | null> {
  const { data, error } = await ctx.db
    .from('drivers')
    .select('user_id')
    .eq('id', driverId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.user_id ?? null;
}

export async function updateDriverEmailRows(
  ctx: ServerContext,
  driverId: string,
  userId: string,
  email: string,
) {
  const { error: userError } = await ctx.db
    .from('users')
    .update({ email })
    .eq('id', userId);
  if (userError) throw new Error(userError.message);

  const { error: driverError } = await ctx.db
    .from('drivers')
    .update({ email })
    .eq('id', driverId);
  if (driverError) throw new Error(driverError.message);
}
