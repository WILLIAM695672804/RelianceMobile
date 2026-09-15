import { useTranslation } from 'react-i18next';

import { useSession } from '@/core/session';
import { PlaceholderScreen, Text } from '@/shared/components';

/** Accueil provisoire commun aux trois rôles (E05, E11 et E07 aux lots ultérieurs). */
export function RoleHomeScreen() {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  return (
    <PlaceholderScreen title={t('common:home.greeting', { name: user?.name ?? '' })}>
      <Text tone="primary">{t(`common:roles.${user?.role ?? 'unknown'}`)}</Text>
    </PlaceholderScreen>
  );
}
