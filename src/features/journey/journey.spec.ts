import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Journey } from './journey';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { FilterStateService } from '../../app/core/services/filter-state.service';
import { AppUsageSessionDto } from '../../app/core/models/metrics.models';

function buildSession(overrides: Partial<AppUsageSessionDto> = {}): AppUsageSessionDto {
    return {
        _id: 's1',
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

function makeAuthStub(token: string | null) {
    const t = signal<string | null>(token);
    return { token: t.asReadonly() } as unknown as AuthService;
}

function makeFilterStub() {
    const range = signal<'all'>('all');
    const app = signal<string | null>(null);
    const station = signal<string | null>(null);
    const employeeId = signal<string | null>(null);
    return {
        range: range.asReadonly(),
        app: app.asReadonly(),
        station: station.asReadonly(),
        employeeId: employeeId.asReadonly(),
    } as unknown as FilterStateService;
}

function configure(auth: AuthService, api: Partial<UsageApiService>) {
    return TestBed.configureTestingModule({
        imports: [Journey],
        providers: [
            { provide: AuthService, useValue: auth },
            { provide: FilterStateService, useValue: makeFilterStub() },
            { provide: UsageApiService, useValue: api },
        ],
    }).compileComponents();
}

describe('Journey component', () => {
    beforeEach(() => TestBed.resetTestingModule());

    it('shows access-token prompt when no token', async () => {
        await configure(makeAuthStub(null), { getAppUsageSessions: () => of([]) });
        const fixture = TestBed.createComponent(Journey);
        fixture.detectChanges();
        await fixture.whenStable();
        const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
        expect(fixture.componentInstance.hasToken()).toBe(false);
        expect(html).toContain('Access token required');
    });

    it('renders a journey card per employee with steps and next-app', async () => {
        const sessions = [
            buildSession({ sessionId: 's1', appName: 'Mail', sessionStartTime: '2026-09-24T10:00:00.000Z', foregroundDurationSeconds: 60 }),
            buildSession({ sessionId: 's2', appName: 'Calendar', sessionStartTime: '2026-09-24T11:00:00.000Z', foregroundDurationSeconds: 45 }),
        ];
        await configure(makeAuthStub('tok'), { getAppUsageSessions: () => of(sessions) });
        const fixture = TestBed.createComponent(Journey);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const journeys = fixture.componentInstance.journeys();
        expect(journeys).toHaveLength(1);
        expect(journeys[0].steps).toHaveLength(2);
        expect(journeys[0].steps[0].nextApp).toBe('Calendar');

        const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
        expect(html).toContain('Alice Smith');
        expect(html).toContain('Mail');
        expect(html).toContain('Calendar');
        expect(html).toContain('opened');
    });

    it('shows empty state when API returns no sessions', async () => {
        await configure(makeAuthStub('tok'), { getAppUsageSessions: () => of([]) });
        const fixture = TestBed.createComponent(Journey);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
        expect(fixture.componentInstance.journeys()).toEqual([]);
        expect(html).toContain('No journeys found');
    });

    it('recovers to empty journeys when API errors out', async () => {
        await configure(makeAuthStub('tok'), {
            getAppUsageSessions: () => throwError(() => new Error('boom')),
        });
        const fixture = TestBed.createComponent(Journey);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(fixture.componentInstance.loading()).toBe(false);
        expect(fixture.componentInstance.journeys()).toEqual([]);
    });

    it('fmtDuration formats seconds via shared helper', async () => {
        await configure(makeAuthStub('tok'), { getAppUsageSessions: () => of([]) });
        const fixture = TestBed.createComponent(Journey);
        expect(fixture.componentInstance.fmtDuration(65)).toBe('1m 5s');
        expect(fixture.componentInstance.fmtDuration(3600)).toBe('1h 0m');
    });

    it('initials builds two-letter uppercase initials, single-letter, and ? fallback', async () => {
        await configure(makeAuthStub('tok'), { getAppUsageSessions: () => of([]) });
        const c = TestBed.createComponent(Journey).componentInstance;
        expect(c.initials('Alice Smith')).toBe('AS');
        expect(c.initials('  cher  ')).toBe('C');
        expect(c.initials('')).toBe('?');
        expect(c.initials('   ')).toBe('?');
    });

    it('avatarColor returns a value from the palette and is deterministic', async () => {
        await configure(makeAuthStub('tok'), { getAppUsageSessions: () => of([]) });
        const c = TestBed.createComponent(Journey).componentInstance;
        const palette = ['#7c6cf5', '#16a34a', '#e11d78', '#2563eb', '#db2777', '#0d9488', '#a16207', '#0ea5e9'];
        const color = c.avatarColor('e1');
        expect(palette).toContain(color);
        expect(c.avatarColor('e1')).toBe(color);
        expect(c.avatarColor('')).toBe(palette[0]);
    });
});
