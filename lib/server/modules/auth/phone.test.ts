import { describe, expect, it } from 'vitest';
import { formatPkMobile, normalizePkMobile } from '@/lib/server/modules/auth/phone';

describe('normalizePkMobile', () => {
  it('normalizes the shapes drivers actually type', () => {
    for (const input of [
      '03001234567',
      '3001234567',
      '+923001234567',
      '+92 300 1234567',
      '0092-300-1234567',
      '923001234567',
    ]) {
      expect(normalizePkMobile(input)).toBe('+923001234567');
    }
  });

  it('rejects non-PK-mobile input', () => {
    for (const input of ['', 'abc', '0300123456', '030012345678', '+14155551234', '02112345678']) {
      expect(normalizePkMobile(input)).toBeNull();
    }
  });
});

describe('formatPkMobile', () => {
  it('groups a canonical number for display', () => {
    expect(formatPkMobile('+923001234567')).toBe('+92 300 1234567');
  });

  it('passes through anything it cannot group', () => {
    expect(formatPkMobile('+14155551234')).toBe('+14155551234');
  });
});
