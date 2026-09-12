import { Injectable, InjectionToken, inject } from '@angular/core';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { SessionRepository } from '@domain/auth/repositories/session.repository';

export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});

const STORAGE_KEY = 'tofan.session';

interface StoredSession {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string;
}

@Injectable()
export class LocalStorageSessionRepository implements SessionRepository {
  private readonly storage = inject(SESSION_STORAGE);

  get(): AuthSession | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const stored = parseStoredSession(raw);
    if (stored === null) {
      this.clear();
      return null;
    }

    return new AuthSession(stored.accessToken, new Date(stored.expiresAt), stored.refreshToken);
  }

  save(session: AuthSession): void {
    const stored: StoredSession = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt.toISOString(),
    };
    this.storage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}

function parseStoredSession(raw: string): StoredSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isStoredSession(value) ? value : null;
  } catch {
    return null;
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['accessToken'] === 'string' &&
    typeof candidate['expiresAt'] === 'string' &&
    !Number.isNaN(Date.parse(candidate['expiresAt'])) &&
    (candidate['refreshToken'] === null || typeof candidate['refreshToken'] === 'string')
  );
}
