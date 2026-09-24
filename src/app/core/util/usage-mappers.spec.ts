import { describe, expect, it } from 'vitest';
import { toSessionFilter, toUserFilter, toUserJourneys } from './usage-mappers';
import { AppUsageSessionDto } from '../models/metrics.models';

function buildSession(overrides: Partial<AppUsageSessionDto> = {}): AppUsageSessionDto {
    return {
        _id: overrides.sessionId ?? 's1',
        sessionId: 's1',
        appName: 'Mail',
        appId: 'app-1',
        appVersion: '1.0',
        deviceId: 'd1',
        employeeId: 'e1',
        employeeName: 'Alice Smith',
        deviceSerial: 'ser-1',
        deviceStationCode: 'STN-1',
        foregroundDurationSeconds: 60,
        sessionStartTime: '2026-09-24T10:00:00.000Z',
        sessionEndTime: null,
        events: [],
        createdAt: '2026-09-24T10:00:00.000Z',
        createdBy: 'sys',
        updatedAt: '2026-09-24T10:00:00.000Z',
        updatedBy: 'sys',
        version: 1,
        status: 'Active',
        ...overrides,
    };
}

describe('toSessionFilter (employee filter support)', () => {
    it('sets employeeId when trimmed value is non-empty', () => {
        const f = toSessionFilter('all', null, null, '  EMP-42  ');
        expect(f.employeeId).toBe('EMP-42');
    });

    it('omits employeeId when null', () => {
        const f = toSessionFilter('all', null, null, null);
        expect(f.employeeId).toBeUndefined();
    });

    it('omits employeeId when only whitespace', () => {
        const f = toSessionFilter('all', null, null, '   ');
        expect(f.employeeId).toBeUndefined();
    });

    it('combines app, station, employee, and range', () => {
        const f = toSessionFilter('7d', 'Mail', 'STN-1', 'EMP-1');
        expect(f.appName).toBe('Mail');
        expect(f.deviceStationCode).toBe('STN-1');
        expect(f.employeeId).toBe('EMP-1');
        expect(f.startedAfter).toBeDefined();
        expect(f.startedBefore).toBeDefined();
    });

    it('does not set date bounds for "all" range', () => {
        const f = toSessionFilter('all', null);
        expect(f.startedAfter).toBeUndefined();
        expect(f.startedBefore).toBeUndefined();
    });

    it('toUserFilter delegates to toSessionFilter', () => {
        const f = toUserFilter('24h', 'Mail', 'STN-1', 'EMP-9');
        expect(f.appName).toBe('Mail');
        expect(f.deviceStationCode).toBe('STN-1');
        expect(f.employeeId).toBe('EMP-9');
    });
});

describe('toUserJourneys', () => {
    it('returns empty array when there are no sessions', () => {
        expect(toUserJourneys([])).toEqual([]);
    });

    it('builds a chronological journey per employee with nextApp linkage', () => {
        const sessions: AppUsageSessionDto[] = [
            buildSession({
                sessionId: 's2',
                employeeId: 'e1',
                appName: 'Calendar',
                sessionStartTime: '2026-09-24T11:00:00.000Z',
                foregroundDurationSeconds: 30,
            }),
            buildSession({
                sessionId: 's1',
                employeeId: 'e1',
                appName: 'Mail',
                sessionStartTime: '2026-09-24T10:00:00.000Z',
                foregroundDurationSeconds: 90,
            }),
        ];

        const journeys = toUserJourneys(sessions);
        expect(journeys).toHaveLength(1);
        const j = journeys[0];
        expect(j.employeeId).toBe('e1');
        expect(j.employeeName).toBe('Alice Smith');
        expect(j.totalForegroundSeconds).toBe(120);
        expect(j.steps.map((s) => s.sessionId)).toEqual(['s1', 's2']);
        expect(j.steps[0].nextApp).toBe('Calendar');
        expect(j.steps[1].nextApp).toBeNull();
        expect(j.steps[0].station).toBe('STN-1');
    });

    it('sorts journeys by total foreground time descending', () => {
        const sessions: AppUsageSessionDto[] = [
            buildSession({
                sessionId: 'a',
                employeeId: 'e1',
                foregroundDurationSeconds: 10,
                sessionStartTime: '2026-09-24T10:00:00.000Z',
            }),
            buildSession({
                sessionId: 'b',
                employeeId: 'e2',
                employeeName: 'Bob Jones',
                foregroundDurationSeconds: 500,
                sessionStartTime: '2026-09-24T10:00:00.000Z',
            }),
        ];
        const journeys = toUserJourneys(sessions);
        expect(journeys.map((j) => j.employeeId)).toEqual(['e2', 'e1']);
    });

    it('falls back to employeeId when employeeName is missing', () => {
        const sessions: AppUsageSessionDto[] = [
            buildSession({ employeeId: 'e9', employeeName: null as unknown as string }),
        ];
        const [j] = toUserJourneys(sessions);
        expect(j.employeeName).toBe('e9');
    });
});
