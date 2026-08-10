import { describe, expect, it } from 'vitest';
import { createTerminalSchema, loginSchema } from '@/lib/validations/terminal';

/** Compatibility re-exports from lib/validations/terminal still work. */
describe('loginSchema (re-export)', () => {
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

describe('createTerminalSchema (re-export)', () => {
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
