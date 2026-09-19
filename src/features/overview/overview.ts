import { Component, computed, inject } from "@angular/core";
import { toSignal, toObservable } from "@angular/core/rxjs-interop";
import { StatCard } from "../../app/shared/stat-card/stat-card";
import { ChartCard } from "../../app/shared/chart-card/chart-card";
import { MetricsDataService } from "../../app/core/services/metrics-data.service";
import { EChartsCoreOption } from "echarts/types/dist/core";
import { UsageApiService } from "../../app/core/services/usage-api.service";
import { AuthService } from "../../app/core/services/auth.service";
import { AppUsageSessionDto, AppUsageSummaryDto } from "../../app/core/models/metrics.models";
import { catchError, forkJoin, of, startWith, map, switchMap, Observable } from "rxjs";
import {
    toOverviewStats, toSessionTrend, toEventMix, toNetworkTypes, toTopApps, toTopStations, toSessionFilter
} from "../../app/core/util/usage-mappers"
import { FilterStateService } from "../../app/core/services/filter-state.service";

type OverviewSource = {
    sessions: AppUsageSessionDto[];
    summary: AppUsageSummaryDto[];
    loading: boolean;
};

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [StatCard, ChartCard],
    templateUrl: './overview.html',
    styleUrls: ['./overview.scss']
})

export class Overview {
    private readonly api = inject(UsageApiService);
    private readonly auth = inject(AuthService);
    private readonly filterState = inject(FilterStateService);

    readonly hasToken = computed(() => !!this.auth.token());

    // Re-fetches whenever the auth token or the active filter (range/app) changes.
    private readonly request = computed(() => ({
        token: this.auth.token(),
        filter: toSessionFilter(this.filterState.range(), this.filterState.app()),
    }));

    private readonly source = toSignal(
        toObservable(this.request).pipe(
            switchMap(({ token, filter }): Observable<OverviewSource> => {
                if (!token) {
                    return of({ sessions: [], summary: [], loading: false });
                }
                return forkJoin({
                    sessions: this.api.getAppUsageSessions(filter),
                    summary: this.api.getAppUsageSummary(filter),
                }).pipe(
                    map((data) => ({ ...data, loading: false })),
                    startWith({ sessions: [], summary: [], loading: true } as OverviewSource),
                    catchError(() => of<OverviewSource>({ sessions: [], summary: [], loading: false }))
                );
            })
        ),
        { initialValue: { sessions: [], summary: [], loading: false } as OverviewSource }
    );

    readonly loading = computed(() => this.source().loading);

    readonly stats = computed(() => {
        const { summary, sessions } = this.source();
        return sessions.length || summary.length ? toOverviewStats(summary, sessions) : undefined;
    });

    private readonly trend = computed(() => toSessionTrend(this.source().sessions));
    private readonly eventMix = computed(() => toEventMix(this.source().sessions));
    private readonly network = computed(() => toNetworkTypes(this.source().sessions));
    private readonly topApps = computed(() => toTopApps(this.source().summary));
    private readonly topStations = computed(() => toTopStations(this.source().sessions));

    private readonly palette = ['#16a34a', '#7c6cf5', '#f43f5e', '#14b8a6', '#f59e0b'];

  readonly trendOptions = computed<EChartsCoreOption>(() => {
    const t = this.trend();
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Sessions', 'Foreground min'], top: 0, left: 0 },
      grid: { left: 40, right: 40, top: 40, bottom: 30 },
      xAxis: { type: 'category', boundaryGap: false, data: t.map((p) => p.date) },
      yAxis: [{ type: 'value' }, { type: 'value' }],
      series: [
        {
          name: 'Sessions',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.25 },
          itemStyle: { color: '#7c6cf5' },
          data: t.map((p) => p.sessions),
        },
        {
          name: 'Foreground min',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#14b8a6' },
          data: t.map((p) => p.foregroundMinutes),
        },
      ],
    };
  });

  readonly eventMixOptions = computed<EChartsCoreOption>(() => {
    const d = this.eventMix();
    const total = d.reduce((sum, x) => sum + x.value, 0);
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center' },
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          center: ['50%', '45%'],
          label: { show: true, position: 'center', formatter: `${total}\nevents`, fontSize: 20, fontWeight: 700 },
          data: d.map((x, i) => ({ name: x.label, value: x.value, itemStyle: { color: this.palette[i % this.palette.length] } })),
        },
      ],
    };
  });

  readonly networkOptions = computed<EChartsCoreOption>(() => this.barOptions(this.network(), false));
  readonly topAppsOptions = computed<EChartsCoreOption>(() => this.barOptions(this.topApps(), true, '#7c6cf5'));
  readonly topStationsOptions = computed<EChartsCoreOption>(() => this.barOptions(this.topStations(), true, '#14b8a6'));

  private barOptions(d: { label: string; value: number }[], horizontal: boolean, color = '#7c6cf5'): EChartsCoreOption {
    const cat = { type: 'category', data: d.map((x) => x.label) } as const;
    const val = { type: 'value' } as const;
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: horizontal ? 90 : 40, right: 30, top: 20, bottom: 30 },
      xAxis: horizontal ? val : cat,
      yAxis: horizontal ? { ...cat, inverse: true } : val,
      series: [
        {
          type: 'bar',
          data: d.map((x) => x.value),
          itemStyle: { color, borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0] },
          barWidth: '55%',
          label: { show: horizontal, position: 'right' },
        },
      ],
    };
  }
    fmtDuration(totalSeconds: number): string {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    pct(rate: number): string {
        return `${(rate * 100).toFixed(1)}%`;
    }
}


export class OverviewConstantData {
  private readonly data = inject(MetricsDataService);

  readonly stats = toSignal(this.data.getOverviewStats());
  private readonly trend = toSignal(this.data.getSessionTrend(), { initialValue: [] });
  private readonly eventMix = toSignal(this.data.getEventMix(), { initialValue: [] });
  private readonly network = toSignal(this.data.getNetworkTypes(), { initialValue: [] });
  private readonly topApps = toSignal(this.data.getTopApps(), { initialValue: [] });
  private readonly topStations = toSignal(this.data.getTopStations(), { initialValue: [] });

  private readonly palette = ['#16a34a', '#7c6cf5', '#f43f5e', '#14b8a6', '#f59e0b'];

  readonly trendOptions = computed<EChartsCoreOption>(() => {
    const t = this.trend();
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Sessions', 'Foreground min'], top: 0, left: 0 },
      grid: { left: 40, right: 40, top: 40, bottom: 30 },
      xAxis: { type: 'category', boundaryGap: false, data: t.map((p) => p.date) },
      yAxis: [{ type: 'value' }, { type: 'value' }],
      series: [
        {
          name: 'Sessions',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.25 },
          itemStyle: { color: '#7c6cf5' },
          data: t.map((p) => p.sessions),
        },
        {
          name: 'Foreground min',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#14b8a6' },
          data: t.map((p) => p.foregroundMinutes),
        },
      ],
    };
  });

  readonly eventMixOptions = computed<EChartsCoreOption>(() => {
    const d = this.eventMix();
    const total = d.reduce((sum, x) => sum + x.value, 0);
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center' },
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          center: ['50%', '45%'],
          label: { show: true, position: 'center', formatter: `${total}\nevents`, fontSize: 20, fontWeight: 700 },
          data: d.map((x, i) => ({ name: x.label, value: x.value, itemStyle: { color: this.palette[i % this.palette.length] } })),
        },
      ],
    };
  });

  readonly networkOptions = computed<EChartsCoreOption>(() => this.barOptions(this.network(), false));
  readonly topAppsOptions = computed<EChartsCoreOption>(() => this.barOptions(this.topApps(), true, '#7c6cf5'));
  readonly topStationsOptions = computed<EChartsCoreOption>(() => this.barOptions(this.topStations(), true, '#14b8a6'));

  private barOptions(d: { label: string; value: number }[], horizontal: boolean, color = '#7c6cf5'): EChartsCoreOption {
    const cat = { type: 'category', data: d.map((x) => x.label) } as const;
    const val = { type: 'value' } as const;
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: horizontal ? 90 : 40, right: 30, top: 20, bottom: 30 },
      xAxis: horizontal ? val : cat,
      yAxis: horizontal ? { ...cat, inverse: true } : val,
      series: [
        {
          type: 'bar',
          data: d.map((x) => x.value),
          itemStyle: { color, borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0] },
          barWidth: '55%',
          label: { show: horizontal, position: 'right' },
        },
      ],
    };
  }
    fmtDuration(totalSeconds: number): string {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    pct(rate: number): string {
        return `${(rate * 100).toFixed(1)}%`;
    }
}