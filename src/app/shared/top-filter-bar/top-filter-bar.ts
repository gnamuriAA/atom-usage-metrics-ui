import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, Observable } from 'rxjs';
import { FilterStateService } from '../../core/services/filter-state.service';
import { AuthService } from '../../core/services/auth.service';
import { UsageApiService } from '../../core/services/usage-api.service';
import { DateRange, AppUsageReportingApps } from '../../core/models/metrics.models';
import { toSessionFilter } from '../../core/util/usage-mappers';

@Component({
  selector: 'app-top-filter-bar',
  standalone: true,
  template: `
    <div class="filter-bar">
      <div class="range-group">
        @for (r of ranges; track r.value) {
          <button
            class="range-btn"
            [class.is-active]="filters.range() === r.value"
            (click)="filters.setRange(r.value)"
          >
            {{ r.label }}
          </button>
        }
      </div>

      <label class="filter-search">
        <span class="sr-only">Filter by employee ID</span>
        <input
          type="search"
          placeholder="Employee ID"
          [value]="filters.employeeId() ?? ''"
          (input)="onEmployeeId($event)"
        />
      </label>

      <select
        class="filter-select"
        [value]="filters.app() ?? ''"
        (change)="onApp($event)"
      >
        <option value="">All apps</option>
        @for (a of apps(); track a) {
          <option [value]="a">{{ a }}</option>
        }
      </select>

      <select
        class="filter-select"
        [value]="filters.station() ?? ''"
        (change)="onStation($event)"
      >
        <option value="">All stations</option>
        @for (s of stations(); track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>

      <button class="reset-btn" (click)="filters.reset()">↺ Reset</button>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 14px 28px;
      border-bottom: 1px solid #eceef2;
      background: #fff;
    }
    .range-group {
      display: flex;
      gap: 2px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 3px;
    }
    .range-btn {
      border: 0;
      background: transparent;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      color: #475569;
      cursor: pointer;
    }
    .range-btn.is-active { background: #7c6cf5; color: #fff; font-weight: 600; }
    .filter-search { display: inline-flex; }
    .filter-search input {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      color: #334155;
      background: #fff;
      min-width: 150px;
    }
    .filter-search input:focus { outline: none; border-color: #7c6cf5; box-shadow: 0 0 0 3px rgba(124, 108, 245, 0.15); }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .filter-select {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      color: #334155;
      background: #fff;
      cursor: pointer;
    }
    .reset-btn {
      border: 1px solid #e5e7eb;
      background: #fff;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 13px;
      color: #475569;
      cursor: pointer;
    }
  `],
})
export class TopFilterBar {
  readonly filters = inject(FilterStateService);
  private readonly auth = inject(AuthService);
  private readonly api = inject(UsageApiService);

  readonly ranges: { label: string; value: DateRange }[] = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: 'All', value: 'all' },
  ];

  // Filter options come from appUsageReportingApps, scoped to the active date range.
  private readonly request = computed(() => {
    const window = toSessionFilter(this.filters.range(), null);
    return { token: this.auth.token(), startedAfter: window.startedAfter, startedBefore: window.startedBefore };
  });

  private readonly source = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ token, startedAfter, startedBefore }): Observable<AppUsageReportingApps | null> => {
        if (!token) return of(null);
        return this.api.getReportingApps(startedAfter, startedBefore).pipe(catchError(() => of(null)));
      })
    ),
    { initialValue: null }
  );

  readonly apps = computed(() => [...(this.source()?.appNames ?? [])].sort());
  readonly stations = computed(() => [...(this.source()?.stationCodes ?? [])].sort());

  onApp(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.filters.setApp(v || null);
  }
  onStation(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.filters.setStation(v || null);
  }

  onEmployeeId(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.filters.setEmployeeId(v || null);
  }
}