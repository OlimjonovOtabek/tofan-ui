import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { LocalStorageSessionRepository, SESSION_STORAGE } from './local-storage-session.repository';

describe('LocalStorageSessionRepository', () => {
  let storage: Storage;
  let repository: LocalStorageSessionRepository;

  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    };

    TestBed.configureTestingModule({
      providers: [LocalStorageSessionRepository, { provide: SESSION_STORAGE, useValue: storage }],
    });
    repository = TestBed.inject(LocalStorageSessionRepository);
  });

  it('restores a saved session', () => {
    const session = new AuthSession('token', new Date('2030-01-01T00:00:00Z'), 'refresh');

    repository.save(session);

    expect(repository.get()).toEqual(session);
  });

  it('returns null after clearing', () => {
    repository.save(new AuthSession('token', new Date('2030-01-01T00:00:00Z')));

    repository.clear();

    expect(repository.get()).toBeNull();
  });

  it('discards corrupted data', () => {
    storage.setItem('tofan.session', '{"accessToken": 42}');

    expect(repository.get()).toBeNull();
    expect(storage.length).toBe(0);
  });
});
