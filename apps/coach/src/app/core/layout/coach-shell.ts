import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { filter, map } from 'rxjs';
import { Icon } from '../ui/icon/icon';
import { BrandLogo } from './brand-logo';
import { COACH_TABS, isPushedRoute } from './coach-navigation';

@Component({
  selector: 'coach-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, Icon, BrandLogo],
  templateUrl: './coach-shell.html',
  styleUrl: './coach-shell.css',
})
export class CoachShell {
  private readonly router = inject(Router);

  protected readonly tabs = COACH_TABS;
  protected readonly pushed = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => isPushedRoute(this.router.routerState.snapshot.root)),
    ),
    { initialValue: isPushedRoute(this.router.routerState.snapshot.root) },
  );
}
