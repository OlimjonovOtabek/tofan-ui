import { Injectable, computed, inject, signal } from '@angular/core';
import { Exercise } from './models/exercise';
import { ExerciseDraft, createExerciseDraft } from './models/exercise-draft';
import { ExerciseFilter } from './models/exercise-filter';
import { ExercisesService } from './services/exercises.service';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { toErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { LocaleStore } from '@core/i18n/locale.store';
import { pickLocalized } from '@shared/models/localized-text';

@Injectable()
export class ExercisesStore {
  private readonly exercisesService = inject(ExercisesService);
  private readonly notifications = inject(NotificationService);
  private readonly localeStore = inject(LocaleStore);

  private readonly page = signal<Page<Exercise>>(emptyPage<Exercise>());
  private readonly currentFilter = signal<ExerciseFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly exercises = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly filter = this.currentFilter.asReadonly();
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.exercisesService.list(this.currentFilter(), request));
    } catch (error) {
      this.page.set(emptyPage<Exercise>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async applyFilter(filter: ExerciseFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }

  async save(draft: ExerciseDraft, id: string | null): Promise<boolean> {
    this.saving.set(true);
    try {
      if (id === null) {
        await this.exercisesService.create(createExerciseDraft(draft));
      } else {
        await this.exercisesService.update(id, createExerciseDraft(draft));
      }
      this.notifications.success(id === null ? 'exercises.page.created' : 'exercises.page.saved');
      await this.load();
      return true;
    } catch (error) {
      this.notifications.error(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(exercise: Exercise): Promise<void> {
    try {
      await this.exercisesService.delete(exercise.id);
      this.notifications.success('exercises.page.deleted', { name: this.nameOf(exercise) });
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async toggleActivation(exercise: Exercise): Promise<void> {
    try {
      await this.exercisesService.setActive(exercise.id, !exercise.isActive);
      this.notifications.success(
        exercise.isActive ? 'exercises.page.deactivated' : 'exercises.page.activated',
        { name: this.nameOf(exercise) },
      );
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  private nameOf(exercise: Exercise): string {
    return pickLocalized(exercise.names, this.localeStore.locale());
  }
}
