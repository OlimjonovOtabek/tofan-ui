import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { IconSprite } from '@landing/shared/icon/icon-sprite';
import { SiteFooter } from '../site-footer/site-footer';
import { SiteNav } from '../site-nav/site-nav';

@Component({
  selector: 'landing-shell',
  imports: [RouterOutlet, LandingTranslatePipe, IconSprite, SiteNav, SiteFooter],
  templateUrl: './landing-shell.html',
  styleUrl: './landing-shell.css',
})
export class LandingShell {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected skipToContent(): void {
    this.main().nativeElement.focus();
  }
}
