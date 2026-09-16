
import { Component, inject } from '@angular/core';
import { UsageApiService } from '../../app/core/services/usage-api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { formatDuration } from '../../app/core/util/format';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-sessions',
    standalone: true,
    imports: [DatePipe],
    template: `
        <header class="page-head">
            <h1>Sessions</h1>
            <p>Every captured session, filterable and searchable</p>
        </header>

        <section class="table-card">
            <div class="table-wrap">
                <table class="session-table"> 
                    <thead>
                        <tr> 
                            <th>STARTED</th>
                            <th>APP</th>
                            <th>EMPLOYEE</th>
                            <th>DEVICE</th>
                            <th>STATION</th>
                            <th class="num">FOREGROUND</th>
                            <th class="num">EVENTS</th>
                            <th class="status"> STATUS</th>
                        </tr>
                    </thead>
                    <tbody> 
                        @for (session of sessions(); track session._id) {
                            <tr> 
                                <td>{{ session.sessionStartTime | date: 'MMM d, y, HH:mm' }} </td>
                                <td>
                                    <div class="app-name"> {{ session.appName }} </div>
                                    <div class="app-version"> {{ session.appVersion }} </div>
                                </td>
                                <td>
                                    <div class="emp-id"> {{ session.employeeId }} </div>
                                    <div class="emp"> {{ session.employeeName }} </div>
                                </td>
                                <td> {{ session.deviceSerial }} </td>
                                <td> {{ session.deviceStationCode }} </td>
                                <td class="num">{{ fmtDuration(session.foregroundDurationSeconds) }}</td>
                                <td class="num">{{ session.events.length }}</td>
                                <td><span class="badge badge--{{ session.status }}">{{ session.status }}</span></td>
                            </tr>
                        } @empty {
                            <tr><td class="empty" colspan="8">No sessions found.</td></tr>
                        }
                    </tbody>
                </table>
                <div class="table-card__head">
                    <span>{{ sessions().length }} sessions </span>
                </div>
            </div>
        </section>
    `,
    styles: [`
        .page-head h1 { margin: 0; font-size: 28px; font-weight: 700; color: #0f172a; }
        .page-head p { margin: 6px 0 22px; color: #6b7280; }
        .table-card { background: #fff; border: 1px solid #eceef2; border-radius: 14px; overflow: hidden; }
        .table-card__head { padding: 14px 18px; border-bottom: 1px solid #eceef2; font-size: 13px; font-weight: 600; color: #475569; }
        .table-wrap { overflow-x: auto; }
        .session-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .session-table th { text-align: left; padding: 12px 18px; color: #6b7280; font-weight: 600; background: #fafbfc; white-space: nowrap; }
        .session-table td { padding: 12px 18px; border-top: 1px solid #f1f2f5; color: #0f172a; white-space: nowrap; }
        .session-table tbody tr:hover td { background: #fafbfe; }
        .num { text-align: center; }
        .status { text-align: center; }
        .emp { font-weight: 500; }
        .emp-id { font-size: 12px; color: #94a3b8; }
        .empty { text-align: center; color: #94a3b8; padding: 28px; }
        .app-name { font-weight: 500; }
        .app-version { font-size: 12px; color: #94a3b8; }
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 12px;
            line-height: 1.6;
            text-transform: capitalize;
            text-align: center;
        }
        .badge--Active       { background: #dcfce7; color: #10b981; text-align: center; }
        .badge--Ended        { background: #dbeafe; color: #3b82f6; text-align: center; }
        .badge--Force-closed { background: #fef3c7; color: #b45309; text-align: center; }
        .badge--Crash { font-weight: 500; color: #ef4444; text-align: center; }
    `]
})

export class Sessions {
    private readonly api = inject(UsageApiService);
    readonly  sessions = toSignal(this.api.getAppUsageSessions(), { initialValue: [] });

    fmtDuration(seconds: number): string {
        return formatDuration(seconds);
    }
}