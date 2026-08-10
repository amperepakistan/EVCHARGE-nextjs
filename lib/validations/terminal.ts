/**
 * @deprecated Import from `@/lib/server/modules/terminals/terminals.schema`
 * or `@/lib/server/modules/auth/auth.schema` instead.
 * Re-exports kept so existing callers keep compiling during the TECH-1 move.
 */
export {
  createTerminalSchema,
  updateTerminalSchema,
  type CreateTerminalInput,
  type UpdateTerminalInput,
} from '@/lib/server/modules/terminals/terminals.schema';

export {
  loginSchema,
  type LoginInput,
} from '@/lib/server/modules/auth/auth.schema';
