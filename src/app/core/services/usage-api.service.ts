import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { map, Observable } from "rxjs";
import { AppUsageSessionDto, AppUsageSummaryDto } from "../models/metrics.models";
import { deriveSessionStatus } from "../util/usage-mappers";
import { APP_USAGE_SESSIONS, APP_USAGE_SUMMARY } from "../graphql/usage.queries";


@Injectable({ providedIn: 'root' })
export class UsageApiService {
    private readonly apollo = inject(Apollo)

    getAppUsageSessions(): Observable<AppUsageSessionDto[]> {
        return this.apollo
        .query<{ appUsageSessions: AppUsageSessionDto[] }>({ query: APP_USAGE_SESSIONS })
        .pipe(
            map((r) => 
                (r.data?.appUsageSessions ?? []).map((s) => ({ ...s, status: deriveSessionStatus(s) }))
            )
        );
    }
    
    getAppUsageSummary(): Observable<AppUsageSummaryDto[]> {
        return this.apollo
            .query<{ appUsageSummary: AppUsageSummaryDto[] }>({ query: APP_USAGE_SUMMARY })
            .pipe(map((r) => r.data?.appUsageSummary ?? []));
  }
}