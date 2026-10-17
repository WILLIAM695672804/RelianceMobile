import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSession, type Role } from '@/core/session';
import { useLogout } from '@/features/auth';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ListItem,
  Screen,
  Text,
  type IconName,
} from '@/shared/components';

export type ProfileDestination =
  | 'edit'
  | 'password'
  | 'locations'
  | 'planning'
  | 'appointments'
  | 'invoices'
  | 'wallet'
  | 'reviews'
  | 'notifications'
  | 'messages'
  | 'feed'
  | 'professional'
  | 'skills'
  | 'zone'
  | 'kyc'
  | 'upgrade'
  | 'disputes'
  | 'settings';

export interface ProfileScreenProps {
  onOpen: (destination: ProfileDestination) => void;
}

/** Entrées du menu : volet professionnel et justificatifs pour le technicien, passage technicien pour le client. */
export function destinationsFor(role: Role): ProfileDestination[] {
  return [
    'edit',
    'password',
    'locations',
    ...(role === 'technicien'
      ? (['professional', 'skills', 'zone', 'planning', 'kyc'] as const)
      : []),
    ...(role === 'client' ? (['upgrade'] as const) : []),
    ...(role === 'client' || role === 'technicien' ? (['invoices', 'appointments'] as const) : []),
    'wallet',
    ...(role === 'technicien' ? (['reviews'] as const) : []),
    'notifications',
    'messages',
    'feed',
    ...(role === 'client' || role === 'technicien' ? (['disputes'] as const) : []),
    'settings',
  ];
}

/** Icône de chaque destination du menu, reprise du jeu des maquettes. */
const DESTINATION_ICONS: Record<ProfileDestination, IconName> = {
  edit: 'user',
  password: 'shield',
  locations: 'pin',
  professional: 'badge',
  skills: 'wrench',
  zone: 'map',
  planning: 'calendar',
  kyc: 'file',
  upgrade: 'arrowUp',
  invoices: 'file',
  appointments: 'calendar',
  wallet: 'wallet',
  reviews: 'star',
  notifications: 'bell',
  messages: 'chat',
  feed: 'list',
  disputes: 'shield',
  settings: 'settings',
};

/** E08 — Profil : identité, accès aux réglages du compte et déconnexion. */
export function ProfileScreen({ onOpen }: ProfileScreenProps) {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const logout = useLogout();

  if (!user) return null;

  return (
    <Screen title={t('profile:title')} scroll>
      <Card>
        <View style={styles.identity}>
          <Avatar name={user.name} uri={user.avatarUrl} size={72} />
          <View style={styles.identityText}>
            <Text variant="subtitle">{user.name}</Text>
            <Text tone="muted">{user.email}</Text>
            <Badge label={t(`common:roles.${user.role}`)} tone="primary" icon="user" />
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
            icon={DESTINATION_ICONS[destination]}
            onPress={() => onOpen(destination)}
          />
        ))}
      </Card>
      <Button
        label={t('common:actions.logout')}
        icon="arrowL"
        fullWidth
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
