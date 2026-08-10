import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserRole } from '@/types/database.types';

export type SessionUser = {
  userId: string;
  role: UserRole;
};

export type AppLogger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

/**
 * Framework-neutral request context passed into services.
 * Never import next/* into modules that receive this.
 */
export type ServerContext = {
  user: SessionUser | null;
  db: SupabaseClient<Database>;
  logger: AppLogger;
};

export const defaultLogger: AppLogger = {
  info: (message, meta) => {
    if (meta) console.info(message, meta);
    else console.info(message);
  },
  error: (message, meta) => {
    if (meta) console.error(message, meta);
    else console.error(message);
  },
};
