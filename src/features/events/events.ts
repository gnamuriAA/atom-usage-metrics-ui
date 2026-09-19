import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of, startWith, switchMap, Observable } from 'rxjs';
import type { EChartsCoreOption } from 'echarts/core';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { FilterStateService } from '../../app/core/services/filter-state.service';
import { ChartCard } from '../../app/shared/chart-card/chart-card';
import { EventRow } from '../../app/core/models/metrics.models';
import { toEventRows, toEventsPerHour, toSessionFilter } from '../../app/core/util/usage-mappers';
import { formatDuration } from '../../app/core/util/format';

type EventsSource = { rows: EventRow[]; loading: boolean };

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [DatePipe, ChartCard],
    templateUrl: './events.html',
    styleUrls: ['./events.scss'],
})
export class Events {
    private readonly api = inject(UsageApiService);
    private readonly auth = inject(AuthService);
    private readonly filterState = inject(FilterStateService);

    readonly hasToken = computed(() => !!this.auth.token());

    readonly eventType = signal<string>('');
    readonly network = signal<string>('');

    // Re-fetches whenever the auth token or the global filter (range/app) changes.
    private readonly request = computed(() => ({
        token: this.auth.token(),
        filter: toSessionFilter(this.filterState.range(), this.filterState.app()),
    }));

    private readonly source = toSignal(
        toObservable(this.request).pipe(
            switchMap(({ token, filter }): Observable<EventsSource> => {
                if (!token) {
                    return of({ rows: [], loading: false });
                }
                return this.api.getAppUsageSessions(filter).pipe(
                    map((sessions) => ({ rows: toEventRows(sessions), loading: false })),
                    startWith({ rows: [], loading: true } as EventsSource),
                    catchError(() => of<EventsSource>({ rows: [], loading: false }))
                );
            })
        ),
        { initialValue: { rows: [], loading: false } as EventsSource }
    );

    readonly loading = computed(() => this.source().loading);

    readonly eventTypes = computed(() =>
        [...new Set(this.source().rows.map((r) => r.eventType))].sort()
    );
    readonly networks = computed(() =>
        [...new Set(this.source().rows.map((r) => r.networkType).filter((n): n is string => !!n))].sort()
    );

    readonly rows = computed(() => {
        const type = this.eventType();
        const net = this.network();
        return this.source().rows.filter(
            (r) => (!type || r.eventType === type) && (!net || r.networkType === net)
        );
    });

    readonly perHourOptions = computed<EChartsCoreOption>(() => {
        const data = toEventsPerHour(this.rows());
        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: 30, right: 20, top: 20, bottom: 30 },
            xAxis: {
                type: 'category',
                data: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
            },
            yAxis: { type: 'value' },
            series: [
                {
                    type: 'bar',
                    data,
                    itemStyle: { color: '#7c6cf5', borderRadius: [6, 6, 0, 0] },
                    barWidth: '55%',
                },
            ],
        };
    });

    onType(e: Event): void {
        this.eventType.set((e.target as HTMLSelectElement).value);
    }
    onNetwork(e: Event): void {
        this.network.set((e.target as HTMLSelectElement).value);
    }

    fmtSegment(seconds: number | null): string {
        return seconds == null ? '—' : formatDuration(seconds);
    }

    eventColor(type: string): string {
        switch (type) {
            case 'appOpen': return '#16a34a';
            case 'appBackgrounded': return '#7c6cf5';
            case 'forceCloseCheck': return '#f43f5e';
            case 'sessionEnd': return '#64748b';
            default: return '#64748b';
        }
    }

    eventTint(type: string): string {
        return this.eventColor(type) + '1a';
    }
}
