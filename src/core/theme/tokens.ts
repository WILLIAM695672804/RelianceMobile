/** Jetons issus de `design/maquettes/design-system.jsx`. */
export const palette = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF3FB',
    text: '#101828',
    textMuted: '#5B6472',
    border: 'rgba(31,91,196,0.16)',
    divider: 'rgba(31,91,196,0.10)',
    ink: '#0F2C63',
  },
  dark: {
    background: '#0B1220',
    surface: '#111A2B',
    surfaceMuted: '#1A2437',
    text: '#F2F6FF',
    textMuted: 'rgba(240,245,255,0.55)',
    border: 'rgba(240,245,255,0.08)',
    divider: 'rgba(240,245,255,0.06)',
    ink: '#FFFFFF',
  },
};

/** Couleurs de marque et sémantiques (danger et avertissement relevés dans les écrans des maquettes). */
export const brand = {
  primary: '#1F5BC4',
  primaryLight: '#3B82D6',
  night: '#0F2C63',
  cyan: '#0EA5E9',
  onPrimary: '#FFFFFF',
  danger: '#E5484D',
  warning: '#F5A623',
  success: '#16A34A',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** Noms des polices chargées par `useAppFonts`. */
export const fontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displaySemiBold: 'BricolageGrotesque_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
};

export const fontSize = { caption: 12, body: 15, subtitle: 17, title: 22, display: 28 };

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  scheme: ColorScheme;
  colors: typeof palette.light & typeof brand;
  radius: typeof radius;
  spacing: typeof spacing;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
}

export function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: { ...palette[scheme], ...brand },
    radius,
    spacing,
    fontFamily,
    fontSize,
  };
}
