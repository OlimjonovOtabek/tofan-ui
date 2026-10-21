export interface LightGround {
  readonly top: string;
  readonly bottom: string;
}

const GROUND_GRADIENT_END_PERCENT = 111.26;

export const LIGHT_GROUNDS: Readonly<Record<string, LightGround>> = {
  noir: { top: '#f4f4f5', bottom: 'rgba(212, 212, 216, 0.12)' },
  blue: { top: '#e0e7f5', bottom: 'rgba(170, 194, 239, 0.06)' },
  green: { top: '#e0f5e1', bottom: 'rgba(170, 239, 172, 0.06)' },
  violet: { top: '#e9e0f5', bottom: 'rgba(198, 170, 239, 0.06)' },
  orange: { top: '#f5e9e0', bottom: 'rgba(239, 199, 170, 0.06)' },
  rose: { top: '#f5e0e3', bottom: 'rgba(239, 170, 180, 0.06)' },
  cyan: { top: '#e0f2f5', bottom: 'rgba(170, 229, 239, 0.06)' },
  pink: { top: '#f5e0eb', bottom: 'rgba(239, 170, 205, 0.06)' },
  red: { top: '#f5e0e0', bottom: 'rgba(239, 170, 170, 0.06)' },
  amber: { top: '#f5ede0', bottom: 'rgba(239, 214, 170, 0.06)' },
  yellow: { top: '#f5f0e0', bottom: 'rgba(239, 222, 170, 0.06)' },
  lime: { top: '#edf5e0', bottom: 'rgba(212, 239, 170, 0.06)' },
  emerald: { top: '#e0f5ee', bottom: 'rgba(170, 239, 216, 0.06)' },
  teal: { top: '#e0f5f3', bottom: 'rgba(170, 239, 231, 0.06)' },
  sky: { top: '#e0eef5', bottom: 'rgba(170, 217, 239, 0.06)' },
  purple: { top: '#ebe0f5', bottom: 'rgba(206, 170, 239, 0.06)' },
  fuchsia: { top: '#f2e0f5', bottom: 'rgba(230, 170, 239, 0.06)' },
  indigo: { top: '#e0e1f5', bottom: 'rgba(170, 171, 239, 0.06)' },
};

export const DARK_GROUNDS: Readonly<Record<string, string>> = {
  noir: '#09090b',
  blue: '#000c23',
  green: '#00231b',
  violet: '#0e0023',
  orange: '#231500',
  rose: '#230023',
  cyan: '#001e23',
  pink: '#230012',
  red: '#230000',
  amber: '#231600',
  yellow: '#231b00',
  lime: '#152300',
  emerald: '#002318',
  teal: '#00231f',
  sky: '#001823',
  purple: '#120023',
  fuchsia: '#1f0023',
  indigo: '#000123',
};

const FALLBACK_PRIMARY = 'blue';

export interface SurfaceGround {
  readonly background: string;
  readonly top: string;
}

export function surfaceGroundFor(primary: string, darkTheme: boolean): SurfaceGround {
  if (darkTheme) {
    const color = DARK_GROUNDS[primary] ?? DARK_GROUNDS[FALLBACK_PRIMARY];
    return { background: color, top: color };
  }
  const { top, bottom } = LIGHT_GROUNDS[primary] ?? LIGHT_GROUNDS[FALLBACK_PRIMARY];
  return {
    background: `linear-gradient(180deg, ${top} 0%, ${bottom} ${GROUND_GRADIENT_END_PERCENT}%)`,
    top,
  };
}
