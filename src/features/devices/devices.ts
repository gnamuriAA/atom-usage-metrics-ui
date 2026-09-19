import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of, startWith, switchMap, Observable } from 'rxjs';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { FilterStateService } from '../../app/core/services/filter-state.service';
import { DeviceUsageSummaryDto } from '../../app/core/models/metrics.models';
import { toDeviceQuery } from '../../app/core/util/usage-mappers';
import { formatDuration } from '../../app/core/util/format';

type DevicesSource = { devices: DeviceUsageSummaryDto[]; loading: boolean };

@Component({
    selector: 'app-devices',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './devices.html',
    styleUrls: ['./devices.scss'],
})
export class Devices {
    private readonly api = inject(UsageApiService);
    private readonly auth = inject(AuthService);
    private readonly filterState = inject(FilterStateService);

    readonly hasToken = computed(() => !!this.auth.token());

    // Re-fetches whenever the auth token or the global filter (range/station) changes.
    private readonly request = computed(() => ({
        token: this.auth.token(),
        args: toDeviceQuery(this.filterState.range(), this.filterState.station()),
    }));

    private readonly source = toSignal(
        toObservable(this.request).pipe(
            switchMap(({ token, args }): Observable<DevicesSource> => {
                if (!token) {
                    return of({ devices: [], loading: false });
                }
                return this.api
                    .getDeviceUsageSummary(args.filter, args.startedAfter, args.startedBefore)
                    .pipe(
                        map((devices) => ({ devices, loading: false })),
                        startWith({ devices: [], loading: true } as DevicesSource),
                        catchError(() => of<DevicesSource>({ devices: [], loading: false }))
                    );
            })
        ),
        { initialValue: { devices: [], loading: false } as DevicesSource }
    );

    readonly loading = computed(() => this.source().loading);
    readonly devices = computed(() => this.source().devices);

    fmtDuration(seconds: number): string {
        return formatDuration(seconds);
    }
}
