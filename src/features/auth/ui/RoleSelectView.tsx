import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';
import { Icon, Screen, Text, type IconName } from '@/shared/ui';

import type { RegistrableRole } from '../schemas/authSchemas';

interface RoleOption {
  role: RegistrableRole;
  icon: IconName;
  accent: (theme: Theme) => string;
}

/** Rôles de la maquette `RoleSelectScreen`, dans son ordre. */
const ROLES: readonly RoleOption[] = [
  { role: 'client', icon: 'user', accent: (theme) => theme.colors.primary },
  { role: 'technicien', icon: 'wrench', accent: (theme) => theme.colors.primary },
  { role: 'agence', icon: 'grid', accent: (theme) => theme.colors.warning },
];

export interface RoleSelectViewProps {
  onSelect: (role: RegistrableRole) => void;
  onSignIn: () => void;
}

/** Choix du rôle (maquette `RoleSelectScreen`), présentation pure. */
export function RoleSelectView({ onSelect, onSignIn }: RoleSelectViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen testID="choix-role">
      <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primaryFixed,
            marginBottom: 18,
          }}
        >
          <View
            style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary }}
          />
          <Text variant="eyebrow" tone="primary" style={{ letterSpacing: 0.6 }}>
            {t('auth:access.roles.badge')}
          </Text>
        </View>
        <Text variant="display" accessibilityRole="header">
          {t('auth:access.roles.title')}
        </Text>
        <Text variant="display" tone="muted">
          {t('auth:access.roles.subtitle')}
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 12, gap: 12 }}>
        {ROLES.map((option) => (
          <Pressable
            key={option.role}
            accessibilityRole="button"
            accessibilityLabel={t(`auth:access.roles.${option.role}.title`)}
            accessibilityHint={t(`auth:access.roles.${option.role}.body`)}
            onPress={() => onSelect(option.role)}
            testID={`role-${option.role}`}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 20,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
            })}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: option.accent(theme),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={option.icon} size={28} strokeWidth={2} color="#ffffff" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                variant="section"
                style={{ fontFamily: theme.fontFamily.bodyBold, letterSpacing: -0.3 }}
              >
                {t(`auth:access.roles.${option.role}.title`)}
              </Text>
              <Text variant="label" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
                {t(`auth:access.roles.${option.role}.body`)}
              </Text>
            </View>
            <Icon name="arrowR" size={20} tone="muted" />
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        <Text variant="label" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
          {t('auth:access.roles.member')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onSignIn}
          style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', paddingHorizontal: 4 }}
        >
          <Text variant="labelStrong">{t('auth:access.roles.signIn')}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
