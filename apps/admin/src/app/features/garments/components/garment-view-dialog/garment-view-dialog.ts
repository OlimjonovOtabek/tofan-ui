import { Component, computed, inject, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { formatDate } from '@core/i18n/date-format';
import { TranslationKey } from '@core/i18n/dictionary';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Garment } from '../../models/garment';
import { GarmentDetail, garmentDetails } from '../../models/garment-details';
import { GARMENT_STATUS_LABELS, GARMENT_STATUS_SEVERITIES } from '../../models/garment-labels';

const MISSING_VALUE = '—';
const LINE_SEPARATOR = '\n';

interface GarmentDetailRow {
  readonly label: TranslationKey;
  readonly text: string;
  readonly copyable: boolean;
  readonly code: boolean;
  readonly swatch: string | null;
}

@Component({
  selector: 'app-garment-view-dialog',
  imports: [
    Dialog,
    Button,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Tag,
    Tooltip,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './garment-view-dialog.html',
})
export class GarmentViewDialog {
  private readonly clipboard = inject(ClipboardService);
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly visible = model.required<boolean>();
  readonly garment = input<Garment | null>(null);
  readonly now = input(new Date());

  readonly remove = output<Garment>();

  protected readonly soldiersPath = AppPaths.soldiers;
  protected readonly accountsPath = AppPaths.accounts;

  protected readonly rows = computed(() => {
    const garment = this.garment();
    return garment === null ? [] : garmentDetails(garment).map((detail) => this.toRow(detail));
  });
  protected readonly statusLabel = computed(() => {
    const garment = this.garment();
    return garment === null ? '' : this.translator.translate(GARMENT_STATUS_LABELS[garment.status]);
  });
  protected readonly statusSeverity = computed(() => {
    const garment = this.garment();
    return garment === null ? undefined : GARMENT_STATUS_SEVERITIES[garment.status];
  });
  protected readonly expired = computed(() => this.garment()?.isExpired(this.now()) ?? false);
  protected readonly deletable = computed(() => {
    const garment = this.garment();
    return garment !== null && garment.canDelete() ? garment : null;
  });

  protected copy(row: GarmentDetailRow): Promise<void> {
    return this.clipboard.copy(row.text, row.label);
  }

  protected copyAll(): Promise<void> {
    const status = `${this.translator.translate('garments.fields.status')}: ${this.statusLabel()}`;
    const lines = this.rows().map((row) => `${this.translator.translate(row.label)}: ${row.text}`);
    return this.clipboard.copy([status, ...lines].join(LINE_SEPARATOR), 'garments.view.everything');
  }

  private toRow(detail: GarmentDetail): GarmentDetailRow {
    const text = this.textOf(detail.value);
    return {
      label: detail.label,
      text,
      copyable: detail.value !== null,
      code: detail.code ?? false,
      swatch: detail.swatch === true && typeof detail.value === 'string' ? detail.value : null,
    };
  }

  private textOf(value: string | Date | null): string {
    if (value === null) {
      return MISSING_VALUE;
    }
    return value instanceof Date ? formatDate(value, this.localeStore.locale()) : value;
  }
}
