import { Injectable, inject, signal } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { NotificationService } from '@core/feedback/notification.service';
import { signInErrorKey } from './models/sign-in-error';
import { SignInMemoryService } from './services/sign-in-memory.service';

export interface SignInValue {
  identifier: string;
  password: string;
  remember: boolean;
}

@Injectable()
export class SignInStore {
  private readonly auth = inject(AuthStore);
  private readonly memory = inject(SignInMemoryService);
  private readonly notifications = inject(NotificationService);

  readonly signingIn = signal(false);

  initialValue(): SignInValue {
    const remembered = this.memory.read();
    return { identifier: remembered.identifier, password: '', remember: remembered.remember };
  }

  async signIn(value: SignInValue): Promise<boolean> {
    if (this.signingIn()) {
      return false;
    }
    this.signingIn.set(true);
    try {
      const identifier = value.identifier.trim();
      await this.auth.login(identifier, value.password);
      this.memory.save({ identifier, remember: value.remember });
      return true;
    } catch (error) {
      this.showFailure(error);
      return false;
    } finally {
      this.signingIn.set(false);
    }
  }

  private showFailure(error: unknown): void {
    const key = signInErrorKey(error);
    if (key === null) {
      this.notifications.error(error);
    } else {
      this.notifications.failure(key);
    }
  }
}
