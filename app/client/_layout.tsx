import { useTranslation } from 'react-i18next';

import { RoleTabs } from '@/bootstrap/navigation/RoleTabs';

export default function ClientLayout() {
  const { t } = useTranslation();
  return (
    <RoleTabs
      items={[
        { key: 'index', label: t('common:navigation.home'), icon: 'home' },
        { key: 'map', label: t('common:navigation.map'), icon: 'map' },
        { key: 'inbox', label: t('common:navigation.messages'), icon: 'chat' },
        { key: 'wallet', label: t('common:navigation.wallet'), icon: 'wallet' },
        { key: 'account', label: t('common:navigation.profile'), icon: 'user' },
      ]}
      fab={{ label: t('requests:home2.newRequest'), href: '/requests/new' }}
    />
  );
}
