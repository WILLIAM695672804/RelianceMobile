import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import { Banner, Button, Card, SwitchRow } from '@/shared/ui';

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
    <Card padding={16}>
      <View style={{ gap: 14 }}>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        <FormField
          control={form.control}
          name="label"
          label={t('profile:locations.label')}
          icon="bookmark"
        />
        <FormField
          control={form.control}
          name="address"
          label={t('profile:locations.address')}
          icon="pin"
          autoComplete="street-address"
        />
        <FormField
          control={form.control}
          name="city"
          label={t('profile:locations.city')}
          icon="location"
        />
        <Controller
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <SwitchRow
              label={t('profile:locations.makeDefault')}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Button
          label={t('profile:locations.submit')}
          full
          onPress={() => void onSubmit()}
          loading={createLocation.isPending}
        />
        <Button label={t('common:actions.cancel')} variant="ghost" full onPress={onClose} />
      </View>
    </Card>
  );
}
