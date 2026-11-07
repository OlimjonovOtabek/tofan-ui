import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NotificationService } from '@core/feedback/notification.service';
import { DeviceTokensService } from './device-tokens.service';
import { PushData, isFailedVideoPush, pushDataFromLink, pushLinkOf } from './push-message';
import { PushMessagingService } from './push-messaging.service';

const TOKEN_KEY = 'coach.push.token';
const OPEN_PARAM = 'push';

@Injectable({ providedIn: 'root' })
export class PushStore {
  private readonly messaging = inject(PushMessagingService);
  private readonly deviceTokens = inject(DeviceTokensService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private started = false;

  readonly supported = signal(this.messaging.supported);
  readonly enabled = signal(this.savedToken() !== null);
  readonly busy = signal(false);

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.messaging
      .workerEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => (event.opened ? this.open(event.data) : this.received(event.data)));
    this.openFromLaunchLink();
    if (this.supported() && this.enabled() && this.messaging.permission === 'granted') {
      void this.registerCurrent().catch(() => this.enabled.set(false));
    }
  }

  async toggle(): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await (this.enabled() ? this.disable() : this.enable());
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.busy.set(false);
    }
  }

  async disable(): Promise<void> {
    const token = this.savedToken();
    this.saveToken(null);
    this.enabled.set(false);
    if (token !== null) {
      await this.deviceTokens.unregister(token);
      await this.messaging.removeToken();
    }
  }

  private async enable(): Promise<void> {
    if ((await this.messaging.requestPermission()) !== 'granted') {
      this.notifications.failure('coachApp.push.denied');
      return;
    }
    await this.registerCurrent();
    this.enabled.set(true);
  }

  private async registerCurrent(): Promise<void> {
    const token = await this.messaging.createToken();
    await this.deviceTokens.register(token);
    this.saveToken(token);
  }

  private received(data: PushData): void {
    if (isFailedVideoPush(data)) {
      this.notifications.failure('coachApp.push.videoFailed');
    }
  }

  private open(data: PushData): void {
    const link = pushLinkOf(data);
    if (link !== null) {
      void this.router.navigateByUrl(link);
    }
    this.received(data);
  }

  private openFromLaunchLink(): void {
    const data = pushDataFromLink(new URLSearchParams(location.search).get(OPEN_PARAM));
    if (data !== null) {
      this.open(data);
    }
  }

  private savedToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private saveToken(token: string | null): void {
    try {
      if (token === null) {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch {
      this.enabled.set(token !== null);
    }
  }
}
