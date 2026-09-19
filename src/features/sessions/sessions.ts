
import { Component, inject, signal } from '@angular/core';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { formatDuration } from '../../app/core/util/format';
import { DatePipe } from '@angular/common';
import { AppUsageEventDto, AppUsageSessionDto } from '../../app/core/models/metrics.models';

@Component({
    selector: 'app-sessions',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './sessions.html',
    styleUrls: ['./sessions.scss']
})

export class Sessions {
    private readonly api = inject(UsageApiService);
    readonly  sessions = toSignal(this.api.getAppUsageSessions(), { initialValue: [] });
    readonly selected = signal<AppUsageSessionDto | null>(null);

    select(session: AppUsageSessionDto): void {
        this.selected.set(session);
    }

    close(): void {
        this.selected.set(null);
    }

    fmtDuration(seconds: number): string {
        return formatDuration(seconds);
    }

    // Foreground span for a background event, when both endpoints are present.
    segment(e: AppUsageEventDto): string | null {
        if (!e.foregroundTimestamp || !e.backgroundTimestamp) return null;
        const secs = (new Date(e.backgroundTimestamp).getTime() - new Date(e.foregroundTimestamp).getTime()) / 1000;
        return secs > 0 ? formatDuration(secs) : null;
    }

    eventColor(type: string): string {
        switch (type) {
            case 'appOpen': return '#16a34a';
            case 'appBackgrounded': return '#7c6cf5';
            case 'forceCloseCheck': return '#f59e0b';
            case 'sessionEnd': return '#f43f5e';
            default: return '#64748b';
        }
    }

    eventTint(type: string): string {
        return this.eventColor(type) + '1a';
    }
}