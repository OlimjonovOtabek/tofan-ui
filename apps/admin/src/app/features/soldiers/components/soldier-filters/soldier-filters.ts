import { Component, computed, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { debounceTime } from 'rxjs';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ExperienceLevel, FitnessGoal, Gender } from '../../models/soldier-attributes';
import { SoldierFilter, toJoinedPeriod } from '../../models/soldier-filter';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  GENDER_OPTIONS,
  WORKOUT_PLACE_OPTIONS,
} from '../../models/soldier-labels';

const SEARCH_DEBOUNCE_MS = 400;

interface SoldierFilterValue {
  readonly search: string;
  readonly gender: Gender | null;
  readonly goal: FitnessGoal | null;
  readonly experienceLevel: ExperienceLevel | null;
  readonly isHomeWorkout: boolean | null;
  readonly joined: (Date | null)[] | null;
}

@Component({
  selector: 'app-soldier-filters',
  imports: [ReactiveFormsModule, Button, DatePicker, InputText, Select, TranslatePipe],
  templateUrl: './soldier-filters.html',
})
export class SoldierFilters {
  private readonly translator = inject(Translator);

  readonly filterChange = output<SoldierFilter>();

  protected readonly genderOptions = computed(() => this.translator.options(GENDER_OPTIONS));
  protected readonly goalOptions = computed(() => this.translator.options(FITNESS_GOAL_OPTIONS));
  protected readonly experienceOptions = computed(() =>
    this.translator.options(EXPERIENCE_LEVEL_OPTIONS),
  );
  protected readonly placeOptions = computed(() => this.translator.options(WORKOUT_PLACE_OPTIONS));
  protected readonly today = new Date();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this.formBuilder.group({
    search: [''],
    gender: [null as Gender | null],
    goal: [null as FitnessGoal | null],
    experienceLevel: [null as ExperienceLevel | null],
    isHomeWorkout: [null as boolean | null],
    joined: this.formBuilder.control<(Date | null)[] | null>(null),
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.filterChange.emit(toSoldierFilter(this.form.getRawValue())));
  }

  protected reset(): void {
    this.form.reset();
  }
}

function toSoldierFilter(value: SoldierFilterValue): SoldierFilter {
  const search = value.search.trim();
  const [firstDay = null, lastDay = null] = value.joined ?? [];
  return {
    ...(search.length === 0 ? {} : { search }),
    ...(value.gender === null ? {} : { gender: value.gender }),
    ...(value.goal === null ? {} : { goal: value.goal }),
    ...(value.experienceLevel === null ? {} : { experienceLevel: value.experienceLevel }),
    ...(value.isHomeWorkout === null ? {} : { isHomeWorkout: value.isHomeWorkout }),
    ...toJoinedPeriod(firstDay, lastDay ?? firstDay),
  };
}
