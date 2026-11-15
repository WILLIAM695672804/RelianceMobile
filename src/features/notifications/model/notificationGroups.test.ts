import notifications from '@/test/fixtures/notifications/notifications.json';

import { notificationPageSchema, type AppNotification } from '../schemas/notificationSchemas';

import { categoryOf, elapsedOf, groupByPeriod, periodOf } from './notificationGroups';

const make = (type: unknown, createdAt: string | null = null): AppNotification => ({
  id: String(Math.random()),
  title: 't',
  body: null,
  payload: type === undefined ? null : { type },
  is_read: false,
  read_at: null,
  created_at: createdAt,
});

const NOW = new Date(2026, 10, 15, 18, 0, 0);

describe('categoryOf', () => {
  it.each([
    ['proposal', 'mission'],
    ['quote_received', 'mission'],
    ['job_status', 'mission'],
    ['hold_captured', 'finance'],
    ['wallet_recharge', 'finance'],
    ['new_message', 'message'],
    ['kyc_status', 'account'],
  ])('range %s dans %s', (type, expected) => {
    expect(categoryOf(make(type))).toBe(expected);
  });

  it('range une notification sans type dans le compte', () => {
    expect(categoryOf(make(undefined))).toBe('account');
    expect(categoryOf(make(42))).toBe('account');
  });

  it('classe les notifications capturées sur le serveur', () => {
    const page = notificationPageSchema.parse(notifications);
    expect(page.data.map(categoryOf)).toContain('mission');
  });
});

describe('periodOf et groupByPeriod', () => {
  it('distingue aujourd’hui, la semaine et l’antérieur', () => {
    expect(periodOf(new Date(2026, 10, 15, 8).toISOString(), NOW)).toBe('today');
    expect(periodOf(new Date(2026, 10, 12, 8).toISOString(), NOW)).toBe('week');
    expect(periodOf(new Date(2026, 9, 1).toISOString(), NOW)).toBe('older');
    expect(periodOf(null, NOW)).toBe('older');
    expect(periodOf('pas une date', NOW)).toBe('older');
  });

  it('omet les périodes vides et garde l’ordre', () => {
    const groups = groupByPeriod(
      [
        make('proposal', new Date(2026, 9, 1).toISOString()),
        make('proposal', new Date(2026, 10, 15, 9).toISOString()),
      ],
      NOW,
    );
    expect(groups.map((group) => group.period)).toEqual(['today', 'older']);
  });
});

describe('elapsedOf', () => {
  it.each([
    [0, 'now', 0],
    [2, 'minute', 2],
    [90, 'hour', 1],
    [60 * 24 * 3, 'day', 3],
    [60 * 24 * 15, 'week', 2],
  ])('%i minutes → %s', (minutes, unit, count) => {
    const date = new Date(NOW.getTime() - minutes * 60000).toISOString();
    expect(elapsedOf(date, NOW)).toEqual({ unit, count });
  });

  it('renvoie null sans date lisible', () => {
    expect(elapsedOf(null, NOW)).toBeNull();
    expect(elapsedOf('x', NOW)).toBeNull();
  });
});
