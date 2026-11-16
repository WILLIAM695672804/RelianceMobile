import { useTranslation } from 'react-i18next';

import { RoleTabs } from '@/bootstrap/navigation/RoleTabs';

export default function AgenceLayout() {
  const { t } = useTranslation();
  return (
    <RoleTabs
      items={[
        { key: 'index', label: t('common:navigation.agency'), icon: 'grid' },
        { key: 'team', label: t('common:navigation.team'), icon: 'user' },
        { key: 'inbox', label: t('common:navigation.messages'), icon: 'chat' },
        { key: 'account', label: t('common:navigation.profile'), icon: 'settings' },
      ]}
    />
  );
}
