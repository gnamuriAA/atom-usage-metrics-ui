import { Component, input } from "@angular/core";
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';

@Component({
    selector: 'app-chart-card',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <div class="chart-card">
      <div class="chart-card__head">
        <h3>{{ title() }}</h3>
        @if (subtitle()) {
          <p>{{ subtitle() }}</p>
        }
      </div>
      <div class="chart-card__body" echarts [options]="options()"></div>
    </div>
  `,
  styles: [`
    .chart-card {
      background: #fff;
      border: 1px solid #eceef2;
      border-radius: 16px;
      padding: 20px 22px;
    }
    .chart-card__head h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .chart-card__head p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #6b7280;
    }
    .chart-card__body {
      height: 320px;
      width: 100%;
      margin-top: 8px;
    }
  `],
})
export class ChartCard {
    readonly title = input.required<string>();
    readonly subtitle = input<string>('');
    readonly options = input.required<EChartsCoreOption>();
}