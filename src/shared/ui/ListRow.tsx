import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Pill, type PillTone } from './Pill';
import { Text } from './Text';

export interface ListRowProps {
  title: string;
  /** Ligne secondaire (date, montant, statut détaillé). */
  detail?: string;
  icon?: IconName;
  /** Pastille de statut à droite. */
  pill?: { label: string; tone?: PillTone };
  /** Contenu libre à droite, à la place du chevron. */
  trailing?: ReactNode;
  /** Trait de séparation au-dessus (lignes groupées dans une carte). */
  divider?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

/** Ligne de liste Clean Lavender : pastille d'icône, intitulé, détail, statut, chevron. */
export function ListRow({
  title,
  detail,
  icon,
  pill,
  trailing,
  divider = false,
  onPress,
  accessibilityLabel,
  testID,
}: ListRowProps) {
  const theme = useTheme();
  const content = (
    <>
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            backgroundColor: theme.tint.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={17} tone="primary" />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text variant="labelStrong" numberOfLines={2}>
          {title}
        </Text>
        {detail ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>
      {pill ? <Pill label={pill.label} tone={pill.tone ?? 'neutral'} size="sm" /> : null}
      {trailing ?? (onPress ? <Icon name="chevronR" size={14} tone="muted" /> : null)}
    </>
  );
  const style = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    borderTopWidth: divider ? 1 : 0,
    borderTopColor: theme.colors.divider,
  };
  if (!onPress) {
    return (
      <View testID={testID} style={style}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        { backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent' },
      ]}
    >
      {content}
    </Pressable>
  );
}
