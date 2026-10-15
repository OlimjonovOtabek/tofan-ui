import { ValidationError } from '@shared/models/errors/validation.error';
import { TrainerDraft, createTrainerDraft } from './trainer-draft';

const draft: TrainerDraft = {
  username: 'jasur.karimov',
  email: 'jasur@example.com',
  phoneNumber: '+998901234567',
  password: 'Passw0rd!23',
  displayName: 'Jasur Karimov',
  photoFileId: '7c1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
};

function issueCodes(invalid: TrainerDraft): string[] {
  try {
    createTrainerDraft(invalid);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createTrainerDraft', () => {
  it('should trim the text fields when the user typed them loosely', () => {
    const prepared = createTrainerDraft({
      ...draft,
      username: ' jasur.karimov ',
      email: ' jasur@example.com ',
      phoneNumber: ' +998901234567 ',
      displayName: '  Jasur  ',
    });

    expect(prepared).toEqual({ ...draft, displayName: 'Jasur' });
  });

  it('should keep the password exactly as typed when it has spaces', () => {
    expect(createTrainerDraft({ ...draft, password: ' Passw0rd!23 ' }).password).toBe(
      ' Passw0rd!23 ',
    );
  });

  it('should send no phone number when the field is blank', () => {
    expect(createTrainerDraft({ ...draft, phoneNumber: '   ' }).phoneNumber).toBeNull();
  });

  it('should refuse the draft when the username has characters Keycloak rejects', () => {
    expect(issueCodes({ ...draft, username: 'jasur karimov' })).toEqual(['User.InvalidUsername']);
  });

  it('should refuse the draft when the username is empty', () => {
    expect(issueCodes({ ...draft, username: '  ' })).toEqual(['User.InvalidUsername']);
  });

  it('should refuse the draft when the display name is blank', () => {
    expect(issueCodes({ ...draft, displayName: '   ' })).toEqual(['Trainer.DisplayNameEmpty']);
  });
});
