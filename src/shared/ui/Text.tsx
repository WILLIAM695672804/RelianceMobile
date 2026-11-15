import type { ReactNode } from 'react';
import { Text as NativeText, type StyleProp, type TextStyle } from 'react-native';

import { MAX_FONT_SCALE, useResponsive } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'section'
  | 'bodyStrong'
  | 'body'
  | 'labelStrong'
  | 'label'
  | 'caption'
  | 'eyebrow';

export type TextTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'onPrimary'
  | 'onPrimaryFixed'
  | 'danger'
  | 'warning'
  | 'success';

interface VariantSpec {
  size: number;
  lineHeight: number;
  font: keyof Theme['fontFamily'];
  letterSpacing?: number;
  uppercase?: boolean;
}

/** Échelle typographique relevée dans les maquettes Clean Lavender. */
export const TEXT_VARIANTS: Record<TextVariant, VariantSpec> = {
  display: { size: 32, lineHeight: 35, font: 'display', letterSpacing: -1 },
  headline: { size: 30, lineHeight: 32, font: 'display', letterSpacing: -1 },
  title: { size: 22, lineHeight: 28, font: 'display', letterSpacing: -0.4 },
  section: { size: 17, lineHeight: 24, font: 'bodySemiBold' },
  bodyStrong: { size: 15, lineHeight: 22, font: 'bodySemiBold' },
  body: { size: 15, lineHeight: 22, font: 'body' },
  labelStrong: { size: 13, lineHeight: 18, font: 'bodySemiBold' },
  label: { size: 13, lineHeight: 18, font: 'bodyMedium' },
  caption: { size: 12, lineHeight: 16, font: 'bodyMedium' },
  eyebrow: { size: 11, lineHeight: 14, font: 'bodySemiBold', letterSpacing: 1.5, uppercase: true },
};

const COLOR_BY_TONE: Record<TextTone, keyof Theme['colors']> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  onPrimary: 'onPrimary',
  onPrimaryFixed: 'onPrimaryFixed',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
};

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  accessibilityRole?: 'header' | 'text';
  /** Réservé aux marges et aux couleurs calculées ; la typographie vient de la variante. */
  style?: StyleProp<TextStyle>;
  testID?: string;
}

/** Texte du système : variante typographique, tonalité, mise à l'échelle adaptative plafonnée. */
export function Text({
  children,
  variant = 'body',
  tone = 'default',
  align,
  numberOfLines,
  accessibilityRole,
  style,
  testID,
}: TextProps) {
  const theme = useTheme();
  const { typeScale } = useResponsive();
  const spec = TEXT_VARIANTS[variant];
  return (
    <NativeText
      testID={testID}
      numberOfLines={numberOfLines}
      accessibilityRole={accessibilityRole}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[
        {
          fontFamily: theme.fontFamily[spec.font],
          fontSize: Math.round(spec.size * typeScale),
          lineHeight: Math.round(spec.lineHeight * typeScale),
          letterSpacing: spec.letterSpacing,
          textTransform: spec.uppercase ? 'uppercase' : undefined,
          color: theme.colors[COLOR_BY_TONE[tone]],
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}
