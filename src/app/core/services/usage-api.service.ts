import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { map, Observable } from "rxjs";
import { AppUsageSessionDto, AppUsageSessionFilter, AppUsageSummaryDto, DeviceFilter, DeviceUsageSummaryDto, UserUsageSummaryDto } from "../models/metrics.models";
import { deriveSessionStatus } from "../util/usage-mappers";
import { APP_USAGE_SESSIONS, APP_USAGE_SUMMARY, DEVICE_USAGE_SUMMARY, USER_USAGE_SUMMARY } from "../graphql/usage.queries";


@Injectable({ providedIn: 'root' })
export class UsageApiService {
    private readonly apollo = inject(Apollo)

    getAppUsageSessions(filter: AppUsageSessionFilter = {}): Observable<AppUsageSessionDto[]> {
        return this.apollo
        .query<{ appUsageSessions: AppUsageSessionDto[] }>({
            query: APP_USAGE_SESSIONS,
            variables: { filter },
            fetchPolicy: 'network-only',
        })
        .pipe(
            map((r) => 
                (r.data?.appUsageSessions ?? []).map((s) => ({ ...s, status: deriveSessionStatus(s) }))
            )
        );
    }
    
    getAppUsageSummary(filter: AppUsageSessionFilter = {}): Observable<AppUsageSummaryDto[]> {
        return this.apollo
            .query<{ appUsageSummary: AppUsageSummaryDto[] }>({
                query: APP_USAGE_SUMMARY,
                variables: { filter },
                fetchPolicy: 'network-only',
            })
            .pipe(map((r) => r.data?.appUsageSummary ?? []));
  }

    getDeviceUsageSummary(
        filter: DeviceFilter = {},
        startedAfter?: string,
        startedBefore?: string,
    ): Observable<DeviceUsageSummaryDto[]> {
        return this.apollo
            .query<{ deviceUsageSummary: DeviceUsageSummaryDto[] }>({
                query: DEVICE_USAGE_SUMMARY,
                variables: { filter, startedAfter, startedBefore },
                fetchPolicy: 'network-only',
            })
            .pipe(map((r) => r.data?.deviceUsageSummary ?? []));
  }

    getUserUsageSummary(filter: AppUsageSessionFilter = {}): Observable<UserUsageSummaryDto[]> {
        return this.apollo
            .query<{ userUsageSummary: UserUsageSummaryDto[] }>({
                query: USER_USAGE_SUMMARY,
                variables: { filter },
                fetchPolicy: 'network-only',
            })
            .pipe(map((r) => r.data?.userUsageSummary ?? []));
  }
}