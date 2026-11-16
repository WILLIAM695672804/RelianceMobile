import { useTranslation } from 'react-i18next';

import { RoleTabs } from '@/bootstrap/navigation/RoleTabs';

export default function TechnicienLayout() {
  const { t } = useTranslation();
  return (
    <RoleTabs
      items={[
        { key: 'index', label: t('common:navigation.missions'), icon: 'home' },
        { key: 'inbox', label: t('common:navigation.messages'), icon: 'chat' },
        { key: 'wallet', label: t('common:navigation.earnings'), icon: 'wallet' },
        { key: 'account', label: t('common:navigation.profile'), icon: 'user' },
      ]}
    />
  );
}
