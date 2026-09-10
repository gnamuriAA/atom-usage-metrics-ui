import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNav } from './shared/sidebar-nav/sidebar-nav';
import { TopFilterBar } from './shared/top-filter-bar/top-filter-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarNav, TopFilterBar],
  template: `
    <div class="shell">
      <app-sidebar-nav />
      <div class="shell__main">
        <app-top-filter-bar />
        <main class="shell__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: #f7f8fb; }
    .shell__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .shell__content { padding: 28px; }
  `]
})
export class App {}
