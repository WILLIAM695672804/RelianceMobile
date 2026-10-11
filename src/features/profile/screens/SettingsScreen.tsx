import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { SUPPORTED_LANGUAGES, type Language } from '@/core/i18n';
import { useSession } from '@/core/session';
import { useLogout, useResendVerification } from '@/features/auth';
import { Button, Card, ListItem, Screen, Text } from '@/shared/components';

import { TwoFactorSection } from './TwoFactorSection';

type Feedback = { tone: 'primary' | 'danger'; text: string };

export interface SettingsScreenProps {
  /** Persistance de la langue choisie (fournie par la route). */
  onLanguageChange?: (language: Language) => void;
}

/** E26 — Paramètres : langue, double authentification, vérification de l'adresse, déconnexion. */
export function SettingsScreen({ onLanguageChange }: SettingsScreenProps) {
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
      setFeedback({ tone: 'primary', text: t('profile:settings.verificationSent') });
    } catch (error) {
      setFeedback({ tone: 'danger', text: describeError(normalizeError(error), t) });
    }
  };

  return (
    <Screen title={t('profile:settings.title')} scroll>
      {feedback ? <Text tone={feedback.tone}>{feedback.text}</Text> : null}

      <Card>
        <Text variant="subtitle">{t('profile:settings.language')}</Text>
        {SUPPORTED_LANGUAGES.map((language) => (
          <ListItem
            key={language}
            label={t(`profile:settings.languages.${language}`)}
            detail={
              i18n.resolvedLanguage === language ? t('profile:settings.currentLanguage') : undefined
            }
            onPress={() => changeLanguage(language)}
          />
        ))}
      </Card>

      <Card>
        <Text variant="subtitle">{t('profile:settings.security')}</Text>
        <TwoFactorSection onSuccess={(text) => setFeedback({ tone: 'primary', text })} />
      </Card>

      {emailVerified ? null : (
        <Card>
          <Text tone="muted">{t('profile:settings.verification')}</Text>
          <Button
            label={t('profile:settings.resendVerification')}
            onPress={() => void resend()}
            loading={resendVerification.isPending}
            variant="secondary"
          />
        </Card>
      )}

      <Button
        label={t('common:actions.logout')}
        onPress={() => logout.mutate()}
        loading={logout.isPending}
        variant="secondary"
      />
    </Screen>
  );
}
