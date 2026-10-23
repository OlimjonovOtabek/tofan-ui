import { Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { LocaleStore } from '@core/i18n/locale.store';
import { lastWorkoutText } from '@coach/core/clients/client-activity';
import { formatDayMonth } from '@coach/core/format/formats';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { Icon } from '@coach/core/ui/icon/icon';
import { SectionCard } from '@coach/core/ui/section-card/section-card';
import { DashboardPerson } from '../../models/dashboard';

export type PeopleDetail = 'endsOn' | 'lastWorkout';

interface PersonRow {
  readonly person: DashboardPerson;
  readonly detail: string;
}

@Component({
  selector: 'coach-people-section',
  imports: [TranslatePipe, Avatar, Icon, SectionCard],
  templateUrl: './people-section.html',
  styleUrl: './people-section.css',
})
export class PeopleSection {
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  readonly title = input.required<string>();
  readonly people = input.required<readonly DashboardPerson[]>();
  readonly detail = input.required<PeopleDetail>();
  readonly now = input.required<Date>();
  readonly seeAll = output<void>();
  readonly openPerson = output<DashboardPerson>();

  protected readonly heading = computed(() => {
    const count = this.people().length;
    return count === 0
      ? this.title()
      : this.translator.translate('coachApp.dashboard.titleWithCount', {
          title: this.title(),
          count,
        });
  });
  protected readonly rows = computed<PersonRow[]>(() =>
    this.people().map((person) => ({ person, detail: this.detailOf(person) })),
  );

  private detailOf(person: DashboardPerson): string {
    if (this.detail() === 'endsOn') {
      return this.translator.translate('coachApp.dashboard.endsOn', {
        date: formatDayMonth(person.subscriptionEndsOn, this.locale()),
      });
    }
    const text = lastWorkoutText(person.lastWorkoutOn, this.now());
    return this.translator.translate(text.key, text.params);
  }
}
