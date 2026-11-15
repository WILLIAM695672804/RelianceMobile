import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, EmptyState, Screen } from '@/shared/ui';

export interface WebOnlyViewProps {
  /** `admin` : espace réservé à la plateforme web ; `unknown` : rôle non reconnu. */
  reason: 'admin' | 'unknown';
  onLogout: () => void;
  /** Fourni, propose d'ouvrir la plateforme web. */
  onOpenWeb?: () => void;
}

/** Administrateur ou rôle inconnu : l'espace n'existe que sur le web (sans maquette). */
export function WebOnlyView({ reason, onLogout, onOpenWeb }: WebOnlyViewProps) {
  const { t } = useTranslation();
  return (
    <Screen testID="espace-web" scroll={false}>
      <EmptyState
        icon="laptop"
        tone="neutral"
        title={t('common:session.webOnlyTitle')}
        message={t(reason === 'admin' ? 'common:session.webOnly' : 'common:session.unknownRole')}
        actionLabel={onOpenWeb ? t('common:session.openWeb') : undefined}
        onAction={onOpenWeb}
      />
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <Button label={t('common:actions.logout')} variant="ghost" full onPress={onLogout} />
      </View>
    </Screen>
  );
}
