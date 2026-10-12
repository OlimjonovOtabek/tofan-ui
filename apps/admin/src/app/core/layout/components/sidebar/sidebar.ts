import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LayoutService } from '@core/layout/layout.service';
import { SidebarMenu } from '@core/layout/components/sidebar-menu/sidebar-menu';

const SIDEBAR_SELECTOR = '.layout-sidebar';
const MENU_TOGGLE_SELECTOR = '.layout-menu-button';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarMenu],
  template: `
    <div class="layout-sidebar">
      <app-sidebar-menu />
    </div>
  `,
  host: { '(document:click)': 'closeOnOutsideClick($event)' },
})
export class Sidebar {
  private readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);

  constructor() {
    this.syncMenuWithUrl(this.router.url);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((event) => this.syncMenuWithUrl(event.urlAfterRedirects));
  }

  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.layoutService.isSidebarActive() || !(event.target instanceof Element)) {
      return;
    }
    const clickedInside = event.target.closest(`${SIDEBAR_SELECTOR}, ${MENU_TOGGLE_SELECTOR}`);
    if (!clickedInside) {
      this.layoutService.hideMenu();
    }
  }

  private syncMenuWithUrl(url: string): void {
    this.layoutService.setActiveMenuPath(url);
    this.layoutService.hideMenu();
  }
}
