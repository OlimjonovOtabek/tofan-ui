import { Component, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { Ripple } from '@openng/optimus-ui/ripple';
import { LayoutService } from '../../layout.service';
import { LayoutMenuItem } from '../../menu/layout-menu-item';

const EXACT_ROUTE_MATCH: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};

@Component({
  selector: '[app-sidebar-menu-item]',
  imports: [RouterLink, RouterLinkActive, Ripple],
  templateUrl: './sidebar-menu-item.html',
  styleUrl: './sidebar-menu-item.css',
  host: {
    '[class.active-menuitem]': 'isExpanded()',
    '[class.layout-root-menuitem]': 'root()',
  },
})
export class SidebarMenuItem {
  private readonly layoutService = inject(LayoutService);

  readonly item = input.required<LayoutMenuItem>();
  readonly root = input(false);
  readonly parentPath = input<string | null>(null);

  protected readonly exactRouteMatch = EXACT_ROUTE_MATCH;

  /** Skips the expand animation for submenus that are already open on first render. */
  protected readonly animationsEnabled = signal(false);

  protected readonly isVisible = computed(() => this.item().visible !== false);
  protected readonly hasChildren = computed(() => (this.item().items?.length ?? 0) > 0);
  protected readonly isRouteLink = computed(() => !!this.item().routerLink && !this.hasChildren());

  protected readonly fullPath = computed(() => {
    const itemPath = this.item().path;
    const parentPath = this.parentPath();
    if (!itemPath) {
      return parentPath;
    }
    return parentPath && !itemPath.startsWith(parentPath) ? parentPath + itemPath : itemPath;
  });

  protected readonly isExpanded = computed(() => {
    const path = this.fullPath();
    const activePath = this.layoutService.layoutState().activeMenuPath;
    return !!this.item().path && !!path && !!activePath?.startsWith(path);
  });

  constructor() {
    afterNextRender(() => this.animationsEnabled.set(true));
  }

  protected onClick(event: Event): void {
    const item = this.item();

    if (item.disabled) {
      event.preventDefault();
      return;
    }

    item.command?.({ originalEvent: event, item });

    if (this.hasChildren()) {
      this.layoutService.setActiveMenuPath(this.isExpanded() ? this.parentPath() : this.fullPath());
    } else {
      this.layoutService.hideMenu();
    }
  }
}
