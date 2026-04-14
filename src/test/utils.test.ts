import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, getTimeAgo, compareVersions, isValidChaseData } from '../utils';

// ══════════════════════════════════════════════════════════════════════════
describe('formatDate', () => {
  it('returns N/A for undefined', () => {
    expect(formatDate(undefined)).toBe('N/A');
  });

  it('returns N/A for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('N/A');
  });

  it('returns N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A');
  });

  it('formats a valid ISO date string', () => {
    const result = formatDate('2025-12-25T00:00:00Z');
    expect(result).not.toBe('N/A');
    expect(result).not.toBe('Invalid Date');
  });
});

describe('getTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for undefined', () => {
    expect(getTimeAgo(undefined)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(getTimeAgo('bad-date')).toBe('');
  });

  it('shows minutes for recent timestamps', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(getTimeAgo(fiveMinutesAgo)).toBe('5m ago');
  });

  it('shows hours for timestamps a few hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('shows days for timestamps multiple days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeAgo(twoDaysAgo)).toBe('2d ago');
  });
});

describe('compareVersions', () => {
  it('returns 1 when v1 is greater', () => {
    expect(compareVersions('1.0.5', '1.0.4')).toBe(1);
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
  });

  it('returns -1 when v1 is less', () => {
    expect(compareVersions('1.0.4', '1.0.5')).toBe(-1);
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
  });

  it('returns 0 for equal versions', () => {
    expect(compareVersions('1.0.5', '1.0.5')).toBe(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });

  it('handles versions with different segment counts', () => {
    expect(compareVersions('1.0.0.1', '1.0.0')).toBe(1);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
  });
});

describe('isValidChaseData', () => {
  const baseId = { productApplicationIdentifier: 'test-id-123' };

  it('rejects data with no status arrays', () => {
    expect(isValidChaseData({ ...baseId })).toBe(false);
  });

  it('rejects data with empty status arrays', () => {
    expect(isValidChaseData({ ...baseId, cardAccountStatus: [] })).toBe(false);
  });

  it('accepts data with a non-empty cardAccountStatus', () => {
    expect(isValidChaseData({ ...baseId, cardAccountStatus: [{ productApplicationStatusCode: 'APPROVED' }] })).toBe(true);
  });

  it('accepts data with a non-empty depositAccountStatus', () => {
    expect(isValidChaseData({ ...baseId, depositAccountStatus: [{ productApplicationStatusCode: 'PEND_REVIEW' }] })).toBe(true);
  });

  it('accepts an array of applications where at least one is valid', () => {
    const valid = { ...baseId, cardAccountStatus: [{ productApplicationStatusCode: 'APPROVED' }] };
    const invalid = { productApplicationIdentifier: 'other-id', cardAccountStatus: [] };
    expect(isValidChaseData([invalid, valid])).toBe(true);
  });

  it('rejects array where all items are invalid', () => {
    expect(isValidChaseData([{ ...baseId, cardAccountStatus: [] }])).toBe(false);
  });

  it('rejects non-Chase JSON', () => {
    expect(isValidChaseData({ foo: 'bar' })).toBe(false);
  });
});
