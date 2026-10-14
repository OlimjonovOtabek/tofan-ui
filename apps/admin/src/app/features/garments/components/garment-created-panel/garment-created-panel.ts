import { Component, inject, input } from '@angular/core';
import { CreatedGarment } from '../../models/created-garment';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';

@Component({
  selector: 'app-garment-created-panel',
  imports: [Button, Tooltip, TranslatePipe],
  templateUrl: './garment-created-panel.html',
})
export class GarmentCreatedPanel {
  private readonly clipboard = inject(ClipboardService);

  readonly garment = input.required<CreatedGarment>();

  protected copySerial(): Promise<void> {
    return this.clipboard.copy(this.garment().serialNumber, 'garments.fields.serialNumber');
  }

  protected copyLink(): Promise<void> {
    return this.clipboard.copy(this.garment().linkUrl, 'garments.fields.link');
  }

  protected copyToken(): Promise<void> {
    return this.clipboard.copy(this.garment().token, 'garments.fields.token');
  }
}
