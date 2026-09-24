import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__logo">〰️</span>
        <div>
          <div class="sidebar__title">ATOM</div>
          <div class="sidebar__subtitle">Usage Metrics</div>
        </div>
      </div>
      <nav class="sidebar__nav">
        @for (item of items; track item.path) {
          <a
            class="sidebar__link"
            [routerLink]="item.path"
            routerLinkActive="is-active"
          >
            <img class="sidebar__link-icon" [src]="item.icon" alt="" />
            {{ item.label }}
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      border-right: 1px solid #eceef2;
      padding: 20px 16px;
      background: #fff;
      height: 100vh;
      position: sticky;
      top: 0;
    }
    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 8px 22px;
    }
    .sidebar__logo {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7c6cf5, #14b8a6);
      display: grid;
      place-items: center;
      font-size: 18px;
    }
    .sidebar__title { font-weight: 700; color: #0f172a; }
    .sidebar__subtitle { font-size: 12px; color: #6b7280; }
    .sidebar__nav { display: flex; flex-direction: column; gap: 4px; }
    .sidebar__link-icon { width: 18px; height: 18px; object-fit: contain; flex-shrink: 0; }
    .sidebar__link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .sidebar__link:hover { background: #f5f5fb; }
    .sidebar__link.is-active {
      background: #eeecfe;
      color: #5b4bd6;
      font-weight: 600;
    }
  `],
})
export class SidebarNav {
  readonly items: NavItem[] = [
    { label: 'Overview', path: 'overview', icon: 'assets/overview_icon.svg' },
    { label: 'Sessions', path: 'sessions', icon: 'assets/sessions_icon.svg' },
    { label: 'Events', path: 'events', icon: 'assets/events_icon.svg' },
    { label: 'Devices', path: 'devices', icon: 'assets/devices_dashboard_icon.svg' },
    { label: 'Users', path: 'users', icon: 'assets/users_dashboard_icon.svg' },
    { label: 'Journey', path: 'journey', icon: 'assets/clock_icon.svg' },
  ];
}