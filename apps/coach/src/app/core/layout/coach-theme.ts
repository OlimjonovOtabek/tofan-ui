import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

const PRIMARY = {
  50: '#eef2ff', 100: '#dfe5ff', 200: '#c1ceff', 300: '#a2b3ff',
  400: '#8197f6', 500: '#344fd3', 600: '#2b43ba', 700: '#293a9c',
  800: '#27317d', 900: '#222c59', 950: '#151c39',
};
const SURFACE = {
  0: '#ffffff', 50: '#f8f9fc', 100: '#f4f6fa', 200: '#e1e6ee',
  300: '#bac5d8', 400: '#8693a8', 500: '#637086', 600: '#45536b',
  700: '#2d3a52', 800: '#202d45', 900: '#182138', 950: '#101727',
};

export const COACH_THEME = definePreset(Aura, {
  semantic: {
    primary: PRIMARY,
    formField: { borderRadius: '8px', paddingX: '12px', paddingY: '10px' },
    focusRing: { width: '2px', style: 'solid', color: '{primary.color}', offset: '2px' },
    colorScheme: {
      light: {
        surface: SURFACE,
        primary: { color: '{primary.500}', contrastColor: '{surface.0}', hoverColor: '{primary.600}', activeColor: '{primary.700}' },
        text: { color: '{surface.900}', mutedColor: '{surface.500}' },
        content: { background: '{surface.0}', borderColor: '{surface.200}' },
        formField: { color: '{surface.900}', borderColor: '{surface.200}', placeholderColor: '{surface.500}', shadow: 'none' },
      },
      dark: {
        surface: SURFACE,
        primary: { color: '{primary.400}', contrastColor: '{surface.950}', hoverColor: '{primary.300}', activeColor: '{primary.200}' },
        text: { color: '{surface.100}', mutedColor: '{surface.300}' },
        content: { background: '{surface.900}', borderColor: '{surface.700}' },
        formField: { background: '{surface.950}', color: '{surface.100}', borderColor: '{surface.700}', placeholderColor: '{surface.300}', shadow: 'none' },
      },
    },
  },
  components: {
    button: { root: { borderRadius: '8px', paddingX: '15px', paddingY: '10px', label: { fontWeight: '600' } } },
    card: { root: { borderRadius: '13px', shadow: 'none' }, body: { padding: '24px', gap: '16px' } },
    dialog: { root: { borderRadius: '15px' }, header: { padding: '22px 26px' }, content: { padding: '0 26px 24px' }, footer: { padding: '17px 26px' } },
  },
});
