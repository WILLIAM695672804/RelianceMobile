import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { SUPPORTED_LANGUAGES, type Language } from '@/core/i18n';
import { useSession } from '@/core/session';
import { useLogout, useResendVerification } from '@/features/auth';
import { Banner, Button, Card, Icon, ListRow, Screen, Section, Text, TopBar } from '@/shared/ui';

import { TwoFactorSection } from './TwoFactorSection';

type Feedback = { tone: 'success' | 'danger'; text: string };

export interface SettingsScreenProps {
  /** Persistance de la langue choisie (fournie par la route). */
  onLanguageChange?: (language: Language) => void;
  onBack?: () => void;
}

/** E26 — Paramètres : langue, double authentification, vérification de l'adresse, déconnexion. */
export function SettingsScreen({ onLanguageChange, onBack }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const emailVerified = useSession((state) => state.user?.emailVerified ?? true);
  const logout = useLogout();
  const resendVerification = useResendVerification();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const changeLanguage = (language: Language) => {
    void i18n.changeLanguage(language);
    onLanguageChange?.(language);
  };

  const resend = async () => {
    setFeedback(null);
    try {
      await resendVerification.mutateAsync();
      setFeedback({ tone: 'success', text: t('profile:settings.verificationSent') });
    } catch (error) {
      setFeedback({ tone: 'danger', text: describeError(normalizeError(error), t) });
    }
  };

  return (
    <Screen testID="parametres">
      <TopBar title={t('profile:settings.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {feedback ? <Banner tone={feedback.tone} message={feedback.text} /> : null}
      </View>

      <Section title={t('profile:settings.language')}>
        <View style={{ paddingHorizontal: 20 }}>
          <Card padding={0}>
            {SUPPORTED_LANGUAGES.map((language, index) => {
              const current = i18n.resolvedLanguage === language;
              return (
                <ListRow
                  key={language}
                  divider={index > 0}
                  title={t(`profile:settings.languages.${language}`)}
                  detail={current ? t('profile:settings.currentLanguage') : undefined}
                  trailing={
                    current ? (
                      <Icon name="check" size={16} strokeWidth={2.5} tone="primary" />
                    ) : (
                      <View />
                    )
                  }
                  onPress={() => changeLanguage(language)}
                />
              );
            })}
          </Card>
        </View>
      </Section>

      <Section title={t('profile:settings.security')}>
        <View style={{ paddingHorizontal: 20 }}>
          <Card padding={0}>
            <TwoFactorSection onSuccess={(text) => setFeedback({ tone: 'success', text })} />
          </Card>
        </View>
      </Section>

      {emailVerified ? null : (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Card padding={16}>
            <Text variant="label" tone="muted" style={{ marginBottom: 12 }}>
              {t('profile:settings.verification')}
            </Text>
            <Button
              label={t('profile:settings.resendVerification')}
              variant="soft"
              full
              onPress={() => void resend()}
              loading={resendVerification.isPending}
            />
          </Card>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Button
          label={t('common:actions.logout')}
          variant="ghost"
          full
          onPress={() => logout.mutate()}
          loading={logout.isPending}
        />
      </View>
    </Screen>
  );
}
