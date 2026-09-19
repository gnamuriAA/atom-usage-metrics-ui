import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { map, Observable } from "rxjs";
import { AppUsageSessionDto, AppUsageSessionFilter, AppUsageSummaryDto } from "../models/metrics.models";
import { deriveSessionStatus } from "../util/usage-mappers";
import { APP_USAGE_SESSIONS, APP_USAGE_SUMMARY } from "../graphql/usage.queries";


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
}