import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { Button, Icon, Screen, StepIndicator, Text, type IconName } from '@/shared/components';

/** Icônes des diapositives, reprises de `ONBOARDING_SLIDES` des maquettes. */
const SLIDE_ICONS: readonly IconName[] = ['wrench', 'shield', 'star'];

export interface OnboardingScreenProps {
  /** Appelé au terme du fil comme à son abandon : l'appelant retient la visite. */
  onDone: () => void;
}

/** Fil d'accueil : trois diapositives présentant la promesse du service. */
export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const last = index === SLIDE_ICONS.length - 1;

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <StepIndicator steps={SLIDE_ICONS.length} current={index} testID="onboarding-steps" />
          <Button
            label={t(last ? 'auth:onboarding.start' : 'auth:onboarding.next')}
            icon="arrowR"
            size="lg"
            fullWidth
            onPress={() => (last ? onDone() : setIndex((current) => current + 1))}
          />
          {last ? null : (
            <Button label={t('auth:onboarding.skip')} variant="ghost" onPress={onDone} />
          )}
        </View>
      }
    >
      <View style={styles.slide}>
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.tint.primary, borderRadius: theme.radius.lg },
          ]}
        >
          <Icon name={SLIDE_ICONS[index]!} size={44} tone="primary" />
        </View>
        <Text variant="title" accessibilityRole="header" style={styles.centered}>
          {t(`auth:onboarding.slides.${index}.title`)}
        </Text>
        <Text tone="muted" style={styles.centered}>
          {t(`auth:onboarding.slides.${index}.body`)}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  badge: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  footer: { gap: 12 },
});
