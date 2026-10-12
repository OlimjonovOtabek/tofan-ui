import { TestBed } from '@angular/core/testing';
import { AuthSession } from './auth-session';
import { AuthSessionStorage, SESSION_STORAGE } from './auth-session.storage';

describe('AuthSessionStorage', () => {
  let storage: Storage;
  let repository: AuthSessionStorage;

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
      providers: [AuthSessionStorage, { provide: SESSION_STORAGE, useValue: storage }],
    });
    repository = TestBed.inject(AuthSessionStorage);
  });

  it('should restore the session when it was saved before', () => {
    const session = new AuthSession('token', new Date('2030-01-01T00:00:00Z'), 'refresh');

    repository.save(session);

    expect(repository.get()).toEqual(session);
  });

  it('should return null when the session was cleared', () => {
    repository.save(new AuthSession('token', new Date('2030-01-01T00:00:00Z')));

    repository.clear();

    expect(repository.get()).toBeNull();
  });

  it('should discard the stored data when it is corrupted', () => {
    storage.setItem('tofan.session', '{"accessToken": 42}');

    expect(repository.get()).toBeNull();
    expect(storage.length).toBe(0);
  });
});
