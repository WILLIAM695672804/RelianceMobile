import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/shared/components';

export default function LoginRoute() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('common:appName')} />;
}
