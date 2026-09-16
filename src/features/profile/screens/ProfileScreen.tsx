import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSession, type Role } from '@/core/session';
import { useLogout } from '@/features/auth';
import { Avatar, Badge, Button, Card, ListItem, Screen, Text } from '@/shared/components';

export type ProfileDestination = 'edit' | 'password' | 'locations' | 'kyc' | 'upgrade' | 'settings';

export interface ProfileScreenProps {
  onOpen: (destination: ProfileDestination) => void;
}

/** Entrées du menu : justificatifs pour le technicien, passage technicien pour le client. */
export function destinationsFor(role: Role): ProfileDestination[] {
  return [
    'edit',
    'password',
    'locations',
    ...(role === 'technicien' ? (['kyc'] as const) : []),
    ...(role === 'client' ? (['upgrade'] as const) : []),
    'settings',
  ];
}

/** E08 — Profil : identité, accès aux réglages du compte et déconnexion. */
export function ProfileScreen({ onOpen }: ProfileScreenProps) {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('profile:title')}
      </Text>
      <Card>
        <View style={styles.identity}>
          <Avatar name={user.name} uri={user.avatarUrl} />
          <View style={styles.identityText}>
            <Text variant="subtitle">{user.name}</Text>
            <Text tone="muted">{user.email}</Text>
            <Text tone="primary">{t(`common:roles.${user.role}`)}</Text>
          </View>
        </View>
        <Badge
          label={t(user.emailVerified ? 'profile:emailVerified' : 'profile:emailNotVerified')}
          tone={user.emailVerified ? 'success' : 'warning'}
        />
      </Card>
      <Card>
        {destinationsFor(user.role).map((destination) => (
          <ListItem
            key={destination}
            label={t(`profile:menu.${destination}`)}
            onPress={() => onOpen(destination)}
          />
        ))}
      </Card>
      <Button
        label={t('common:actions.logout')}
        onPress={() => logout.mutate()}
        loading={logout.isPending}
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  identityText: { flex: 1, gap: 2 },
});
