import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ErrorType } from './api.dto';
import { unwrapResult } from './result-envelope';

const noError = { code: '', message: '', type: ErrorType.Failure };

describe('unwrapResult', () => {
  it('should return the data when the envelope succeeded', () => {
    expect(unwrapResult({ isSuccess: true, isFailure: false, error: noError, data: 42 })).toBe(42);
  });

  it('should return nothing when the envelope carries no data', () => {
    expect(unwrapResult({ isSuccess: true, isFailure: false, error: noError })).toBeUndefined();
  });

  it('should throw the domain error when the envelope failed', () => {
    expect(() =>
      unwrapResult({
        isSuccess: false,
        isFailure: true,
        error: { code: 'Exercise.NotFound', message: 'Not found', type: ErrorType.NotFound },
      }),
    ).toThrow(NotFoundError);
  });

  it('should pass the payload through when it is not an envelope', () => {
    const page = { data: [{ id: '1' }], totalCount: 1 };

    expect(unwrapResult(page)).toBe(page);
  });
});
