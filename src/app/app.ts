import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNav } from './shared/sidebar-nav/sidebar-nav';
import { TopFilterBar } from './shared/top-filter-bar/top-filter-bar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarNav, TopFilterBar],
  template: `
    <div class="shell">
      <app-sidebar-nav />
      <div class="shell__main">
        @if (!auth.token()) {
          <div class="auth-bar">
            <span>Not signed in.</span>
            <button type="button" (click)="auth.openLogin()">Open /profile</button>
            <input
              [value]="draft()"
              (input)="draft.set($any($event.target).value)"
              placeholder="Paste token (id) from /profile"
            />
            <button type="button" (click)="save()">Save</button>
          </div>
        } @else {
          <div class="auth-bar auth-bar--ok">
            <span>Signed in.</span>
            <button type="button" (click)="auth.signOut()">Sign out</button>
          </div>
        }
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
    .auth-bar { display: flex; gap: 8px; align-items: center; padding: 8px 16px; background: #fff4ce; font-size: 13px; }
    .auth-bar--ok { background: #dff6dd; }
    .auth-bar input { flex: 1; max-width: 420px; padding: 4px 8px; }
    .auth-bar button { padding: 4px 10px; cursor: pointer; }
  `]
})
export class App {
  readonly auth = inject(AuthService);
  readonly draft = signal('');

  save(): void {
    this.auth.setToken(this.draft());
    this.draft.set('');
    // Reload so Apollo re-issues queries with the new bearer token.
    location.reload();
  }
}
