import { HttpBackend, HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api, ApiFnOptional, ApiFnRequired } from './generated/api';
import { ApiConfiguration } from './generated';
import { toDomainError } from './api-error.mapper';
import { ResultPayload, unwrapResult } from './result-envelope';

/**
 * Calls generated API functions and hands the caller the payload alone: the `Result` envelope is
 * unwrapped and every failure arrives as a domain error.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly api = inject(Api);
  private readonly rootUrl = inject(ApiConfiguration).rootUrl;
  /** Bypasses the interceptors, so a call made here never triggers a token renewal. */
  private readonly anonymousHttp = new HttpClient(inject(HttpBackend));

  invoke<P, R>(
    fn: ApiFnRequired<P, R>,
    params: P,
    context?: HttpContext,
  ): Promise<ResultPayload<R>>;
  invoke<P, R>(
    fn: ApiFnOptional<P, R>,
    params?: P,
    context?: HttpContext,
  ): Promise<ResultPayload<R>>;
  async invoke<P, R>(
    fn: ApiFnRequired<P, R>,
    params: P,
    context?: HttpContext,
  ): Promise<ResultPayload<R>> {
    try {
      const body = (await this.api.invoke(fn, params, context)) as R;
      return unwrapResult(body);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  /** For the token endpoints, which must not be retried or refreshed by an interceptor. */
  async invokeAnonymously<P, R>(fn: ApiFnRequired<P, R>, params: P): Promise<ResultPayload<R>> {
    try {
      const response = await firstValueFrom(fn(this.anonymousHttp, this.rootUrl, params));
      return unwrapResult(response.body);
    } catch (error) {
      throw toDomainError(error);
    }
  }
}
