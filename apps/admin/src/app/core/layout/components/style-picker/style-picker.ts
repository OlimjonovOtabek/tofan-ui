import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { THEME_STYLES, ThemeStyle, stylePreview } from '@core/layout/theme/theme-styles';

@Component({
  selector: 'app-style-picker',
  imports: [TranslatePipe],
  templateUrl: './style-picker.html',
  host: { class: 'flex flex-col gap-2' },
})
export class StylePicker {
  readonly activeId = input.required<string | null>();

  readonly picked = output<ThemeStyle>();

  protected readonly tiles = THEME_STYLES.map((style) => ({ style, preview: stylePreview(style) }));
  protected readonly activeLabel = computed(
    () => THEME_STYLES.find((style) => style.id === this.activeId())?.label ?? null,
  );

  protected choose(event: Event, style: ThemeStyle): void {
    event.stopPropagation();
    this.picked.emit(style);
  }
}
