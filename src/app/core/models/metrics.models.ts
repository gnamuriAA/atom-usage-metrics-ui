export type DateRange = '24h' | '7d' | '30d' | 'all';
export type SessionStatus = 'active' | 'ended' | 'force-closed';
export type NetworkType = 'wifi' | 'cellular' | 'wired' | 'none';
export type EventType = 'appOpen' | 'appBackgrounded' | 'forceCloseCheck' | 'sessionEnd';
export type Platform = 'iOS' | 'Web'

export interface Filters {
    range: DateRange;
    app: string | null;      // null = All apps 
    station: string | null;  // null = All stations
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
    app: string;
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