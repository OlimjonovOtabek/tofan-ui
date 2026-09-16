import { DomainError } from '@domain/shared/errors/domain.error';
import { ApiError } from './generated';
import { toDomainErrorFromApiError } from './api-error.mapper';

/**
 * Every backend write is wrapped in `Result` / `Result<T>`; queries answer with the payload itself.
 * `ResultPayload` is what callers actually care about: the `data` of an envelope, or the body as is.
 */
export type ResultPayload<TBody> = 'isSuccess' extends keyof TBody
  ? 'data' extends keyof TBody
    ? TBody['data']
    : void
  : TBody;

interface ResultEnvelope {
  isSuccess: boolean;
  error: ApiError;
  data?: unknown;
}

/** @throws DomainError when the envelope reports a failure. */
export function unwrapResult<TBody>(body: TBody): ResultPayload<TBody> {
  if (!isResultEnvelope(body)) {
    return body as ResultPayload<TBody>;
  }
  if (!body.isSuccess) {
    throw toDomainErrorFromApiError(body.error);
  }
  return body.data as ResultPayload<TBody>;
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

function isResultEnvelope(body: unknown): body is ResultEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Record<string, unknown>)['isSuccess'] === 'boolean'
  );
}
