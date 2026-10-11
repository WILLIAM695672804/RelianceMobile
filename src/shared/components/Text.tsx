import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import { MAX_FONT_SCALE, useResponsive } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';

export type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'label' | 'caption';
export type TextTone =
  'default' | 'muted' | 'primary' | 'danger' | 'warning' | 'success' | 'onPrimary';

export interface TextProps extends NativeTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

const FONT_BY_VARIANT: Record<TextVariant, keyof Theme['fontFamily']> = {
  display: 'display',
  title: 'display',
  subtitle: 'displaySemiBold',
  body: 'body',
  label: 'bodySemiBold',
  caption: 'body',
};

const COLOR_BY_TONE: Record<TextTone, keyof Theme['colors']> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  danger: 'danger',
  warning: 'warning',
  success: 'success',
  onPrimary: 'onPrimary',
};

/**
 * Texte typographié selon les jetons du thème, mis à l'échelle selon la classe de taille
 * de la fenêtre. La mise à l'échelle demandée par le système reste honorée jusqu'à
 * `MAX_FONT_SCALE`, au-delà duquel les mises en page se romperaient.
 */
export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  const theme = useTheme();
  const { typeScale } = useResponsive();
  return (
    <NativeText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[
        {
          fontFamily: theme.fontFamily[FONT_BY_VARIANT[variant]],
          fontSize: Math.round(theme.fontSize[variant] * typeScale),
          color: theme.colors[COLOR_BY_TONE[tone]],
        },
        style,
      ]}
    />
  );
}
