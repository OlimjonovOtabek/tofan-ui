import {
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  effect,
  inject,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Translator } from './translator';

export const APP_NAME = new InjectionToken<string>('APP_NAME');

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translator = inject(Translator);
  private readonly appName = inject(APP_NAME);
  private readonly pageTitleKey = signal<string | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const key = this.pageTitleKey();
      const pageTitle = key === undefined ? undefined : this.translator.message(key);
      this.title.setTitle(pageTitle ? `${pageTitle} | ${this.appName}` : this.appName);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.pageTitleKey.set(this.buildTitle(snapshot));
  }
}

export function provideAppTitle(appName: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: APP_NAME, useValue: appName },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ]);
}
