import { Component, inject, input, output, signal } from '@angular/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LibraryExercise } from '../../services/coach-program-library.dto';
import { CoachExercisePickerStore } from '../../coach-exercise-picker.store';
import { LibrarySource } from '../../models/coach-library-source';
import { CoachWorkoutEditorStore } from '../../coach-workout-editor.store';

@Component({
  selector: 'coach-exercise-picker',
  imports: [ButtonDirective, Dialog, Skeleton, TranslatePipe],
  templateUrl: './coach-exercise-picker.html',
  providers: [CoachExercisePickerStore],
  styleUrl: './coach-exercise-picker.css',
})
export class CoachExercisePicker {
  private readonly locale = inject(LocaleStore);

  private readonly editor = inject(CoachWorkoutEditorStore);

  protected readonly store = inject(CoachExercisePickerStore);
  protected readonly selected = signal<readonly LibraryExercise[]>([]);

  readonly dayKey = input<string | null>(null);
  readonly closed = output<void>();

  open(): void {
    this.selected.set([]);
    void this.store.reset();
  }

  protected setSource(source: LibrarySource): Promise<void> {
    return this.store.setSource(source);
  }

  protected searchChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.store.searchText.set(input.value);
    }
  }

  protected search(): Promise<void> {
    return this.store.load();
  }

  protected toggle(exercise: LibraryExercise): void {
    this.selected.update((current) =>
      current.some((item) => item.id === exercise.id)
        ? current.filter((item) => item.id !== exercise.id)
        : [...current, exercise],
    );
  }

  protected isSelected(exercise: LibraryExercise): boolean {
    return this.selected().some((item) => item.id === exercise.id);
  }

  protected addSelected(): void {
    const dayKey = this.dayKey();
    if (dayKey !== null) {
      this.editor.addExercises(dayKey, this.selected());
    }
    this.close();
  }

  protected close(): void {
    this.selected.set([]);
    this.closed.emit();
  }

  protected nameOf(exercise: LibraryExercise): string {
    const locale = this.locale.locale();
    return locale === 'ru' ? exercise.nameRu : locale === 'uz' ? exercise.nameUz : exercise.name;
  }
}
