import { Component } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Icon } from '../ui/icon/icon';

@Component({
  selector: 'coach-brand-logo',
  imports: [Icon, TranslatePipe],
  template: `
    <span class="mark"><coach-icon name="tofan-mark" /></span>
    <span class="t-title2">{{ 'coachApp.brand.first' | t }}</span>
    <span class="t-title2 tone-info">{{ 'coachApp.brand.second' | t }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
    .mark {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      margin-right: 10px;
      border-radius: 12px;
      background: var(--c-primary);
      color: var(--c-on-primary);
      --icon-size: 24px;
    }
    .t-title2 + .t-title2 {
      margin-left: 6px;
    }
  `,
})
export class BrandLogo {}
