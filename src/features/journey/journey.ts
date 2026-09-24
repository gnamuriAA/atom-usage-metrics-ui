import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of, startWith, switchMap, Observable } from 'rxjs';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { FilterStateService } from '../../app/core/services/filter-state.service';
import { UserJourney } from '../../app/core/models/metrics.models';
import { toSessionFilter, toUserJourneys } from '../../app/core/util/usage-mappers';
import { formatDuration } from '../../app/core/util/format';

type JourneySource = { journeys: UserJourney[]; loading: boolean };

@Component({
    selector: 'app-journey',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './journey.html',
    styleUrls: ['./journey.scss'],
})
export class Journey {
    private readonly api = inject(UsageApiService);
    private readonly auth = inject(AuthService);
    private readonly filterState = inject(FilterStateService);

    private readonly avatarPalette = ['#7c6cf5', '#16a34a', '#e11d78', '#2563eb', '#db2777', '#0d9488', '#a16207', '#0ea5e9'];

    readonly hasToken = computed(() => !!this.auth.token());

    // Re-fetches whenever the auth token or the global filter (range/app/station/employee) changes.
    private readonly request = computed(() => ({
        token: this.auth.token(),
        filter: toSessionFilter(this.filterState.range(), this.filterState.app(), this.filterState.station(), this.filterState.employeeId()),
    }));

    private readonly source = toSignal(
        toObservable(this.request).pipe(
            switchMap(({ token, filter }): Observable<JourneySource> => {
                if (!token) {
                    return of({ journeys: [], loading: false });
                }
                return this.api.getAppUsageSessions(filter).pipe(
                    map((sessions) => ({ journeys: toUserJourneys(sessions), loading: false })),
                    startWith({ journeys: [], loading: true } as JourneySource),
                    catchError(() => of<JourneySource>({ journeys: [], loading: false }))
                );
            })
        ),
        { initialValue: { journeys: [], loading: false } as JourneySource }
    );

    readonly loading = computed(() => this.source().loading);
    readonly journeys = computed(() => this.source().journeys);

    fmtDuration(seconds: number): string {
        return formatDuration(seconds);
    }

    initials(name: string): string {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return '?';
        const first = parts[0][0];
        const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
        return (first + last).toUpperCase();
    }

    avatarColor(key: string): string {
        let hash = 0;
        for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
        return this.avatarPalette[hash % this.avatarPalette.length];
    }
}
