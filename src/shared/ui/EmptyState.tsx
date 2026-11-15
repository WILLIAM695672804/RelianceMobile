import { useId } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type EmptyStateTone = 'primary' | 'neutral' | 'warning' | 'danger';

function colorOf(tone: EmptyStateTone, theme: Theme): string {
  switch (tone) {
    case 'neutral':
      return theme.colors.textMuted;
    case 'warning':
      return theme.colors.warning;
    case 'danger':
      return theme.colors.danger;
    default:
      return theme.colors.primary;
  }
}

export interface EmptyStateProps {
  title: string;
  message: string;
  icon: IconName;
  tone?: EmptyStateTone;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  testID?: string;
}

/** État vide ou d'erreur des maquettes : médaillon pointillé, titre, explication, action. */
export function EmptyState({
  title,
  message,
  icon,
  tone = 'primary',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  testID,
}: EmptyStateProps) {
  const theme = useTheme();
  const color = colorOf(tone, theme);
  const id = `points${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: 60,
      }}
    >
      <View
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          backgroundColor: `${color}10`,
        }}
      >
        <Svg width={140} height={140} style={{ position: 'absolute', opacity: 0.5 }}>
          <Defs>
            <Pattern id={id} patternUnits="userSpaceOnUse" width={12} height={12}>
              <Circle cx={6} cy={6} r={1} fill={`${color}22`} />
            </Pattern>
          </Defs>
          <Rect width={140} height={140} fill={`url(#${id})`} />
        </Svg>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: `${color}33`,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={36} color={color} />
        </View>
      </View>
      <Text variant="title" align="center" accessibilityRole="header" style={{ marginBottom: 10 }}>
        {title}
      </Text>
      <Text
        variant="body"
        tone="muted"
        align="center"
        style={{ fontSize: 14, lineHeight: 21, maxWidth: 280, marginBottom: 28 }}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View style={{ minWidth: 220 }}>
          <Button label={actionLabel} size="lg" full onPress={onAction} />
        </View>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Pressable
          accessibilityRole="button"
          onPress={onSecondary}
          style={{
            marginTop: 10,
            minHeight: MIN_TOUCH_TARGET,
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}
        >
          <Text variant="label" tone="muted">
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
