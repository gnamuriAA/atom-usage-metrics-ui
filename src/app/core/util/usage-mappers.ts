
import { AppUsageEventDto, AppUsageSessionDto, AppUsageSessionFilter, AppUsageSummaryDto, Breakdown, DateRange, DeviceFilter, EventRow, OverviewStats, SessionStatus, UserRow, UserUsageSummaryDto } from '../models/metrics.models'
import { TrendPoint } from '../models/metrics.models';

const RANGE_DAYS: Record<Exclude<DateRange, 'all'>, number> = { '24h': 1, '7d': 7, '30d': 30 };

// deviceUsageSummary takes the date window as top-level args, separate from the filter.
export interface DeviceQueryArgs {
    filter: DeviceFilter;
    startedAfter?: string;
    startedBefore?: string;
}

// Maps the UI filter state onto the deviceUsageSummary query arguments.
export function toDeviceQuery(range: DateRange, station: string | null): DeviceQueryArgs {
    const filter: DeviceFilter = {};
    if (station) filter.stationCode = station;
    const args: DeviceQueryArgs = { filter };
    if (range !== 'all') {
        const now = new Date();
        const after = new Date(now);
        after.setDate(now.getDate() - RANGE_DAYS[range]);
        args.startedAfter = after.toISOString();
        args.startedBefore = now.toISOString();
    }
    return args;
}

// Maps the UI filter state onto the appUsageSessions query arguments.
export function toSessionFilter(range: DateRange, app: string | null, station: string | null = null, employeeId: string | null = null): AppUsageSessionFilter {
    const filter: AppUsageSessionFilter = {};
    if (app) filter.appName = app;
    if (station) filter.deviceStationCode = station;
    const emp = employeeId?.trim();
    if (emp) filter.employeeId = emp;
    if (range !== 'all') {
        const now = new Date();
        const after = new Date(now);
        after.setDate(now.getDate() - RANGE_DAYS[range]);
        filter.startedAfter = after.toISOString();
        filter.startedBefore = now.toISOString();
    }
    return filter;
}

// Users query honors the station filter too, via deviceStationCode.
export function toUserFilter(range: DateRange, app: string | null, station: string | null, employeeId: string | null = null): AppUsageSessionFilter {
    return toSessionFilter(range, app, station, employeeId);
}

function countBy<T>(items: T[], key: (i: T) => string | null | undefined): Breakdown[] {
    const m = new Map<string, number>();
    for (const item of items) {
        const k = key(item);
        if (!k) continue;
        m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function toOverviewStats(summary: AppUsageSummaryDto[], sessions: AppUsageSessionDto[]): OverviewStats {
    const totalSessions = summary.reduce((s, a) => s + a.sessionCount, 0);
    const foregroundSeconds = summary.reduce((s, a) => s + a.totalForegroundSeconds, 0);
    const forceCloses = summary.reduce((s, a) => s + a.forceCloseCount, 0);
    const activeUsers = new Set(sessions.map((s) => s.employeeId)).size; // distinct users, avoids per-app double count
    return {
        totalSessions,
        activeUsers,
        avgSessionSeconds: totalSessions ? Math.round(foregroundSeconds / totalSessions) : 0,
        foregroundSeconds,
        forceCloseRate: totalSessions ? forceCloses / totalSessions : 0
    };
}

export const toTopApps = (summary: AppUsageSummaryDto[]): Breakdown[] =>
    summary.map((a) => ({ label: a.appName, value: a.sessionCount })).sort((a, b) => b.value - a.value);

export const toEventMix = (sessions: AppUsageSessionDto[]): Breakdown[] =>
    countBy(sessions.flatMap((s) => s.events), (e) => e.eventType);

export const toNetworkTypes = (sessions: AppUsageSessionDto[]): Breakdown[] => 
    countBy(sessions.flatMap((s) => s.events), (e) => e.networkType);

export const toTopStations = (sessions: AppUsageSessionDto[]): Breakdown[] => 
    countBy(sessions, (e) => e.deviceStationCode);

export function toSessionTrend(session: AppUsageSessionDto[]): TrendPoint[] {
    const byDay = new Map<string, { sessions: number; seconds: number }>();
    for (const s of session) {
        const day = new Date(s.sessionStartTime).toISOString().slice(0, 10);
        const cur = byDay.get(day) ?? { sessions: 0, seconds: 0 };
        cur.sessions += 1;
        cur.seconds += s.foregroundDurationSeconds;
        byDay.set(day, cur);
    }

    return [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, v]) => ({ date: day, sessions: v.sessions, foregroundMinutes: Math.round(v.seconds / 60) }));
}

export function deriveSessionStatus(session: AppUsageSessionDto): SessionStatus {
    // Classify by presence, matching the backend: a crash outranks a force-close marker.
    const types = new Set((session.events ?? []).map((e) => e.eventType));
    if (types.has('appCrash')) return 'Crash';
    if (types.has('forceCloseCheck')) return 'Force-closed';
    if (types.has('sessionEnd')) return 'Ended';
    return 'Active';
}

// Foreground span of an event, when both foreground/background endpoints exist.
export function eventSegmentSeconds(e: AppUsageEventDto): number | null {
    if (!e.foregroundTimestamp || !e.backgroundTimestamp) return null;
    const secs = (new Date(e.backgroundTimestamp).getTime() - new Date(e.foregroundTimestamp).getTime()) / 1000;
    return secs > 0 ? secs : null;
}

export function toEventRows(sessions: AppUsageSessionDto[]): EventRow[] {
    return sessions
        .flatMap((s) =>
            s.events.map((e) => ({
                eventId: e.eventId,
                timestamp: e.timestamp,
                eventType: e.eventType,
                appName: s.appName,
                networkType: e.networkType,
                segmentSeconds: eventSegmentSeconds(e),
                sessionId: s.sessionId,
            }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function toEventsPerHour(rows: EventRow[]): number[] {
    const buckets = new Array<number>(24).fill(0);
    for (const r of rows) {
        buckets[new Date(r.timestamp).getHours()] += 1;
    }
    return buckets;
}

// Maps the server userUsageSummary rows onto the Users table view model.
export function toUserRows(rows: UserUsageSummaryDto[]): UserRow[] {
    return rows
        .map((r) => ({
            employeeId: r.employeeId,
            employeeName: r.employeeName ?? r.employeeId,
            appsUsed: [...r.appNames].sort(),
            stations: [...r.stationCodes].sort(),
            sessions: r.sessionCount,
            foregroundSeconds: r.totalForegroundSeconds,
            lastSeen: r.lastSeen,
        }))
        .sort((a, b) => b.foregroundSeconds - a.foregroundSeconds);
}

// --- Overview analytics mappers ---

export interface StabilityPoint {
    date: string;
    crashRate: number;      // 0..1
    forceCloseRate: number; // 0..1
    endRate: number;        // 0..1 (cleanly ended sessions)
}

// Daily crash / force-close / clean-end rate from each session's terminal status.
export function toStabilityTrend(sessions: AppUsageSessionDto[]): StabilityPoint[] {
    const byDay = new Map<string, { total: number; crash: number; forceClose: number; ended: number }>();
    for (const s of sessions) {
        const day = new Date(s.sessionStartTime).toISOString().slice(0, 10);
        const cur = byDay.get(day) ?? { total: 0, crash: 0, forceClose: 0, ended: 0 };
        const status = s.status ?? deriveSessionStatus(s);
        cur.total += 1;
        if (status === 'Crash') cur.crash += 1;
        else if (status === 'Force-closed') cur.forceClose += 1;
        else if (status === 'Ended') cur.ended += 1;
        byDay.set(day, cur);
    }
    return [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({
            date,
            crashRate: v.total ? v.crash / v.total : 0,
            forceCloseRate: v.total ? v.forceClose / v.total : 0,
            endRate: v.total ? v.ended / v.total : 0,
        }));
}

export interface ActiveUsersPoint {
    date: string;
    users: number;
}

// Distinct employees active per day (DAU).
export function toActiveUsersTrend(sessions: AppUsageSessionDto[]): ActiveUsersPoint[] {
    const byDay = new Map<string, Set<string>>();
    for (const s of sessions) {
        const day = new Date(s.sessionStartTime).toISOString().slice(0, 10);
        const set = byDay.get(day) ?? new Set<string>();
        if (s.employeeId) set.add(s.employeeId);
        byDay.set(day, set);
    }
    return [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, set]) => ({ date, users: set.size }));
}

export interface AppHeatmapData {
    points: [number, number, number][]; // [hour 0-23, appIndex, count]
    apps: string[];                     // app names, index-aligned with the y-axis
    max: number;
}

// Session counts bucketed by hour-of-day x app for a usage heatmap; apps ordered by volume.
export function toAppUsageHeatmap(sessions: AppUsageSessionDto[]): AppHeatmapData {
    const totals = new Map<string, number>();
    const grid = new Map<string, number>();
    for (const s of sessions) {
        const app = s.appName;
        if (!app) continue;
        const hour = new Date(s.sessionStartTime).getHours();
        totals.set(app, (totals.get(app) ?? 0) + 1);
        const key = `${hour}\u0000${app}`;
        grid.set(key, (grid.get(key) ?? 0) + 1);
    }
    const apps = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    const appIndex = new Map(apps.map((name, i) => [name, i]));
    let max = 0;
    const points = [...grid.entries()].map(([key, count]) => {
        const sep = key.indexOf('\u0000');
        const hour = Number(key.slice(0, sep));
        const app = key.slice(sep + 1);
        if (count > max) max = count;
        return [hour, appIndex.get(app)!, count] as [number, number, number];
    });
    return { points, apps, max };
}

// Session foreground-duration buckets for a distribution histogram.
export function toSessionLengthDistribution(sessions: AppUsageSessionDto[]): Breakdown[] {
    const buckets = [
        { label: '0-30s', max: 30 },
        { label: '30-60s', max: 60 },
        { label: '1-2m', max: 120 },
        { label: '2-5m', max: 300 },
        { label: '5-10m', max: 600 },
        { label: '10m+', max: Infinity },
    ];
    const counts = new Array<number>(buckets.length).fill(0);
    for (const s of sessions) {
        const secs = s.foregroundDurationSeconds ?? 0;
        const idx = buckets.findIndex((b) => secs < b.max);
        counts[idx === -1 ? buckets.length - 1 : idx] += 1;
    }
    return buckets.map((b, i) => ({ label: b.label, value: counts[i] }));
}