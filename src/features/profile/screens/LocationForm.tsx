import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Text } from '@/shared/components';

import { useCreateLocation } from '../hooks/useLocations';
import { locationFormSchema, toLocationPayload } from '../schemas/profileSchemas';

export interface LocationFormProps {
  /** Appelé après l'enregistrement ou l'abandon. */
  onClose: () => void;
}

/** Saisie d'une nouvelle adresse. */
export function LocationForm({ onClose }: LocationFormProps) {
  const { t } = useTranslation();
  const createLocation = useCreateLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(locationFormSchema),
    defaultValues: { label: '', address: '', city: '', is_default: false },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createLocation.mutateAsync(toLocationPayload(values));
      onClose();
    } catch (error) {
      const appError = normalizeError(error);
      if (!applyServerErrors(form.setError, appError)) setFormError(describeError(appError, t));
    }
  });

  return (
    <Card>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      <FormTextField control={form.control} name="label" label={t('profile:locations.label')} />
      <FormTextField
        control={form.control}
        name="address"
        label={t('profile:locations.address')}
        autoComplete="street-address"
      />
      <FormTextField control={form.control} name="city" label={t('profile:locations.city')} />
      <Controller
        control={form.control}
        name="is_default"
        render={({ field }) => (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('profile:locations.makeDefault')}</Text>
            <Switch
              accessibilityLabel={t('profile:locations.makeDefault')}
              value={field.value}
              onValueChange={field.onChange}
            />
          </View>
        )}
      />
      <Button
        label={t('profile:locations.submit')}
        onPress={() => void onSubmit()}
        loading={createLocation.isPending}
      />
      <Button label={t('common:actions.cancel')} onPress={onClose} variant="ghost" />
    </Card>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { flex: 1 },
});
