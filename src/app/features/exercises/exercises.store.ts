import { Injectable, computed, inject, signal } from '@angular/core';
import { Exercise } from './models/exercise';
import { ExerciseDraft, createExerciseDraft } from './models/exercise-draft';
import { ExerciseFilter } from './models/exercise-filter';
import { ExercisesService } from './services/exercises.service';
import { DEFAULT_PAGE_SIZE, Page, PageRequest, emptyPage, firstPage } from '@shared/models/page';
import { NotificationService } from '@core/feedback/notification.service';

@Injectable()
export class ExercisesStore {
  private readonly exercisesService = inject(ExercisesService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<Exercise>>(emptyPage<Exercise>());
  private readonly currentFilter = signal<ExerciseFilter>({});
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly exercises = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly filter = this.currentFilter.asReadonly();
  readonly first = computed(() => this.currentRequest().first);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.exercisesService.list(this.currentFilter(), request));
    } catch (error) {
      this.notifications.error(error);
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
      this.notifications.success(id === null ? "Mashq qo'shildi." : 'Mashq saqlandi.');
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
      this.notifications.success(`"${exercise.displayName}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async toggleActivation(exercise: Exercise): Promise<void> {
    try {
      await this.exercisesService.setActive(exercise.id, !exercise.isActive);
      this.notifications.success(
        exercise.isActive
          ? `"${exercise.displayName}" o'chirib qo'yildi.`
          : `"${exercise.displayName}" faollashtirildi.`,
      );
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }
}
