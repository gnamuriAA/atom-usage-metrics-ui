import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Breakdown, OverviewStats, TrendPoint } from '../models/metrics.models';


@Injectable({ providedIn: 'root' })
export class MetricsDataService {
    getOverviewStats() : Observable<OverviewStats>  {
        return of({
            totalSessions: 18,
            activeUsers: 8,
            avgSessionSeconds: 864,     // 14m 24s
            foregroundSeconds: 15540,   // 4h 19m
            forceCloseRate: 0.167,      // 16.7%
        });
    }

    getSessionTrend(): Observable<TrendPoint[]> {
        return of([
            { date: 'Sep 06', sessions: 1, foregroundMinutes: 8 },
            { date: 'Sep 07', sessions: 2, foregroundMinutes: 14 },
            { date: 'Sep 08', sessions: 12, foregroundMinutes: 205 },
            { date: 'Sep 09', sessions: 2, foregroundMinutes: 12 },
        ]);
    }

    getEventMix(): Observable<Breakdown[]> {
        return of([
            { label: 'appOpen', value: 19 },
            { label: 'appBackgrounded', value: 12 },
            { label: 'forceCloseCheck', value: 3 },
            { label: 'sessionEnd', value: 2 },
        ]);
    }

    getNetworkTypes(): Observable<Breakdown[]> {
        return of([
            { label: 'wifi', value: 19 },
            { label: 'cellular', value: 12 },
            { label: 'none', value: 3 },
            { label: 'wired', value: 2 },
        ]);
    }

    getTopApps(): Observable<Breakdown[]> {
        return of([
            { label: 'SAFE', value: 11 },
            { label: 'ASOM', value: 5 },
            { label: 'ATOM Admin', value: 1 },
            { label: 'TechOps Portal', value: 1 },
        ]);
    }

    getTopStations() : Observable<Breakdown[]> {
        return of([
            { label: 'HYD', value: 5 },
            { label: 'DFW', value: 5 },
            { label: 'ORD', value: 2 },
            { label: 'LAX', value: 2 },
            { label: 'JFK', value: 2 },
            { label: 'MIA', value: 2 },
        ]);
    }
}