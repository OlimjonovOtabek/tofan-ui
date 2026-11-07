import { Injectable, inject } from '@angular/core';
import { Translator } from '@core/i18n/translator';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';

@Injectable()
export class WorkoutProgramConfirmations {
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);

  togglePublished(published: boolean, name: string): Promise<boolean> {
    const t = this.translator.translate.bind(this.translator);
    return this.sheets.confirm({
      title: t(
        published
          ? 'coachApp.workoutProgram.unpublishConfirmTitle'
          : 'coachApp.programs.publishConfirmTitle',
      ),
      message: published
        ? t('coachApp.workoutProgram.lastPublishedWarning')
        : t('coachApp.programs.publishConfirmMessage', { name }),
      confirmLabel: t(
        published ? 'coachApp.workoutProgram.unpublish' : 'coachApp.programs.publish',
      ),
      cancelLabel: t('coachApp.common.cancel'),
    });
  }

  deleteProgram(): Promise<boolean> {
    const t = this.translator.translate.bind(this.translator);
    return this.sheets.confirm({
      title: t('coachApp.workoutProgram.deleteConfirmTitle'),
      message: t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: t('coachApp.workoutProgram.delete'),
      cancelLabel: t('coachApp.common.cancel'),
      destructive: true,
    });
  }

  deleteDay(number: number): Promise<boolean> {
    const t = this.translator.translate.bind(this.translator);
    return this.sheets.confirm({
      title: t('coachApp.day.deleteConfirmTitle', { day: t('coachApp.day.number', { number }) }),
      message: t('coachApp.workoutProgram.deleteConfirmMessage'),
      confirmLabel: t('coachApp.day.delete'),
      cancelLabel: t('coachApp.common.cancel'),
      destructive: true,
    });
  }
}
