import { DEFAULT_LIGHT_GROUND, shellGroundFor } from './surface-ground';

describe('shellGroundFor', () => {
  it('should use the cool to warm default gradient when no background is chosen in light mode', () => {
    expect(shellGroundFor(null, 'violet', false)).toEqual(DEFAULT_LIGHT_GROUND);
  });

  it('should follow the primary color when no background is chosen in dark mode', () => {
    expect(shellGroundFor(null, 'green', true)).toEqual({ background: '#00231b', top: '#00231b' });
  });

  it('should use the chosen background when one is picked', () => {
    expect(shellGroundFor('rose', 'blue', false).top).toBe('#f5e0e3');
    expect(shellGroundFor('rose', 'blue', true).top).toBe('#230023');
  });
});

describe('shellGroundFor with strong and matte tones', () => {
  it('should paint a deep gradient when the background is strong', () => {
    expect(shellGroundFor('strong-blue', 'blue', false)).toEqual({
      background:
        'linear-gradient(180deg, #2563eb 0%, color-mix(in srgb, #2563eb, #000000 14%) 100%)',
      top: '#2563eb',
    });
  });

  it('should soften the strong color when the background is matte', () => {
    expect(shellGroundFor('strong-blue', 'blue', false, true).top).toBe(
      'oklch(from #2563eb l calc(c * 0.4) h)',
    );
  });

  it('should soften the pale tint when a tinted background is matte', () => {
    const ground = shellGroundFor('rose', 'blue', false, true);
    expect(ground.top).toBe('oklch(from #f5e0e3 l calc(c * 0.4) h)');
    expect(ground.background).toContain('oklch(from #f5e0e3 l calc(c * 0.4) h) 0%');
  });
});
