import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslationKey } from '@core/i18n/dictionary';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { findMenuGroupLabel } from '@core/layout/menu/menu-group';

interface BreadcrumbTrail {
  readonly group: TranslationKey | undefined;
  readonly pageTitleKey: string | undefined;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [TranslatePipe],
  template: `
    @let trail = breadcrumb();
    <nav class="layout-breadcrumb" [attr.aria-label]="'layout.topbar.breadcrumb' | t">
      <ol>
        @if (trail.group) {
          <li>{{ trail.group | t }}</li>
          <li class="layout-breadcrumb-chevron" aria-hidden="true">/</li>
        }
        <li class="layout-breadcrumb-current">{{ pageTitle(trail) }}</li>
      </ol>
    </nav>
  `,
})
export class Breadcrumb {
  private readonly router = inject(Router);
  private readonly translator = inject(Translator);

  protected readonly breadcrumb = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.buildTrail()),
    ),
    { initialValue: this.buildTrail() },
  );

  protected pageTitle(trail: BreadcrumbTrail): string {
    return trail.pageTitleKey ? this.translator.message(trail.pageTitleKey) : '';
  }

  private buildTrail(): BreadcrumbTrail {
    return {
      group: findMenuGroupLabel(this.router.url),
      pageTitleKey: deepestTitle(this.router.routerState.snapshot.root),
    };
  }
}

function deepestTitle(root: ActivatedRouteSnapshot): string | undefined {
  let title: string | undefined;
  for (let route: ActivatedRouteSnapshot | null = root; route; route = route.firstChild) {
    title = route.title ?? title;
  }
  return title;
}
