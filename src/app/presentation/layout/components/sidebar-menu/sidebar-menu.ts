import { Component } from '@angular/core';
import { APP_MENU } from '../../menu/app-menu';
import { SidebarMenuItem } from '../sidebar-menu-item/sidebar-menu-item';

@Component({
  selector: 'app-sidebar-menu',
  imports: [SidebarMenuItem],
  template: `
    <ul class="layout-menu">
      @for (item of items; track item.label) {
        @if (item.separator) {
          <li class="menu-separator"></li>
        } @else {
          <li app-sidebar-menu-item [item]="item" [root]="true"></li>
        }
      }
    </ul>
  `,
})
export class SidebarMenu {
  protected readonly items = APP_MENU;
}
