import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environment/environment';

const TOKEN_KEY = 'atom_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly profileUrl = environment.authProfileUrl;
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly token = this._token.asReadonly();

  get tokenValue(): string | null {
    return this._token();
  }

  setToken(token: string): void {
    const trimmed = token.trim();
    this._token.set(trimmed || null);
    if (trimmed) {
      localStorage.setItem(TOKEN_KEY, trimmed);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  signOut(): void {
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  // Cross-origin SSO cookie can't reach localhost, so log in on the API domain in a new tab.
  openLogin(): void {
    window.open(this.profileUrl, '_blank', 'noopener');
  }
}
