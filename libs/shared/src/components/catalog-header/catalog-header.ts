import { Component, input } from '@angular/core';

@Component({
  selector: 'app-catalog-header',
  host: { class: 'mb-4 flex flex-wrap items-center justify-between gap-3' },
  template: `
    <div>
      <h1 class="text-surface-900 dark:text-surface-0 m-0 text-xl font-semibold">
        {{ title() }}
      </h1>
      @if (subtitle(); as text) {
        <span class="text-muted-color text-sm">{{ text }}</span>
      }
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <ng-content />
    </div>
  `,
})
export class CatalogHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
