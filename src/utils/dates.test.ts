import { describe, expect, it } from 'vitest';
import { todayIsoDate } from './dates';

describe('todayIsoDate', () => {
    it('formats the local date as YYYY-MM-DD with zero padding', () => {
        // Local-time constructor: the answer must not depend on the machine's zone
        expect(todayIsoDate(new Date(2026, 0, 5, 0, 30))).toBe('2026-01-05');
        expect(todayIsoDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
    });

    it('uses the local day even when the UTC day differs', () => {
        // 00:30 local on the 5th. Anywhere east of UTC this is still the 4th in UTC,
        // which is exactly what `toISOString().slice(0, 10)` used to return.
        const justAfterMidnight = new Date(2026, 0, 5, 0, 30);

        expect(todayIsoDate(justAfterMidnight)).toBe('2026-01-05');

        if (justAfterMidnight.getTimezoneOffset() < 0) {
            expect(justAfterMidnight.toISOString().slice(0, 10)).toBe('2026-01-04');
        }
    });
});
