import { Injectable, computed, inject, signal } from '@angular/core';
import { CreateExerciseUseCase } from '@application/exercises/create-exercise.use-case';
import { DeleteExerciseUseCase } from '@application/exercises/delete-exercise.use-case';
import { GetExercisesUseCase } from '@application/exercises/get-exercises.use-case';
import { SetExerciseActivationUseCase } from '@application/exercises/set-exercise-activation.use-case';
import { UpdateExerciseUseCase } from '@application/exercises/update-exercise.use-case';
import { Exercise } from '@domain/exercises/entities/exercise';
import { ExerciseDraft } from '@domain/exercises/exercise-draft';
import { ExerciseFilter } from '@domain/exercises/repositories/exercise.repository';
import {
  DEFAULT_PAGE_SIZE,
  Page,
  PageRequest,
  emptyPage,
  firstPage,
} from '@domain/shared/paging/page';
import { NotificationService } from '@presentation/shared/feedback/notification.service';

/** View state of the exercise catalog: one page of the list plus the filters that produced it. */
@Injectable()
export class ExercisesStore {
  private readonly getExercisesUseCase = inject(GetExercisesUseCase);
  private readonly createExerciseUseCase = inject(CreateExerciseUseCase);
  private readonly updateExerciseUseCase = inject(UpdateExerciseUseCase);
  private readonly deleteExerciseUseCase = inject(DeleteExerciseUseCase);
  private readonly setActivationUseCase = inject(SetExerciseActivationUseCase);
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

  /** Called by the table on every page, sort and refresh. */
  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.getExercisesUseCase.execute(this.currentFilter(), request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  /** Filtering starts over from the first row, keeping the chosen page size. */
  async applyFilter(filter: ExerciseFilter): Promise<void> {
    this.currentFilter.set(filter);
    await this.load(firstPage(this.currentRequest().rows || DEFAULT_PAGE_SIZE));
  }

  /** @returns true when the exercise was saved, so the caller can close its dialog. */
  async save(draft: ExerciseDraft, id: string | null): Promise<boolean> {
    this.saving.set(true);
    try {
      if (id === null) {
        await this.createExerciseUseCase.execute(draft);
      } else {
        await this.updateExerciseUseCase.execute(id, draft);
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
      await this.deleteExerciseUseCase.execute(exercise.id);
      this.notifications.success(`"${exercise.displayName}" o'chirildi.`);
      await this.load();
    } catch (error) {
      this.notifications.error(error);
    }
  }

  async toggleActivation(exercise: Exercise): Promise<void> {
    try {
      await this.setActivationUseCase.execute(exercise.id, !exercise.isActive);
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
