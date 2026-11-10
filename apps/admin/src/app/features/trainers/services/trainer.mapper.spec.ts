import {
  toCreateTrainerRequest,
  toTrainer,
  toTrainerListQuery,
  toUpdateTrainerRequest,
} from './trainer.mapper';
import { TrainerSummaryResponse } from './trainer.dto';

const response: TrainerSummaryResponse = {
  id: 't1',
  userId: 'u1',
  displayName: 'Jasur Karimov',
  slug: 'jasur-karimov',
  bio: 'Kuch mashqlari',
  photoFileId: 'f1',
  monthlyPrice: 450000,
  vipMonthlyPrice: 900000,
  isPublished: true,
  createdOnUtc: '2026-10-02T09:00:00Z',
  activeSubscribersCount: 4,
  userName: 'stage-coach',
  email: 'stage-coach@example.test',
  phoneNumber: null,
};

const photoUrlOf = (fileId: string): string => `https://api.example/files/${fileId}/content`;

describe('toTrainer', () => {
  it('should map every field when the trainer has a photo and a bio', () => {
    const trainer = toTrainer(response, photoUrlOf);

    expect(trainer.id).toBe('t1');
    expect(trainer.userId).toBe('u1');
    expect(trainer.displayName).toBe('Jasur Karimov');
    expect(trainer.slug).toBe('jasur-karimov');
    expect(trainer.bio).toBe('Kuch mashqlari');
    expect(trainer.photoUrl).toBe('https://api.example/files/f1/content');
    expect(trainer.monthlyPrice).toBe(450000);
    expect(trainer.vipMonthlyPrice).toBe(900000);
    expect(trainer.isPublished).toBe(true);
    expect(trainer.createdOn).toEqual(new Date('2026-10-02T09:00:00Z'));
  });

  it('should leave the photo and the bio empty when the backend sends null', () => {
    const trainer = toTrainer({ ...response, bio: null, photoFileId: null }, photoUrlOf);

    expect(trainer.bio).toBeNull();
    expect(trainer.photoFileId).toBeNull();
    expect(trainer.photoUrl).toBeNull();
  });

  it('should leave the slug empty when the backend sends none', () => {
    expect(toTrainer({ ...response, slug: undefined }, photoUrlOf).slug).toBeNull();
    expect(toTrainer({ ...response, slug: null }, photoUrlOf).slug).toBeNull();
  });

  it('should leave the VIP price empty when the backend sends null or nothing', () => {
    expect(
      toTrainer({ ...response, vipMonthlyPrice: null }, photoUrlOf).vipMonthlyPrice,
    ).toBeNull();
    expect(
      toTrainer({ ...response, vipMonthlyPrice: undefined }, photoUrlOf).vipMonthlyPrice,
    ).toBeNull();
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
      vipMonthlyPrice: 700000,
    };

    expect(toUpdateTrainerRequest(draft)).toEqual(draft);
  });

  it('should send the VIP price key as null when the trainer sells Standard only', () => {
    const request = toUpdateTrainerRequest({
      email: 'jasur@example.com',
      phoneNumber: null,
      displayName: 'Jasur',
      bio: null,
      photoFileId: null,
      monthlyPrice: 350000,
      vipMonthlyPrice: null,
    });

    expect(Object.keys(request)).toContain('vipMonthlyPrice');
    expect(request.vipMonthlyPrice).toBeNull();
  });
});

describe('toTrainer account summary', () => {
  it('should keep the account details and the subscriber count when the list sends them', () => {
    expect(toTrainer(response, photoUrlOf).summary).toEqual({
      userName: 'stage-coach',
      email: 'stage-coach@example.test',
      phoneNumber: null,
      activeSubscribersCount: 4,
    });
  });

  it('should fall back to empty details when the account has no trainer role', () => {
    const older: TrainerSummaryResponse = {
      ...response,
      userName: undefined,
      email: undefined,
      phoneNumber: undefined,
      activeSubscribersCount: undefined,
    };

    expect(toTrainer(older, photoUrlOf).summary).toEqual({
      userName: null,
      email: null,
      phoneNumber: null,
      activeSubscribersCount: 0,
    });
  });
});

describe('toTrainerListQuery', () => {
  it('should leave the filters out when none is set', () => {
    expect(toTrainerListQuery({})).toEqual({ Search: undefined, IsPublished: undefined });
  });

  it('should send the search and the publish flag when they are set', () => {
    expect(toTrainerListQuery({ search: 'stage', publishState: 'published' })).toEqual({
      Search: 'stage',
      IsPublished: true,
    });
    expect(toTrainerListQuery({ publishState: 'draft' })['IsPublished']).toBe(false);
  });
});
