import { Injectable, computed, inject, signal } from '@angular/core';
import { SubscriptionGrant, createSubscriptionGrant } from './models/subscription-grant';
import { Trainer } from './models/trainer';
import {
  SentAccountValues,
  TakenTrainerAccount,
  toTakenTrainerAccount,
} from './models/taken-trainer-account';
import { TrainerAccount } from './models/trainer-account';
import { TrainerDraft, createTrainerDraft } from './models/trainer-draft';
import { TrainerEditDraft, createTrainerEditDraft } from './models/trainer-edit-draft';
import { TrainerAccountsService } from './services/trainer-accounts.service';
import { TrainerSubscriptionsService } from './services/trainer-subscriptions.service';
import { TrainersService } from './services/trainers.service';
import { Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class TrainersStore {
  private readonly trainersService = inject(TrainersService);
  private readonly accountsService = inject(TrainerAccountsService);
  private readonly subscriptionsService = inject(TrainerSubscriptionsService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<Trainer>>(emptyPage<Trainer>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly trainers = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly saving = signal(false);
  readonly takenAccount = signal<TakenTrainerAccount | null>(null);
  readonly account = signal<TrainerAccount | null>(null);
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.trainersService.list(request));
    } catch (error) {
      this.page.set(emptyPage<Trainer>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async create(draft: TrainerDraft): Promise<boolean> {
    this.saving.set(true);
    this.takenAccount.set(null);
    try {
      const prepared = createTrainerDraft(draft);
      await this.trainersService.create(prepared);
      this.notifications.success('trainers.toast.created', { name: prepared.displayName });
      await this.load();
      return true;
    } catch (error) {
      this.reportSaveFailure(error, draft);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async loadAccount(trainer: Trainer): Promise<boolean> {
    this.account.set(null);
    this.takenAccount.set(null);
    try {
      this.account.set(await this.accountsService.get(trainer.userId));
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    }
  }

  async update(trainer: Trainer, draft: TrainerEditDraft): Promise<boolean> {
    this.saving.set(true);
    this.takenAccount.set(null);
    try {
      const prepared = createTrainerEditDraft(draft);
      await this.trainersService.update(trainer.id, prepared);
      this.notifications.success('trainers.toast.updated', { name: prepared.displayName });
      await this.load();
      return true;
    } catch (error) {
      this.reportSaveFailure(error, draft);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword(trainer: Trainer, password: string): Promise<boolean> {
    this.saving.set(true);
    try {
      await this.trainersService.changePassword(trainer.id, password);
      this.notifications.success('trainers.toast.passwordChanged', { name: trainer.displayName });
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(trainer: Trainer): Promise<void> {
    try {
      await this.trainersService.delete(trainer.id);
      this.notifications.success('trainers.toast.deleted', { name: trainer.displayName });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async publish(trainer: Trainer): Promise<void> {
    try {
      await this.trainersService.publish(trainer.id);
      this.notifications.success('trainers.toast.published', { name: trainer.displayName });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async unpublish(trainer: Trainer): Promise<void> {
    try {
      await this.trainersService.unpublish(trainer.id);
      this.notifications.success('trainers.toast.unpublished', { name: trainer.displayName });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async grantSubscription(trainer: Trainer, grant: SubscriptionGrant): Promise<boolean> {
    this.saving.set(true);
    try {
      await this.subscriptionsService.grant(trainer.id, createSubscriptionGrant(grant));
      this.notifications.success('trainers.toast.granted', { name: trainer.displayName });
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  private reportSaveFailure(error: unknown, sent: SentAccountValues): void {
    const taken = toTakenTrainerAccount(error, sent);
    if (taken === null) {
      this.notifications.error(error);
      return;
    }
    this.takenAccount.set(taken);
  }
}
