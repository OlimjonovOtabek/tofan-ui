import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { PlatformFeeForm } from '../../components/platform-fee-form/platform-fee-form';
import { PlatformFeeDraft } from '../../models/platform-fee-draft';
import { PlatformFeeStore } from '../../platform-fee.store';

@Component({
  selector: 'app-platform-fee-page',
  imports: [Button, Message, PlatformFeeForm, MessagePipe, TranslatePipe],
  providers: [PlatformFeeStore],
  templateUrl: './platform-fee-page.html',
})
export class PlatformFeePage {
  private readonly confirmations = inject(ConfirmDialogService);

  protected readonly store = inject(PlatformFeeStore);

  constructor() {
    void this.store.load();
  }

  protected async save(draft: PlatformFeeDraft): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      { key: 'platformFee.confirm.message' },
      'platformFee.confirm.header',
    );
    if (confirmed) {
      await this.store.save(draft);
    }
  }
}
