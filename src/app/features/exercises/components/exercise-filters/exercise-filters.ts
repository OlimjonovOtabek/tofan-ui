import { Component, computed, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { debounceTime } from 'rxjs';
import { ExerciseFilter } from '../../models/exercise-filter';
import {
  EQUIPMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from '../../models/exercise-labels';
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';

const SEARCH_DEBOUNCE_MS = 400;

const ACTIVITY_OPTIONS = [
  { value: true, label: 'exercises.filters.active' },
  { value: false, label: 'exercises.filters.inactive' },
];

const PLACE_OPTIONS = [
  { value: true, label: 'exercises.filters.home' },
  { value: false, label: 'exercises.filters.gym' },
];

@Component({
  selector: 'app-exercise-filters',
  imports: [ReactiveFormsModule, Button, InputText, Select, TranslatePipe],
  templateUrl: './exercise-filters.html',
})
export class ExerciseFilters {
  private readonly translator = inject(Translator);
  readonly filterChange = output<ExerciseFilter>();

  protected readonly muscleGroupOptions = computed(() => MUSCLE_GROUP_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));
  protected readonly equipmentTypeOptions = computed(() => EQUIPMENT_TYPE_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));
  protected readonly genderOptions = computed(() => GENDER_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));
  protected readonly activityOptions = computed(() => ACTIVITY_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));
  protected readonly placeOptions = computed(() => PLACE_OPTIONS.map(o => ({ ...o, label: this.translator.translate(o.label) })));

  protected readonly form = inject(NonNullableFormBuilder).group({
    search: [''],
    muscleGroup: [null as ExerciseFilter['muscleGroup'] | null],
    equipmentType: [null as ExerciseFilter['equipmentType'] | null],
    gender: [null as ExerciseFilter['gender'] | null],
    isHomeExercise: [null as boolean | null],
    isActive: [null as boolean | null],
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.filterChange.emit(this.toFilter()));
  }

  protected reset(): void {
    this.form.reset();
  }

  private toFilter(): ExerciseFilter {
    const value = this.form.getRawValue();
    const search = value.search.trim();
    return {
      ...(search.length === 0 ? {} : { search }),
      ...(value.muscleGroup === null ? {} : { muscleGroup: value.muscleGroup }),
      ...(value.equipmentType === null ? {} : { equipmentType: value.equipmentType }),
      ...(value.gender === null ? {} : { gender: value.gender }),
      ...(value.isHomeExercise === null ? {} : { isHomeExercise: value.isHomeExercise }),
      ...(value.isActive === null ? {} : { isActive: value.isActive }),
    };
  }
}
