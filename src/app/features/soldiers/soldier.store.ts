import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { LocaleStore } from '@core/i18n/locale.store';
import { toSoldierFactSections } from './models/soldier-facts';
import { SoldierProfile } from './models/soldier-profile';
import { WeightEntry, weightChange } from './models/weight-entry';
import { SoldiersService } from './services/soldiers.service';

const LATEST_WEIGHTS_SHOWN = 10;

@Injectable()
export class SoldierStore {
  private readonly soldiersService = inject(SoldiersService);
  private readonly localeStore = inject(LocaleStore);

  private readonly currentUserId = signal<string | null>(null);
  private readonly loaded = signal(false);

  readonly profile = signal<SoldierProfile | null>(null);
  readonly weights = signal<readonly WeightEntry[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<ErrorMessage | null>(null);

  readonly notOnboarded = computed(
    () => this.loaded() && this.loadError() === null && this.profile() === null,
  );
  readonly weightChange = computed(() => weightChange(this.weights()));
  readonly latestWeights = computed(() =>
    [...this.weights()].reverse().slice(0, LATEST_WEIGHTS_SHOWN),
  );
  readonly factSections = computed(() => {
    const profile = this.profile();
    return profile === null
      ? []
      : toSoldierFactSections(profile, new Date(), this.localeStore.locale());
  });

  async load(userId: string | null = this.currentUserId()): Promise<void> {
    if (userId === null) {
      return;
    }
    this.currentUserId.set(userId);
    this.loading.set(true);
    this.loadError.set(null);
    this.loaded.set(false);
    try {
      const [profile, weights] = await Promise.all([
        this.soldiersService.findProfile(userId),
        this.soldiersService.weightHistory(userId),
      ]);
      this.profile.set(profile);
      this.weights.set(weights);
      this.loaded.set(true);
    } catch (error) {
      this.profile.set(null);
      this.weights.set([]);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
