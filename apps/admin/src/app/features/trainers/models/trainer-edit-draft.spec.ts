import { ValidationError } from '@shared/models/errors/validation.error';
import { TrainerEditDraft, createTrainerEditDraft } from './trainer-edit-draft';

const draft: TrainerEditDraft = {
  email: 'jasur@example.com',
  phoneNumber: '+998901234567',
  displayName: 'Jasur Karimov',
  bio: 'Kalistenika',
  photoFileId: 'f1',
  monthlyPrice: 350000,
};

describe('createTrainerEditDraft', () => {
  it('should trim the text fields when the admin typed them loosely', () => {
    const prepared = createTrainerEditDraft({
      ...draft,
      email: ' jasur@example.com ',
      phoneNumber: ' +998901234567 ',
      displayName: ' Jasur Karimov ',
      bio: ' Kalistenika ',
    });

    expect(prepared).toEqual(draft);
  });

  it('should send no phone number and no bio when the fields are blank', () => {
    const prepared = createTrainerEditDraft({ ...draft, phoneNumber: ' ', bio: ' ' });

    expect(prepared.phoneNumber).toBeNull();
    expect(prepared.bio).toBeNull();
  });

  it('should refuse the draft when the display name is blank', () => {
    expect(() => createTrainerEditDraft({ ...draft, displayName: '  ' })).toThrow(ValidationError);
  });
});
