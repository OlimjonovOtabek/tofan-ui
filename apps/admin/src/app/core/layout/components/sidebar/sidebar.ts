import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AppPaths } from '@core/config/app-paths';
import { LayoutService } from '@core/layout/layout.service';
import { Logo } from '@shared/components/logo/logo';
import { SidebarMenu } from '@core/layout/components/sidebar-menu/sidebar-menu';

const SIDEBAR_SELECTOR = '.layout-sidebar';
const MENU_TOGGLE_SELECTOR = '.layout-menu-button';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, Logo, SidebarMenu],
  template: `
    <div class="layout-sidebar">
      <div class="sidebar-header">
        <a class="logo" [routerLink]="dashboardPath">
          <app-logo class="h-8" />
          <span class="app-name">TOFAN</span>
        </a>
      </div>
      <div class="layout-menu-container">
        <app-sidebar-menu />
      </div>
    </div>
  `,
  host: { '(document:click)': 'closeOnOutsideClick($event)' },
})
export class Sidebar {
  private readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);

  protected readonly dashboardPath = AppPaths.dashboard;

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
