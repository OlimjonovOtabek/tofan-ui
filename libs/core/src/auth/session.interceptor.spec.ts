import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthPaths } from './auth-paths';
import { AuthStore } from './auth.store';
import { sessionInterceptor } from './session.interceptor';

const URL = '/api/chat/conversations/c1/messages';
const FORBIDDEN = 403;
const UNAUTHORIZED = 401;
const FORBIDDEN_ERROR_TYPE = 5;

describe('sessionInterceptor', () => {
  const router = { navigateByUrl: vi.fn() };
  const authStore = {
    hasSession: vi.fn(),
    renewSession: vi.fn(),
    logout: vi.fn(),
  };
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: AuthStore, useValue: authStore },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function refusal(status: number, body: object | null): Promise<unknown> {
    const result = firstValueFrom(client.post(URL, {})).catch((error: unknown) => error);
    http.expectOne(URL).flush(body, { status, statusText: 'refused' });
    return result;
  }

  it('should open the access denied page when a 403 carries no body', async () => {
    const error = await refusal(FORBIDDEN, null);

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(router.navigateByUrl).toHaveBeenCalledWith(AuthPaths.accessDenied);
  });

  it('should open the access denied page when a 403 only names itself forbidden', async () => {
    await refusal(FORBIDDEN, { title: 'Forbidden', status: FORBIDDEN });

    expect(router.navigateByUrl).toHaveBeenCalledWith(AuthPaths.accessDenied);
  });

  it('should keep the page and rethrow the error when a 403 carries a business code', async () => {
    const error = await refusal(FORBIDDEN, {
      title: 'Chat.SubscriptionRequired',
      status: FORBIDDEN,
    });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should keep the page when a 403 carries a business code in a result envelope', async () => {
    await refusal(FORBIDDEN, {
      data: null,
      isSuccess: false,
      isFailure: true,
      error: { code: 'Chat.SubscriptionRequired', message: '', type: FORBIDDEN_ERROR_TYPE },
    });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should renew the session and repeat the request when a 401 arrives with a session', async () => {
    authStore.hasSession.mockReturnValue(true);
    authStore.renewSession.mockResolvedValue(undefined);
    const result = firstValueFrom(client.get(URL));

    http.expectOne(URL).flush(null, { status: UNAUTHORIZED, statusText: 'Unauthorized' });
    await vi.waitFor(() => http.expectOne(URL).flush({ ok: true }));

    expect(await result).toEqual({ ok: true });
  });

  it('should sign out and rethrow when the session cannot be renewed after a 401', async () => {
    authStore.hasSession.mockReturnValue(true);
    authStore.renewSession.mockRejectedValue(new Error('expired'));
    const result = firstValueFrom(client.get(URL)).catch((error: unknown) => error);

    http.expectOne(URL).flush(null, { status: UNAUTHORIZED, statusText: 'Unauthorized' });

    expect(await result).toEqual(new Error('expired'));
    expect(authStore.logout).toHaveBeenCalled();
  });

  it('should pass a 401 through when there is no session to renew', async () => {
    authStore.hasSession.mockReturnValue(false);

    const error = await refusal(UNAUTHORIZED, null);

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(authStore.renewSession).not.toHaveBeenCalled();
  });
});
