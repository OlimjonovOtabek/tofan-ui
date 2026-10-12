import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CoachProgramsStore } from '../../coach-programs.store';

@Component({
  selector: 'coach-program-readiness',
  imports: [RouterLink, Skeleton, TranslatePipe],
  templateUrl: './coach-program-readiness.html',
  styleUrl: './coach-program-readiness.css',
})
export class CoachProgramReadiness {
  protected readonly store = inject(CoachProgramsStore);
}
