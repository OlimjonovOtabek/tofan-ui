import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Translator } from '@core/i18n/translator';

const APP_NAME = 'Tofan Admin';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translator = inject(Translator);
  private readonly pageTitleKey = signal<string | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const key = this.pageTitleKey();
      const pageTitle = key === undefined ? undefined : this.translator.message(key);
      this.title.setTitle(pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.pageTitleKey.set(this.buildTitle(snapshot));
  }
}
