import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import { useTheme, type Theme } from '@/core/theme';

export type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption';
export type TextTone = 'default' | 'muted' | 'primary' | 'danger' | 'onPrimary';

export interface TextProps extends NativeTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

const FONT_BY_VARIANT: Record<TextVariant, keyof Theme['fontFamily']> = {
  display: 'display',
  title: 'display',
  subtitle: 'displaySemiBold',
  body: 'body',
  caption: 'body',
};

const COLOR_BY_TONE: Record<TextTone, keyof Theme['colors']> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  danger: 'danger',
  onPrimary: 'onPrimary',
};

/** Texte typographié selon les jetons du thème. */
export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...rest}
      style={[
        {
          fontFamily: theme.fontFamily[FONT_BY_VARIANT[variant]],
          fontSize: theme.fontSize[variant],
          color: theme.colors[COLOR_BY_TONE[tone]],
        },
        style,
      ]}
    />
  );
}
