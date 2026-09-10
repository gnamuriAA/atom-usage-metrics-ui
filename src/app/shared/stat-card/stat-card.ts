import { Component, input } from '@angular/core';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    template: `
    <div class="stat-card" [class]="'accent-' + accent()">
        <div class="stat-card__header">
            <span class="stat-card__label">{{ label() }}</span>
            <span class="stat-card__icon">{{ icon() }}</span>
        </div>
        <div class="stat-card__value">{{ value() }}</div>
        </div>
     `,
     styles:[`
        .stat-card {
            background: #fff;
            border: 1px solid #eceef2;
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            min-width: 0;
        }
        .stat-card__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .stat-card__label {
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 600;
        }
        .stat-card__icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            display: grid;
            place-items: center;
            font-size: 18px;
            color: #fff;
            background: #7c6cf5;
        }
        .stat-card__value {
            font-size: 30px;
            font-weight: 700;
            color: #0f172a;
        }
        .accent-violet  .stat-card__icon { background: #7c6cf5; }
        .accent-teal    .stat-card__icon { background: #14b8a6; }
        .accent-amber   .stat-card__icon { background: #f59e0b; }
        .accent-green   .stat-card__icon { background: #10b981; }
        .accent-rose    .stat-card__icon { background: #f43f5e; }
    `],
})

export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<string>('•');
  readonly accent = input<'violet' | 'teal' | 'amber' | 'green' | 'rose'>('violet');
}