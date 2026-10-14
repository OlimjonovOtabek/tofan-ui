import { LatestRequest } from './coach-latest-request';

describe('LatestRequest', () => {
  it('should treat a request as current when no newer request began', () => {
    const isCurrent = new LatestRequest().begin();

    expect(isCurrent()).toBe(true);
  });

  it('should treat a request as stale when a newer request began', () => {
    const latest = new LatestRequest();
    const isFirstCurrent = latest.begin();
    const isSecondCurrent = latest.begin();

    expect(isFirstCurrent()).toBe(false);
    expect(isSecondCurrent()).toBe(true);
  });

  it('should treat a request as stale when it was cancelled', () => {
    const latest = new LatestRequest();
    const isCurrent = latest.begin();

    latest.cancel();

    expect(isCurrent()).toBe(false);
  });
});
