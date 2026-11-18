import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import {
  Avatar,
  Banner,
  Button,
  Card,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  Text,
  TopBar,
} from '@/shared/ui';
import { formatDistance, formatRating } from '@/shared/format';

import { useTechnicianIdentity, useUpdateTechnicianProfile } from '../hooks/useTechnician';
import {
  formatCompetences,
  technicianProfileFormSchema,
  toTechnicianProfilePayload,
  type TechnicianIdentity,
} from '../schemas/technicianSchemas';

export interface TechnicianProfileScreenProps {
  onBack?: () => void;
}

/** Profil professionnel du technicien : état de vérification, synthèse et présentation. */
export function TechnicianProfileScreen({ onBack }: TechnicianProfileScreenProps = {}) {
  const identity = useTechnicianIdentity();
  return (
    <QueryGate queries={[identity]}>
      {() => <TechnicianProfileForm identity={identity.data!} onBack={onBack} />}
    </QueryGate>
  );
}

function TechnicianProfileForm({
  identity,
  onBack,
}: {
  identity: TechnicianIdentity;
  onBack?: () => void;
}) {
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
    <Screen
      testID="profil-professionnel"
      footer={
        <Button
          label={t('profile:technician.submit')}
          size="lg"
          full
          onPress={() => void onSubmit()}
          loading={update.isPending}
        />
      }
    >
      <TopBar title={t('profile:technician.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Card padding={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Avatar name={identity.name} uri={identity.avatar_url} size={64} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="section">{identity.name}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Pill
                  size="sm"
                  icon={identity.verified ? 'check' : 'clock'}
                  label={t(
                    identity.verified
                      ? 'profile:technician.verified'
                      : 'profile:technician.unverified',
                  )}
                  tone={identity.verified ? 'success' : 'warning'}
                />
                <Pill
                  size="sm"
                  icon="shield"
                  label={t(
                    identity.kyc_approved
                      ? 'profile:technician.kycApproved'
                      : 'profile:technician.kycPending',
                  )}
                  tone={identity.kyc_approved ? 'success' : 'warning'}
                />
              </View>
            </View>
          </View>
        </Card>
        <Card padding={0}>
          {identity.rating != null ? (
            <ListRow
              icon="star"
              title={t('profile:technician.rating', {
                rating: formatRating(identity.rating),
                count: identity.num_reviews ?? 0,
              })}
            />
          ) : null}
          <ListRow
            icon="map"
            divider={identity.rating != null}
            title={
              perimeter?.city && perimeter.radius != null
                ? t('profile:technician.zoneSummary', {
                    city: perimeter.city,
                    radius: formatDistance(perimeter.radius),
                  })
                : t('profile:technician.zoneMissing')
            }
          />
          <ListRow
            icon="wrench"
            divider
            title={t('profile:technician.skillsSummary', { count: identity.skills.length })}
          />
        </Card>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        {notice ? <Banner tone="success" message={notice} /> : null}
        <FormField
          control={form.control}
          name="bio"
          label={t('profile:technician.bio')}
          multiline
        />
        <FormField
          control={form.control}
          name="competences"
          label={t('profile:technician.competences')}
          hint={t('profile:technician.competencesHint')}
        />
      </View>
    </Screen>
  );
}
