import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '@core/layout/layout.service';
import { Sidebar } from '@core/layout/components/sidebar/sidebar';
import { Topbar } from '@core/layout/components/topbar/topbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Topbar, Sidebar],
  templateUrl: './layout.html',
})
export class Layout {
  protected readonly layoutService = inject(LayoutService);
}
