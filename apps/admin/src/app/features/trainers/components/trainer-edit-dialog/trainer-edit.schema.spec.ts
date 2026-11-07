import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldTree, form } from '@angular/forms/signals';
import { Trainer } from '../../models/trainer';
import { TrainerAccount } from '../../models/trainer-account';
import {
  TrainerEditFormValue,
  toTrainerEditDraft,
  toTrainerEditFormValue,
  trainerEditFormSchema,
} from './trainer-edit.schema';

const account: TrainerAccount = {
  username: 'jasur',
  email: 'jasur@example.com',
  phoneNumber: '+998901234567',
};

function trainerSelling(vipMonthlyPrice: number | null): Trainer {
  return new Trainer(
    't1',
    'u1',
    'Jasur Karimov',
    'Kalistenika',
    'f1',
    'https://api.example/files/f1/content',
    350000,
    true,
    new Date('2026-10-02T09:00:00Z'),
    null,
    vipMonthlyPrice,
  );
}

function formOf(value: TrainerEditFormValue): FieldTree<TrainerEditFormValue> {
  return TestBed.runInInjectionContext(() =>
    form(signal(value), trainerEditFormSchema(signal(null))),
  );
}

describe('trainer edit form value', () => {
  it('should prefill the VIP price when the trainer sells VIP', () => {
    expect(toTrainerEditFormValue(trainerSelling(700000), account).vipMonthlyPrice).toBe(700000);
  });

  it('should prefill an empty VIP price when the trainer sells Standard only', () => {
    expect(toTrainerEditFormValue(trainerSelling(null), account).vipMonthlyPrice).toBeNull();
  });

  it('should keep the VIP price when the admin edits the name, bio, photo, email or phone', () => {
    const value = toTrainerEditFormValue(trainerSelling(700000), account);

    const draft = toTrainerEditDraft(
      {
        ...value,
        displayName: 'Jasur K.',
        bio: 'Yangi bio',
        email: 'yangi@example.com',
        phoneNumber: '',
      },
      null,
    );

    expect(draft.vipMonthlyPrice).toBe(700000);
  });

  it('should keep the VIP price when the admin edits the monthly price', () => {
    const value = toTrainerEditFormValue(trainerSelling(700000), account);

    const draft = toTrainerEditDraft({ ...value, monthlyPrice: 400000 }, 'f1');

    expect(draft.monthlyPrice).toBe(400000);
    expect(draft.vipMonthlyPrice).toBe(700000);
  });

  it('should send a null VIP price when the admin cleared the field', () => {
    const value = toTrainerEditFormValue(trainerSelling(700000), account);

    const draft = toTrainerEditDraft({ ...value, vipMonthlyPrice: null }, 'f1');

    expect(draft.vipMonthlyPrice).toBeNull();
  });

  it('should send a changed VIP price when the admin typed a new one', () => {
    const value = toTrainerEditFormValue(trainerSelling(null), account);

    const draft = toTrainerEditDraft({ ...value, vipMonthlyPrice: 800000 }, 'f1');

    expect(draft.vipMonthlyPrice).toBe(800000);
  });
});

describe('trainer edit form schema', () => {
  const value = toTrainerEditFormValue(trainerSelling(700000), account);

  it('should accept the VIP price when it is above zero', () => {
    const field = formOf({ ...value, vipMonthlyPrice: 1 }).vipMonthlyPrice();

    expect(field.valid()).toBe(true);
  });

  it('should accept an empty VIP price when the trainer sells Standard only', () => {
    const field = formOf({ ...value, vipMonthlyPrice: null }).vipMonthlyPrice();

    expect(field.valid()).toBe(true);
  });

  it('should refuse the VIP price when it is zero', () => {
    const field = formOf({ ...value, vipMonthlyPrice: 0 }).vipMonthlyPrice();

    expect(field.invalid()).toBe(true);
    expect(field.errors()[0]?.message).toBe('trainers.edit.errors.vipPrice');
  });

  it('should refuse the VIP price when it is below zero', () => {
    const field = formOf({ ...value, vipMonthlyPrice: -5 }).vipMonthlyPrice();

    expect(field.invalid()).toBe(true);
  });

  it('should accept the whole form when every field is valid and the VIP price is empty', () => {
    expect(formOf({ ...value, vipMonthlyPrice: null })().valid()).toBe(true);
  });
});
