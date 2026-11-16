import { useTranslation } from 'react-i18next';

import { useSession, type Role } from '@/core/session';
import { useLogout } from '@/features/auth';
import type { IconName } from '@/shared/ui';

import type { ProfileDestination } from '../screens/ProfileScreen';
import { AccountView, type AccountGroup } from '../ui/AccountView';

/** Icône de chaque destination, reprise du jeu des maquettes. */
const ICONS: Record<ProfileDestination, IconName> = {
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
  reputation: 'badge',
  setup: 'list',
  settings: 'settings',
};

type GroupKey = 'identity' | 'activity' | 'money' | 'community';

/** Destinations du compte par groupe, selon le rôle. */
export function accountGroupsFor(role: Role): Record<GroupKey, ProfileDestination[]> {
  const tech = role === 'technicien';
  const client = role === 'client';
  return {
    identity: ['edit', 'password', 'locations', ...(tech ? (['kyc'] as const) : []), 'settings'],
    activity: tech
      ? [
          'setup',
          'professional',
          'skills',
          'zone',
          'planning',
          'appointments',
          'reviews',
          'reputation',
        ]
      : client
        ? ['appointments', 'upgrade']
        : [],
    money: ['wallet', ...(tech || client ? (['invoices'] as const) : [])],
    community: [
      'notifications',
      'messages',
      'feed',
      ...(tech || client ? (['disputes'] as const) : []),
    ],
  };
}

export interface AccountContainerProps {
  appVersion: string;
  onOpen: (destination: ProfileDestination) => void;
}

/** Onglet « Profil » des trois rôles, sur la session courante. */
export function AccountContainer({ appVersion, onOpen }: AccountContainerProps) {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const logout = useLogout();
  if (!user) return null;

  const plan = accountGroupsFor(user.role);
  const groups: AccountGroup[] = (Object.keys(plan) as GroupKey[])
    .filter((key) => plan[key].length > 0)
    .map((key) => ({
      title: t(`profile:accountTab.groups.${key}`),
      items: plan[key].map((destination) => ({
        key: destination,
        label: t(`profile:menu.${destination}`),
        icon: ICONS[destination],
      })),
    }));

  return (
    <AccountView
      name={user.name}
      email={user.email}
      badges={[
        { label: t(`common:roles.${user.role}`), tone: 'primary', icon: 'user' },
        ...(user.emailVerified
          ? [
              {
                label: t('profile:accountTab.emailOk'),
                tone: 'success' as const,
                icon: 'check' as const,
              },
            ]
          : []),
      ]}
      groups={groups}
      version={appVersion}
      onItem={(key) => onOpen(key as ProfileDestination)}
      onLogout={() => logout.mutate()}
    />
  );
}
