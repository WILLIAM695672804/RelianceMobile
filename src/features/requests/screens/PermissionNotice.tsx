import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/shared/components';
import { openAppSettings } from '@/shared/location';

export interface PermissionNoticeProps {
  /** Explication déjà traduite. */
  message: string;
}

/** Autorisation refusée : explication et accès aux réglages de l'application. */
export function PermissionNotice({ message }: PermissionNoticeProps) {
  const { t } = useTranslation();
  return (
    <>
      <Text tone="danger">{message}</Text>
      <Button
        label={t('requests:form.openSettings')}
        onPress={openAppSettings}
        variant="secondary"
      />
    </>
  );
}
