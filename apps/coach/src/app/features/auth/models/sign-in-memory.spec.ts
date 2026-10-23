import { FORGOTTEN_SIGN_IN, parseRememberedSignIn } from './sign-in-memory';

describe('parseRememberedSignIn', () => {
  it('should restore the identifier when the coach asked to be remembered', () => {
    expect(parseRememberedSignIn('{"identifier":"coach1","remember":true}')).toEqual({
      identifier: 'coach1',
      remember: true,
    });
  });

  it('should forget everything when remember is off', () => {
    expect(parseRememberedSignIn('{"identifier":"coach1","remember":false}')).toEqual(
      FORGOTTEN_SIGN_IN,
    );
  });

  it('should forget everything when the stored value is missing or broken', () => {
    expect(parseRememberedSignIn(null)).toEqual(FORGOTTEN_SIGN_IN);
    expect(parseRememberedSignIn('{oops')).toEqual(FORGOTTEN_SIGN_IN);
    expect(parseRememberedSignIn('{"identifier":1}')).toEqual(FORGOTTEN_SIGN_IN);
  });
});
