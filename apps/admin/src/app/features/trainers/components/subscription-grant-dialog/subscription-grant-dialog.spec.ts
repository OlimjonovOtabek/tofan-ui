import { TestBed } from '@angular/core/testing';
import { Translator } from '@core/i18n/translator';
import { SubscriptionGrantDialog } from './subscription-grant-dialog';

describe('SubscriptionGrantDialog', () => {
  async function open(): Promise<void> {
    const fixture = TestBed.createComponent(SubscriptionGrantDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('trainerOptions', []);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should say that the grant opens Standard and VIP is given from the table when the dialog opens', async () => {
    await open();

    const hint = TestBed.inject(Translator).translate('trainers.grant.tierHint');
    expect(hint).toContain('VIP');
    expect(document.body.textContent).toContain(hint);
  });
});
