import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AppPaths } from '@core/config/app-paths';
import { LayoutService } from '@core/layout/layout.service';
import { Logo } from '@shared/components/logo/logo';
import { SidebarMenu } from '@core/layout/components/sidebar-menu/sidebar-menu';
import { UserMenu } from '@core/layout/components/user-menu/user-menu';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, Logo, SidebarMenu, UserMenu],
  host: { class: 'flex' },
  template: `
    <aside class="layout-sidebar">
      <a class="sidebar-brand" [routerLink]="dashboardPath">
        <app-logo />
        <span class="app-name">TOFAN</span>
      </a>
      <nav class="layout-menu-container">
        <app-sidebar-menu />
      </nav>
      <div class="sidebar-footer">
        <app-user-menu variant="sidebar" [compact]="layoutService.isRailMenu()" />
      </div>
    </aside>
  `,
})
export class Sidebar {
  protected readonly layoutService = inject(LayoutService);
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

  private syncMenuWithUrl(url: string): void {
    this.layoutService.setActiveMenuPath(url);
    this.layoutService.hideMenu();
  }
}
