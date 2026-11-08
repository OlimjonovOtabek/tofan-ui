import { ValidationError } from '@shared/models/errors/validation.error';
import { PaymentOrderDraft, createPaymentOrderDraft } from './payment-order-draft';

const draft: PaymentOrderDraft = {
  userId: '6f0652dc-0978-4f16-b936-ca3363a33d1e',
  trainerId: '452bcf11-d084-4224-a4d2-54a589dfc707',
  price: 150000,
};

describe('createPaymentOrderDraft', () => {
  it('should keep the draft and trim both ids when everything is valid', () => {
    expect(
      createPaymentOrderDraft({
        ...draft,
        userId: ` ${draft.userId} `,
        trainerId: `${draft.trainerId} `,
      }),
    ).toEqual(draft);
  });

  it('should reject the draft when the user id is not a UUID', () => {
    expect(() => createPaymentOrderDraft({ ...draft, userId: 'husan' })).toThrow(ValidationError);
  });

  it('should reject the draft when the trainer id is not a UUID', () => {
    expect(() => createPaymentOrderDraft({ ...draft, trainerId: '' })).toThrow(ValidationError);
  });

  it.each([0, -1000, 1000.5])('should reject the draft when the price is %s', (price) => {
    expect(() => createPaymentOrderDraft({ ...draft, price })).toThrow(ValidationError);
  });
});
