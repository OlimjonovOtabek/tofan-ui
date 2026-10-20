import { toCreateTrainerRequest, toTrainer, toUpdateTrainerRequest } from './trainer.mapper';
import { TrainerResponse } from './trainer.dto';

const response: TrainerResponse = {
  id: 't1',
  userId: 'u1',
  displayName: 'Jasur Karimov',
  bio: 'Kuch mashqlari',
  photoFileId: 'f1',
  monthlyPrice: 450000,
  commissionPercent: 7.5,
  isPublished: true,
  createdOnUtc: '2026-10-02T09:00:00Z',
};

const photoUrlOf = (fileId: string): string => `https://api.example/files/${fileId}/content`;

describe('toTrainer', () => {
  it('should map every field when the trainer has a photo and a bio', () => {
    const trainer = toTrainer(response, photoUrlOf);

    expect(trainer.id).toBe('t1');
    expect(trainer.userId).toBe('u1');
    expect(trainer.displayName).toBe('Jasur Karimov');
    expect(trainer.bio).toBe('Kuch mashqlari');
    expect(trainer.photoUrl).toBe('https://api.example/files/f1/content');
    expect(trainer.monthlyPrice).toBe(450000);
    expect(trainer.commissionPercent).toBe(7.5);
    expect(trainer.isPublished).toBe(true);
    expect(trainer.createdOn).toEqual(new Date('2026-10-02T09:00:00Z'));
  });

  it('should leave the photo and the bio empty when the backend sends null', () => {
    const trainer = toTrainer({ ...response, bio: null, photoFileId: null }, photoUrlOf);

    expect(trainer.bio).toBeNull();
    expect(trainer.photoFileId).toBeNull();
    expect(trainer.photoUrl).toBeNull();
  });

  it('should keep the photo file id next to its url when the trainer has a photo', () => {
    expect(toTrainer(response, photoUrlOf).photoFileId).toBe('f1');
  });
});

describe('toCreateTrainerRequest', () => {
  it('should send the account fields, the card and the photo when the request is built', () => {
    const draft = {
      username: 'jasur',
      email: 'jasur@example.com',
      phoneNumber: null,
      password: 'Passw0rd!23',
      displayName: 'Jasur',
      bio: 'Kalistenika',
      photoFileId: 'f1',
    };

    expect(toCreateTrainerRequest(draft)).toEqual(draft);
  });
});

describe('toUpdateTrainerRequest', () => {
  it('should send the contact, the card and the price when the request is built', () => {
    const draft = {
      email: 'jasur@example.com',
      phoneNumber: '+998901234567',
      displayName: 'Jasur',
      bio: null,
      photoFileId: null,
      monthlyPrice: 350000,
    };

    expect(toUpdateTrainerRequest(draft)).toEqual(draft);
  });
});
