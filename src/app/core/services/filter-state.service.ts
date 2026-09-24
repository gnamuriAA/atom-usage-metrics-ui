import { Injectable, signal, computed } from '@angular/core';
import { DateRange, Filters } from '../models/metrics.models';

const DEFAULTS: Filters = { range: '7d', app: null, station: null, employeeId: null };

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  private readonly state = signal<Filters>({ ...DEFAULTS });

  readonly filters = this.state.asReadonly();
  readonly range = computed(() => this.state().range);
  readonly app = computed(() => this.state().app);
  readonly station = computed(() => this.state().station);
  readonly employeeId = computed(() => this.state().employeeId);

  setRange(range: DateRange): void {
    this.state.update((s) => ({ ...s, range }));
  }
  setApp(app: string | null): void {
    this.state.update((s) => ({ ...s, app }));
  }
  setStation(station: string | null): void {
    this.state.update((s) => ({ ...s, station }));
  }
  setEmployeeId(employeeId: string | null): void {
    this.state.update((s) => ({ ...s, employeeId }));
  }
  reset(): void {
    this.state.set({ ...DEFAULTS });
  }
}