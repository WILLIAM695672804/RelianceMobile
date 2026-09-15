import { useTranslation } from 'react-i18next';

import { useSession } from '@/core/session';
import { useLogout } from '@/features/auth';
import { Button, Card, Screen, Text } from '@/shared/components';

/** Compte : profil minimal et déconnexion. */
export function AccountScreen() {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const logout = useLogout();

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('common:account.title')}
      </Text>
      <Card>
        <Text variant="subtitle">{user?.name}</Text>
        <Text tone="muted">{t('common:account.email')}</Text>
        <Text>{user?.email}</Text>
        <Text tone="muted">{t('common:account.role')}</Text>
        <Text>{t(`common:roles.${user?.role ?? 'unknown'}`)}</Text>
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
