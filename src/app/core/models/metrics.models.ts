export type DateRange = '24h' | '7d' | '30d' | 'all';
export type SessionStatus = 'Active' | 'Ended' | 'Force-closed' | 'Crash';
export type NetworkType = 'wifi' | 'cellular' | 'wired' | 'none';
export type EventType = 'appOpen' | 'appBackgrounded' | 'forceCloseCheck' | 'sessionEnd';
export type Platform = 'iOS' | 'Web'

export interface Filters {
    range: DateRange;
    app: string | null;      // null = All apps 
    station: string | null;  // null = All stations
    employeeId: string | null; // null = All employees
}

// Server-side filter args for the appUsageSessions / userUsageSummary queries.
export interface AppUsageSessionFilter {
    appName?: string;
    appNames?: string[];
    deviceStationCode?: string;
    employeeId?: string;
    startedAfter?: string;
    startedBefore?: string;
}

export interface OverviewStats {
    totalSessions: number;
    activeUsers: number;
    avgSessionSeconds: number;
    foregroundSeconds: number;
    forceCloseRate: number; // 0..1
}

export interface TrendPoint {
    date: string;
    sessions: number;
    foregroundMinutes: number;
}

export interface Breakdown {
    label: string;
    value: number;
}

export interface Session {
    id: string;
    startedAt: string;
    app: string;
    appVersion: string;
    employeeName: string;
    employeeId: string;
    device: string;
    station: string;
    foregroundSeconds: number;
    events: number;
    status: SessionStatus;
}

export interface UsageEvent {
    id: string;
    timestamp: string;
    type: EventType;
    app: string; // Fixed typo
    network: NetworkType;
    segmentSeconds: number | null;
    sessionId: string;
}

export interface Device {
    id: string;
    station: string;
    platform: Platform;
    osVersion: string;
    sessions: number;
    foregroundSeconds: number;
    lastSeen: string;
}

export interface UserEngagement {
    id: string;
    name: string;
    employeeId: string;
    appsUsed: string[];
    station: string;
    sessions: number;
    foregroundSeconds: number;
    lastSeen: string;
}

export interface AppUsageEventDto {
    eventType: string;
    eventId: string;
    foregroundTimestamp: string | null;
    backgroundTimestamp: string | null;
    screen: string | null;
    crashReason: string | null;
    crashCallStack: string | null;
    networkType: string | null;
    timestamp: string;
}

export interface AppUsageSessionDto {
    _id: string;
    sessionId: string;
    appName: string;
    appId: string;
    appVersion: string;
    deviceId: string;
    employeeId: string;
    employeeName: string;
    deviceSerial: string;
    deviceStationCode: string;
    foregroundDurationSeconds: number;
    sessionStartTime: string;
    sessionEndTime: string | null;
    events: AppUsageEventDto[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    version: number;
    status: SessionStatus;
}
export interface AppUsageSummaryDto {
    appName: string;
    appId: string;
    totalForegroundSeconds: number;
    averageSessionSeconds: number;
    sessionCount: number;
    crashCount: number;
    forceCloseCount: number;
    uniqueUserCount: number;
}

// Flattened event (joined with its parent session) for the Events screen.
export interface EventRow {
    eventId: string;
    timestamp: string;
    eventType: string;
    appName: string;
    networkType: string | null;
    segmentSeconds: number | null;
    sessionId: string;
}

// Per-employee engagement rollup (aggregated client-side from sessions).
export interface UserRow {
    employeeId: string;
    employeeName: string;
    appsUsed: string[];
    stations: string[];
    sessions: number;
    foregroundSeconds: number;
    lastSeen: string | null;
}

// A single step in a user's app journey: how long they stayed foreground on one app
// before backgrounding it, and which app they opened next.
export interface JourneyStep {
    sessionId: string;
    appName: string;
    station: string | null;
    startedAt: string;
    foregroundSeconds: number;
    nextApp: string | null;
}

// A chronological journey of one employee across apps/sessions on the device.
export interface UserJourney {
    employeeId: string;
    employeeName: string;
    steps: JourneyStep[];
    totalForegroundSeconds: number;
}

// Server-side per-employee usage rollup from the userUsageSummary query.
export interface UserUsageSummaryDto {
    employeeId: string;
    employeeName: string | null;
    appNames: string[];
    appIds: string[];
    stationCodes: string[];
    sessionCount: number;
    totalForegroundSeconds: number;
    lastSeen: string | null;
}

// Server-side filter args for the deviceUsageSummary query.
export interface DeviceFilter {
    stationCode?: string;
    isActive?: boolean;
    serialNumber?: string;
    deviceType?: string;
}

export interface DeviceUsageSummaryDto {
    deviceId: string;
    serialNumber: string;
    stationCode: string | null;
    osType: string;
    osVersion: string | null;
    sessionCount: number;
    totalForegroundSeconds: number;
    lastSeen: string | null;
}

// Per-app reporting rollup used to populate the filter dropdowns.
export interface ReportingApp {
    appName: string;
    appId: string;
    stationCodes: string[];
    eventCount: number;
    lastSeen: string | null;
}

export interface AppUsageReportingApps {
    appNames: string[];
    stationCodes: string[];
    apps: ReportingApp[];
}