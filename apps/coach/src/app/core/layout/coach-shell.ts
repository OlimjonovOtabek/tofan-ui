import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { filter, map } from 'rxjs';
import { PushStore } from '../push/push.store';
import { Icon } from '../ui/icon/icon';
import { VideoUploadBar } from '../videos/video-upload-bar';
import { VideoUploadsStore } from '../videos/video-uploads.store';
import { BrandLogo } from './brand-logo';
import { COACH_TABS, isPushedRoute } from './coach-navigation';

@Component({
  selector: 'coach-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    Icon,
    BrandLogo,
    VideoUploadBar,
  ],
  templateUrl: './coach-shell.html',
  styleUrl: './coach-shell.css',
  host: { '(window:beforeunload)': 'warnBeforeClosing($event)' },
})
export class CoachShell implements OnInit {
  private readonly router = inject(Router);
  private readonly uploads = inject(VideoUploadsStore);
  private readonly push = inject(PushStore);

  protected readonly tabs = COACH_TABS;
  protected readonly pushed = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => isPushedRoute(this.router.routerState.snapshot.root)),
    ),
    { initialValue: isPushedRoute(this.router.routerState.snapshot.root) },
  );

  ngOnInit(): void {
    this.push.start();
  }

  protected warnBeforeClosing(event: BeforeUnloadEvent): void {
    if (this.uploads.busy()) {
      event.preventDefault();
    }
  }
}
