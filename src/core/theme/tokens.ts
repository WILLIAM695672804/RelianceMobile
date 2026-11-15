import type { ViewStyle } from 'react-native';

/** Jetons du système Clean Lavender, repris de `design/maquettes/design-system.jsx`. */
export type ColorScheme = 'light' | 'dark';

/** Surfaces, textes et filets : un fond blanc d'abord, un seul accent violet. */
export const surfaces = {
  light: {
    background: '#ffffff',
    surface: '#ffffff',
    surfaceMuted: '#f6f6f8',
    surfaceContainer: '#f0f0f3',
    surfaceHigh: '#eaeaef',
    text: '#17161f',
    textMuted: '#57556a',
    border: '#ececf1',
    divider: '#ececf1',
    outlineVariant: '#d6d5df',
    outline: '#85839a',
    ink: '#17161f',
    primaryFixed: '#efeaff',
    onPrimaryFixed: '#4918c8',
    scrim: 'rgba(10, 10, 18, 0.45)',
  },
  dark: {
    background: '#0e0e12',
    surface: '#16161b',
    surfaceMuted: '#1b1b21',
    surfaceContainer: '#212128',
    surfaceHigh: '#292931',
    text: '#ededf2',
    textMuted: '#a8a6b8',
    border: '#26262e',
    divider: '#26262e',
    outlineVariant: '#3a3946',
    outline: '#7a788c',
    ink: '#ededf2',
    primaryFixed: '#2a2350',
    onPrimaryFixed: '#cdc1ff',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
};

/** Accent et couleurs sémantiques ; les variantes sombres sont celles des maquettes. */
export const accents = {
  light: {
    primary: '#5f3add',
    onPrimary: '#ffffff',
    success: '#006c49',
    warning: '#825100',
    danger: '#ba1a1a',
  },
  dark: {
    primary: '#b5a3ff',
    onPrimary: '#1f0a5c',
    success: '#5ee0a8',
    warning: '#ffb95f',
    danger: '#ff8a80',
  },
};

/** Fonds teintés des pastilles et des tuiles d'icône. */
export const tints = {
  light: {
    primary: '#efeaff',
    success: 'rgba(0, 108, 73, 0.10)',
    warning: 'rgba(130, 81, 0, 0.12)',
    danger: 'rgba(186, 26, 26, 0.10)',
    neutral: 'rgba(127, 127, 140, 0.12)',
  },
  dark: {
    primary: '#2a2350',
    success: 'rgba(94, 224, 168, 0.14)',
    warning: 'rgba(255, 185, 95, 0.14)',
    danger: 'rgba(255, 138, 128, 0.14)',
    neutral: 'rgba(127, 127, 140, 0.18)',
  },
};

export interface Shadows {
  card: ViewStyle;
  nav: ViewStyle;
  sheet: ViewStyle;
}

/** Ombres des maquettes, rendues par `boxShadow` (nouvelle architecture). */
export const shadows: Record<ColorScheme, Shadows> = {
  light: {
    card: { boxShadow: '0px 2px 8px rgba(23, 22, 31, 0.04)' },
    nav: { boxShadow: '0px 12px 32px -6px rgba(23, 22, 31, 0.14)' },
    sheet: { boxShadow: '0px -12px 40px rgba(10, 10, 18, 0.18)' },
  },
  dark: {
    card: {},
    nav: { boxShadow: '0px 12px 32px -6px rgba(0, 0, 0, 0.5)' },
    sheet: { boxShadow: '0px -12px 40px rgba(0, 0, 0, 0.5)' },
  },
};

/** Échelle d'arrondis Clean Lavender. */
export const radius = {
  xs: 8,
  sm: 10,
  md: 12,
  tile: 14,
  lg: 20,
  card: 20,
  xl: 28,
  sheet: 28,
  pill: 9999,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** Élévations Android, conservées pour l'ancienne interface jusqu'à sa suppression. */
export const elevation = {
  none: { elevation: 0 },
  low: { elevation: 1 },
  medium: { elevation: 3 },
  high: { elevation: 6 },
};

/** Noms des polices chargées par `useAppFonts` (Plus Jakarta Sans, une famille par graisse). */
export const fontFamily = {
  display: 'PlusJakartaSans_700Bold',
  displaySemiBold: 'PlusJakartaSans_600SemiBold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const fontSize = { caption: 12, label: 13, body: 15, subtitle: 17, title: 22, display: 28 };

export interface Theme {
  scheme: ColorScheme;
  colors: typeof surfaces.light & typeof accents.light;
  tint: typeof tints.light;
  shadow: Shadows;
  radius: typeof radius;
  spacing: typeof spacing;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  elevation: typeof elevation;
}

export function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: { ...surfaces[scheme], ...accents[scheme] },
    tint: tints[scheme],
    shadow: shadows[scheme],
    radius,
    spacing,
    fontFamily,
    fontSize,
    elevation,
  };
}
