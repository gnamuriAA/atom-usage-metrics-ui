import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { catchError, map, of, startWith, switchMap, Observable } from 'rxjs';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { FilterStateService } from '../../app/core/services/filter-state.service';
import { UserRow } from '../../app/core/models/metrics.models';
import { toUserFilter, toUserRows } from '../../app/core/util/usage-mappers';
import { formatDuration } from '../../app/core/util/format';

type UsersSource = { users: UserRow[]; loading: boolean };

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './users.html',
    styleUrls: ['./users.scss'],
})
export class Users {
    private readonly api = inject(UsageApiService);
    private readonly auth = inject(AuthService);
    private readonly filterState = inject(FilterStateService);

    private readonly avatarPalette = ['#7c6cf5', '#16a34a', '#e11d78', '#2563eb', '#db2777', '#0d9488', '#a16207', '#0ea5e9'];

    readonly hasToken = computed(() => !!this.auth.token());

    // Re-fetches whenever the auth token or the global filter (range/app/station) changes.
    private readonly request = computed(() => ({
        token: this.auth.token(),
        filter: toUserFilter(this.filterState.range(), this.filterState.app(), this.filterState.station()),
    }));

    private readonly source = toSignal(
        toObservable(this.request).pipe(
            switchMap(({ token, filter }): Observable<UsersSource> => {
                if (!token) {
                    return of({ users: [], loading: false });
                }
                return this.api.getUserUsageSummary(filter).pipe(
                    map((rows) => ({ users: toUserRows(rows), loading: false })),
                    startWith({ users: [], loading: true } as UsersSource),
                    catchError(() => of<UsersSource>({ users: [], loading: false }))
                );
            })
        ),
        { initialValue: { users: [], loading: false } as UsersSource }
    );

    readonly loading = computed(() => this.source().loading);
    readonly users = computed(() => this.source().users);

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
