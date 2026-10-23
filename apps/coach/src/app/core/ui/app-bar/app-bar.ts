import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'coach-app-bar',
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    @if (backLink(); as link) {
      <a
        class="back c-pressable"
        [routerLink]="link"
        [attr.aria-label]="'coachApp.common.back' | t"
      >
        <coach-icon name="chevron-left" />
      </a>
    }
    @if (backButton()) {
      <button
        type="button"
        class="back c-pressable"
        [attr.aria-label]="'coachApp.common.back' | t"
        (click)="back.emit()"
      >
        <coach-icon name="chevron-left" />
      </button>
    }
    <div class="title">
      @if (title(); as title) {
        <h1 class="t-title3 font-semibold coach-ellipsis">{{ title }}</h1>
      }
      <ng-content />
    </div>
    <ng-content select="[actions]" />
  `,
  styleUrl: './app-bar.css',
})
export class AppBar {
  readonly title = input<string | null>(null);
  readonly backLink = input<string | readonly string[] | null>(null);
  readonly backButton = input(false);
  readonly back = output<void>();
}
