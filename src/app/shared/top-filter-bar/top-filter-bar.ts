import { Component, inject } from '@angular/core';
import { FilterStateService } from '../../core/services/filter-state.service';
import { DateRange } from '../../core/models/metrics.models';

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

      <select
        class="filter-select"
        [value]="filters.app() ?? ''"
        (change)="onApp($event)"
      >
        <option value="">All apps</option>
        @for (a of apps; track a) {
          <option [value]="a">{{ a }}</option>
        }
      </select>

      <select
        class="filter-select"
        [value]="filters.station() ?? ''"
        (change)="onStation($event)"
      >
        <option value="">All stations</option>
        @for (s of stations; track s) {
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
  readonly ranges: { label: string; value: DateRange }[] = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: 'All', value: 'all' },
  ];
  readonly apps = ['SAFE', 'ASOM', 'ATOM Admin', 'TechOps Portal'];
  readonly stations = ['HYD', 'DFW', 'ORD', 'LAX', 'JFK', 'MIA'];

  onApp(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.filters.setApp(v || null);
  }
  onStation(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.filters.setStation(v || null);
  }
}