import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Avatar,
  Badge,
  Button,
  Card,
  FormTextField,
  Screen,
  StateView,
  Text,
} from '@/shared/components';
import { formatDistance, formatRating } from '@/shared/format';

import { useTechnicianIdentity, useUpdateTechnicianProfile } from '../hooks/useTechnician';
import {
  formatCompetences,
  technicianProfileFormSchema,
  toTechnicianProfilePayload,
  type TechnicianIdentity,
} from '../schemas/technicianSchemas';

/** Profil professionnel du technicien : état de vérification, synthèse et présentation. */
export function TechnicianProfileScreen() {
  const identity = useTechnicianIdentity();

  if (identity.isPending) {
    return (
      <Screen>
        <StateView status="loading" />
      </Screen>
    );
  }
  if (identity.isError) {
    return (
      <Screen>
        <StateView status="error" error={identity.error} onRetry={() => void identity.refetch()} />
      </Screen>
    );
  }
  return <TechnicianProfileForm identity={identity.data} />;
}

function TechnicianProfileForm({ identity }: { identity: TechnicianIdentity }) {
  const { t } = useTranslation();
  const update = useUpdateTechnicianProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(technicianProfileFormSchema),
    defaultValues: {
      bio: identity.bio ?? '',
      competences: formatCompetences(identity.competences),
    },
  });
  const perimeter = identity.service_perimeter;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);
    try {
      await update.mutateAsync(toTechnicianProfilePayload(values));
      setNotice(t('profile:technician.saved'));
    } catch (error) {
      const appError = normalizeError(error);
      const bioError = appError.fieldErrors.bio?.[0];
      // Le serveur indexe les savoir-faire (`competences.0`) : l'erreur est ramenée au champ unique.
      const competenceError = Object.entries(appError.fieldErrors).find(([field]) =>
        field.startsWith('competences'),
      )?.[1][0];
      if (bioError) form.setError('bio', { type: 'server', message: bioError });
      if (competenceError) {
        form.setError('competences', { type: 'server', message: competenceError });
      }
      if (!bioError && !competenceError) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('profile:technician.title')}
      </Text>
      <Card>
        <View style={styles.identity}>
          <Avatar name={identity.name} uri={identity.avatar_url} size={72} />
          <View style={styles.identityText}>
            <Text variant="subtitle">{identity.name}</Text>
            <Badge
              label={t(
                identity.verified ? 'profile:technician.verified' : 'profile:technician.unverified',
              )}
              tone={identity.verified ? 'success' : 'warning'}
            />
            <Badge
              label={t(
                identity.kyc_approved
                  ? 'profile:technician.kycApproved'
                  : 'profile:technician.kycPending',
              )}
              tone={identity.kyc_approved ? 'success' : 'warning'}
            />
          </View>
        </View>
        {identity.rating != null ? (
          <Text tone="muted">
            {t('profile:technician.rating', {
              rating: formatRating(identity.rating),
              count: identity.num_reviews ?? 0,
            })}
          </Text>
        ) : null}
        {perimeter?.city && perimeter.radius != null ? (
          <Text tone="muted">
            {t('profile:technician.zoneSummary', {
              city: perimeter.city,
              radius: formatDistance(perimeter.radius),
            })}
          </Text>
        ) : (
          <Text tone="muted">{t('profile:technician.zoneMissing')}</Text>
        )}
        <Text tone="muted">
          {t('profile:technician.skillsSummary', { count: identity.skills.length })}
        </Text>
      </Card>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      {notice ? <Text tone="primary">{notice}</Text> : null}
      <FormTextField
        control={form.control}
        name="bio"
        label={t('profile:technician.bio')}
        multiline
      />
      <FormTextField
        control={form.control}
        name="competences"
        label={t('profile:technician.competences')}
      />
      <Text variant="caption" tone="muted">
        {t('profile:technician.competencesHint')}
      </Text>
      <Button
        label={t('profile:technician.submit')}
        onPress={() => void onSubmit()}
        loading={update.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  identityText: { flex: 1, gap: 6 },
});
