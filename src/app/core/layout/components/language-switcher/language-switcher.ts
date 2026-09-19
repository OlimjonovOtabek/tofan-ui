import { Component, computed, inject } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { Menu } from '@openng/optimus-ui/menu';
import { MenuItem } from '@openng/optimus-ui/api';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  imports: [Menu, TranslatePipe],
  template: `
    <button
      type="button"
      class="layout-topbar-action"
      [attr.aria-label]="'layout.topbar.language' | t"
      aria-haspopup="true"
      (click)="langMenu.toggle($event)"
    >
      <i class="pi pi-globe"></i>
    </button>
    <p-menu #langMenu [model]="menuItems()" [popup]="true" appendTo="body" />
  `,
})
export class LanguageSwitcher {
  private readonly localeStore = inject(LocaleStore);

  protected readonly menuItems = computed<MenuItem[]>(() => [
    {
      label: "Oʻzbekcha",
      icon: this.localeStore.isUz() ? 'pi pi-check' : '',
      command: () => this.localeStore.setLocale('uz'),
    },
    {
      label: "Русский",
      icon: this.localeStore.isRu() ? 'pi pi-check' : '',
      command: () => this.localeStore.setLocale('ru'),
    },
    {
      label: "English",
      icon: this.localeStore.isEn() ? 'pi pi-check' : '',
      command: () => this.localeStore.setLocale('en'),
    }
  ]);
}
