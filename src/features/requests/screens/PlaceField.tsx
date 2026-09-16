import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Text, TextField } from '@/shared/components';
import { geocodeAddress, locateDevice, type Place } from '@/shared/location';

import { PermissionNotice } from './PermissionNotice';

export interface PlaceFieldProps {
  value: Place | null;
  onChange: (place: Place) => void;
  /** Message déjà traduit. */
  error?: string;
}

type Feedback = 'denied' | 'unavailable' | 'notFound';

/** Localisation d'une demande : position de l'appareil ou adresse saisie puis géocodée. */
export function PlaceField({ value, onChange, error }: PlaceFieldProps) {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState<'position' | 'address' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const locate = async () => {
    setFeedback(null);
    setBusy('position');
    const result = await locateDevice();
    setBusy(null);
    if (result.status === 'located') onChange(result.place);
    else setFeedback(result.status);
  };

  const locateAddress = async () => {
    setFeedback(null);
    setBusy('address');
    const place = await geocodeAddress(address);
    setBusy(null);
    if (place) onChange(place);
    else setFeedback('notFound');
  };

  return (
    <View style={styles.field}>
      <Text variant="caption" tone="muted">
        {t('requests:form.location')}
      </Text>
      {value ? (
        <Text tone="primary">
          {t('requests:form.selectedPlace', {
            label: value.label ?? t('requests:form.unnamedPlace'),
          })}
        </Text>
      ) : null}
      <Button
        label={t('requests:form.useMyPosition')}
        onPress={() => void locate()}
        loading={busy === 'position'}
        disabled={busy !== null}
        variant="secondary"
      />
      <TextField
        label={t('requests:form.manualAddress')}
        value={address}
        onChangeText={setAddress}
      />
      <Button
        label={t('requests:form.locateAddress')}
        onPress={() => void locateAddress()}
        loading={busy === 'address'}
        disabled={busy !== null || address.trim() === ''}
        variant="secondary"
      />
      {feedback === 'denied' ? (
        <PermissionNotice message={t('requests:form.permissionDenied.location')} />
      ) : null}
      {feedback === 'unavailable' ? (
        <Text tone="danger">{t('requests:form.positionUnavailable')}</Text>
      ) : null}
      {feedback === 'notFound' ? (
        <Text tone="danger">{t('requests:form.addressNotFound')}</Text>
      ) : null}
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
});
