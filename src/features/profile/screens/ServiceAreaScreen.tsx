import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import {
  Banner,
  Button,
  Card,
  Field,
  ListRow,
  QueryGate,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';
import { formatDistance } from '@/shared/format';
import { geocodeAddress, locateDevice, openAppSettings, type Place } from '@/shared/location';

import { useTechnicianIdentity, useUpdateServiceArea } from '../hooks/useTechnician';
import {
  formatCompetences,
  mapServiceAreaFieldErrors,
  serviceAreaFormSchema,
  toServiceAreaPayload,
  type ServiceAreaFormValues,
  type TechnicianIdentity,
} from '../schemas/technicianSchemas';

/** Rayon proposé par défaut lorsque le serveur n'en a pas. */
const DEFAULT_RADIUS_KM = 50;

export interface ServiceAreaScreenProps {
  onBack?: () => void;
}

/** Zone d'intervention : position de référence, rayon et quartiers desservis. */
export function ServiceAreaScreen({ onBack }: ServiceAreaScreenProps = {}) {
  const identity = useTechnicianIdentity();
  return (
    <QueryGate queries={[identity]}>
      {() => <ServiceAreaForm identity={identity.data!} onBack={onBack} />}
    </QueryGate>
  );
}

type Feedback = 'denied' | 'unavailable' | 'notFound';

function ServiceAreaForm({
  identity,
  onBack,
}: {
  identity: TechnicianIdentity;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  const update = useUpdateServiceArea();
  const perimeter = identity.service_perimeter;
  const initialPlace: Place | null =
    perimeter?.latitude != null && perimeter.longitude != null
      ? {
          latitude: perimeter.latitude,
          longitude: perimeter.longitude,
          label: perimeter.address ?? perimeter.city ?? null,
          city: perimeter.city ?? null,
        }
      : null;
  const [place, setPlace] = useState<Place | null>(initialPlace);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState<'position' | 'address' | null>(null);
  const [lookupAddress, setLookupAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(serviceAreaFormSchema),
    defaultValues: {
      address: perimeter?.address ?? '',
      city: perimeter?.city ?? '',
      radiusKm: String(Math.round(perimeter?.radius ?? DEFAULT_RADIUS_KM)),
      zones: formatCompetences(perimeter?.zones ?? []),
    },
  });

  const locate = async () => {
    setFeedback(null);
    setBusy('position');
    const result = await locateDevice();
    setBusy(null);
    if (result.status === 'located') {
      setPlace(result.place);
      if (result.place.city) form.setValue('city', result.place.city);
    } else setFeedback(result.status);
  };

  const locateFromAddress = async () => {
    setFeedback(null);
    setBusy('address');
    const found = await geocodeAddress(lookupAddress);
    setBusy(null);
    if (found) setPlace(found);
    else setFeedback('notFound');
  };

  const onSubmit = form.handleSubmit(async (values: ServiceAreaFormValues) => {
    setFormError(null);
    setNotice(null);
    if (!place) {
      setFormError(t('profile:zone.errors.placeRequired'));
      return;
    }
    try {
      await update.mutateAsync(toServiceAreaPayload(values, place));
      setNotice(t('profile:zone.saved'));
    } catch (error) {
      const appError = normalizeError(error);
      const mapped = Object.entries(mapServiceAreaFieldErrors(appError.fieldErrors));
      for (const [field, messages] of mapped) {
        const message = messages[0];
        if (message) {
          form.setError(field as keyof ServiceAreaFormValues, { type: 'server', message });
        }
      }
      if (mapped.length === 0) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen
      testID="zone-intervention"
      footer={
        <Button
          label={t('profile:zone.submit')}
          size="lg"
          full
          onPress={() => void onSubmit()}
          loading={update.isPending}
        />
      }
    >
      <TopBar title={t('profile:zone.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Text variant="label" tone="muted">
          {t('profile:zone.hint')}
        </Text>
        <Card padding={0}>
          <ListRow
            icon="map"
            title={
              perimeter?.city && perimeter.radius != null
                ? t('profile:zone.current', {
                    city: perimeter.city,
                    radius: formatDistance(perimeter.radius),
                  })
                : t('profile:zone.none')
            }
            detail={
              place
                ? t('profile:zone.selectedPlace', {
                    label: place.label ?? t('profile:zone.unnamedPlace'),
                  })
                : undefined
            }
          />
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
            <Button
              label={t('profile:zone.useMyPosition')}
              icon="location"
              variant="soft"
              full
              onPress={() => void locate()}
              loading={busy === 'position'}
              disabled={busy !== null}
            />
            <Field
              label={t('profile:zone.manualAddress')}
              icon="search"
              value={lookupAddress}
              onChangeText={setLookupAddress}
            />
            <Button
              label={t('profile:zone.locateAddress')}
              variant="ghost"
              full
              onPress={() => void locateFromAddress()}
              loading={busy === 'address'}
              disabled={busy !== null || lookupAddress.trim() === ''}
            />
            {feedback === 'denied' ? (
              <>
                <Banner tone="danger" message={t('profile:zone.permissionDenied')} />
                <Button
                  label={t('profile:zone.openSettings')}
                  variant="ghost"
                  full
                  onPress={() => void openAppSettings()}
                />
              </>
            ) : null}
            {feedback === 'unavailable' ? (
              <Banner tone="danger" message={t('profile:zone.positionUnavailable')} />
            ) : null}
            {feedback === 'notFound' ? (
              <Banner tone="warning" message={t('profile:zone.addressNotFound')} />
            ) : null}
          </View>
        </Card>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        {notice ? <Banner tone="success" message={notice} /> : null}
      </View>
      <Section>
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <FormField
            control={form.control}
            name="address"
            label={t('profile:zone.address')}
            icon="pin"
          />
          <FormField
            control={form.control}
            name="city"
            label={t('profile:zone.city')}
            icon="location"
          />
          <FormField
            control={form.control}
            name="radiusKm"
            label={t('profile:zone.radius')}
            icon="map"
            keyboardType="number-pad"
          />
          <FormField
            control={form.control}
            name="zones"
            label={t('profile:zone.zones')}
            icon="grid"
          />
        </View>
      </Section>
    </Screen>
  );
}
