import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Button,
  Card,
  FormTextField,
  Screen,
  StateView,
  Text,
  TextField,
} from '@/shared/components';
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

/** Zone d'intervention : position de référence, rayon et quartiers desservis. */
export function ServiceAreaScreen() {
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
  return <ServiceAreaForm identity={identity.data} />;
}

type Feedback = 'denied' | 'unavailable' | 'notFound';

function ServiceAreaForm({ identity }: { identity: TechnicianIdentity }) {
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
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('profile:zone.title')}
      </Text>
      <Text tone="muted">{t('profile:zone.hint')}</Text>
      <Card>
        {perimeter?.city && perimeter.radius != null ? (
          <Text>
            {t('profile:zone.current', {
              city: perimeter.city,
              radius: formatDistance(perimeter.radius),
            })}
          </Text>
        ) : (
          <Text tone="muted">{t('profile:zone.none')}</Text>
        )}
        {place ? (
          <Text tone="primary">
            {t('profile:zone.selectedPlace', {
              label: place.label ?? t('profile:zone.unnamedPlace'),
            })}
          </Text>
        ) : null}
        <Button
          label={t('profile:zone.useMyPosition')}
          onPress={() => void locate()}
          loading={busy === 'position'}
          disabled={busy !== null}
          variant="secondary"
        />
        <TextField
          label={t('profile:zone.manualAddress')}
          value={lookupAddress}
          onChangeText={setLookupAddress}
        />
        <Button
          label={t('profile:zone.locateAddress')}
          onPress={() => void locateFromAddress()}
          loading={busy === 'address'}
          disabled={busy !== null || lookupAddress.trim() === ''}
          variant="secondary"
        />
        {feedback === 'denied' ? (
          <View style={styles.notice}>
            <Text tone="danger">{t('profile:zone.permissionDenied')}</Text>
            <Button
              label={t('profile:zone.openSettings')}
              onPress={() => void openAppSettings()}
              variant="ghost"
            />
          </View>
        ) : null}
        {feedback === 'unavailable' ? (
          <Text tone="danger">{t('profile:zone.positionUnavailable')}</Text>
        ) : null}
        {feedback === 'notFound' ? (
          <Text tone="danger">{t('profile:zone.addressNotFound')}</Text>
        ) : null}
      </Card>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      {notice ? <Text tone="primary">{notice}</Text> : null}
      <FormTextField control={form.control} name="address" label={t('profile:zone.address')} />
      <FormTextField control={form.control} name="city" label={t('profile:zone.city')} />
      <FormTextField
        control={form.control}
        name="radiusKm"
        label={t('profile:zone.radius')}
        keyboardType="number-pad"
      />
      <FormTextField control={form.control} name="zones" label={t('profile:zone.zones')} />
      <Button
        label={t('profile:zone.submit')}
        onPress={() => void onSubmit()}
        loading={update.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { gap: 8 },
});
