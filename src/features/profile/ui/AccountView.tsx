import { useTranslation } from 'react-i18next';
import { Pressable, Switch, View } from 'react-native';

import { useTheme } from '@/core/theme';
import {
  Avatar,
  Button,
  Card,
  Icon,
  Pill,
  Screen,
  Section,
  Text,
  type IconName,
} from '@/shared/ui';

export interface AccountItem {
  key: string;
  label: string;
  icon: IconName;
  /** Pastille d'attention (« À activer »). */
  badge?: string;
  /** Coche verte : étape franchie (KYC vérifié). */
  done?: boolean;
  /** Fourni, la ligne porte un interrupteur au lieu d'un chevron. */
  toggle?: boolean;
}

export interface AccountGroup {
  title: string;
  items: readonly AccountItem[];
}

export interface AccountViewProps {
  name: string;
  email: string;
  badges: readonly { label: string; tone: 'success' | 'primary'; icon?: IconName }[];
  groups: readonly AccountGroup[];
  version: string;
  onItem: (key: string) => void;
  onToggle?: (key: string, value: boolean) => void;
  onLogout: () => void;
}

/** Compte et préférences (maquette `ProfileScreen`), présentation pure. */
export function AccountView(props: AccountViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen withTabBar testID="compte">
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <Text variant="display" accessibilityRole="header" style={{ fontSize: 28, lineHeight: 32 }}>
          {t('profile:account.title')}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <Card padding={20}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Avatar name={props.name} size={64} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                variant="section"
                style={{ fontFamily: theme.fontFamily.display }}
                numberOfLines={1}
              >
                {props.name}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {props.email}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {props.badges.map((badge) => (
                  <Pill
                    key={badge.label}
                    label={badge.label}
                    tone={badge.tone}
                    size="sm"
                    icon={badge.icon}
                  />
                ))}
              </View>
            </View>
          </View>
        </Card>
      </View>

      {props.groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <View style={{ paddingHorizontal: 20 }}>
            <Card padding={0}>
              {group.items.map((item, index) => {
                const toggled = item.toggle !== undefined;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole={toggled ? 'switch' : 'button'}
                    accessibilityLabel={item.label}
                    accessibilityState={toggled ? { checked: item.toggle } : undefined}
                    onPress={() =>
                      toggled ? props.onToggle?.(item.key, !item.toggle) : props.onItem(item.key)
                    }
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingHorizontal: 16,
                      minHeight: 56,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: theme.colors.divider,
                      backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
                    })}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: theme.colors.surfaceHigh,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={item.icon} size={16} />
                    </View>
                    <Text variant="label" style={{ flex: 1, color: theme.colors.text }}>
                      {item.label}
                    </Text>
                    {item.badge ? <Pill label={item.badge} tone="warning" size="sm" /> : null}
                    {item.done ? (
                      <Icon name="check" size={16} strokeWidth={2.5} tone="success" />
                    ) : null}
                    {toggled ? (
                      <Switch
                        value={item.toggle}
                        onValueChange={(value) => props.onToggle?.(item.key, value)}
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                        trackColor={{
                          false: theme.colors.outlineVariant,
                          true: theme.colors.primary,
                        }}
                        thumbColor={theme.colors.surface}
                      />
                    ) : (
                      <Icon name="chevronR" size={14} tone="muted" />
                    )}
                  </Pressable>
                );
              })}
            </Card>
          </View>
        </Section>
      ))}

      <View style={{ paddingHorizontal: 20, gap: 16, alignItems: 'center' }}>
        <Button label={t('common:actions.logout')} variant="ghost" full onPress={props.onLogout} />
        <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
          {props.version}
        </Text>
      </View>
    </Screen>
  );
}
