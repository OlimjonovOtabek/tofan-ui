import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { ErrorType } from './generated';
import { unwrapResult } from './result-envelope';

const noError = { code: '', message: '', type: ErrorType.Failure };

describe('unwrapResult', () => {
  it('returns the data of a successful envelope', () => {
    expect(unwrapResult({ isSuccess: true, isFailure: false, error: noError, data: 42 })).toBe(42);
  });

  it('returns nothing for an envelope that carries no data', () => {
    expect(unwrapResult({ isSuccess: true, isFailure: false, error: noError })).toBeUndefined();
  });

  it('throws the domain error of a failed envelope', () => {
    expect(() =>
      unwrapResult({
        isSuccess: false,
        isFailure: true,
        error: { code: 'Exercise.NotFound', message: 'Not found', type: ErrorType.NotFound },
      }),
    ).toThrow(NotFoundError);
  });

  it('passes a plain payload, such as a paged list, straight through', () => {
    const page = { data: [{ id: '1' }], totalCount: 1 };

    expect(unwrapResult(page)).toBe(page);
  });
});
