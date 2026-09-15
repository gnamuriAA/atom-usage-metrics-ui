
import { AppUsageSessionDto, AppUsageSummaryDto, Breakdown, OverviewStats } from '../models/metrics.models'
import { TrendPoint } from '../models/metrics.models';

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