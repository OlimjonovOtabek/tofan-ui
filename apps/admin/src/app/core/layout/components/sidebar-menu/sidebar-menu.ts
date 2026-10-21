import { Component } from '@angular/core';
import { APP_MENU } from '@core/layout/menu/app-menu';
import { SidebarMenuItem } from '@core/layout/components/sidebar-menu-item/sidebar-menu-item';

@Component({
  selector: 'app-sidebar-menu',
  imports: [SidebarMenuItem],
  template: `
    <ul class="layout-menu">
      @for (item of items; track item.label; let first = $first) {
        @if (!first) {
          <li class="menu-separator"></li>
        }
        <li app-sidebar-menu-item [item]="item" [root]="true"></li>
      }
    </ul>
  `,
})
export class SidebarMenu {
  protected readonly items = APP_MENU;
}
