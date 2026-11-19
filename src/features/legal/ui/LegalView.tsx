import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Screen, Text, TopBar } from '@/shared/ui';

/** Texte légal affiché : conditions d'utilisation ou politique de confidentialité. */
export type LegalKind = 'terms' | 'privacy';

const SECTION_KEYS = ['0', '1', '2', '3', '4'] as const;

export interface LegalViewProps {
  kind: LegalKind;
  onBack: () => void;
}

/** Conditions d'utilisation ou politique de confidentialité (sans maquette, style Clean Lavender). */
export function LegalView({ kind, onBack }: LegalViewProps) {
  const { t } = useTranslation();
  return (
    <Screen testID={`legal-${kind}`}>
      <TopBar title={t(`legal:${kind}.short`)} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Text variant="title" accessibilityRole="header">
          {t(`legal:${kind}.title`)}
        </Text>
        <Text variant="label" tone="muted">
          {t(`legal:${kind}.intro`)}
        </Text>
        {SECTION_KEYS.map((key) => (
          <Card key={key} padding={16}>
            <Text variant="section" accessibilityRole="header">
              {t(`legal:${kind}.sections.${key}.title`)}
            </Text>
            <Text style={{ marginTop: 6 }}>{t(`legal:${kind}.sections.${key}.body`)}</Text>
          </Card>
        ))}
        <Text variant="caption" tone="muted" style={{ marginTop: 8 }}>
          {t('legal:updated')}
        </Text>
      </View>
    </Screen>
  );
}
