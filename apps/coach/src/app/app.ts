import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from '@openng/optimus-ui/confirmdialog';
import { Toast } from '@openng/optimus-ui/toast';
import { ThemeStore } from './core/theme/theme.store';
import { Icon } from './core/ui/icon/icon';
import { IconSprite } from './core/ui/icon/icon-sprite';
import { SheetHost } from './core/ui/sheets/sheet-host';
import { VideoPlayer } from './core/videos/video-player';
import { IconName } from './core/ui/icon/icon-name';

const TOAST_ICONS: Readonly<Record<string, IconName>> = {
  success: 'check-circle',
  error: 'alert-triangle',
};

@Component({
  imports: [RouterOutlet, Toast, ConfirmDialog, Icon, IconSprite, SheetHost, VideoPlayer],
  selector: 'coach-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly theme = inject(ThemeStore);

  protected toastIcon(severity: string | undefined): IconName {
    return TOAST_ICONS[severity ?? ''] ?? 'info';
  }
}
