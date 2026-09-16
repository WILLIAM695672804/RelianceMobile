import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch, type FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { Button, ConfirmDialog, FormTextField, Screen, Text } from '@/shared/components';

import { useCreateRequest } from '../hooks/useRequests';
import {
  DESCRIPTION_MAX_LENGTH,
  mapRequestFieldErrors,
  requestFormSchema,
  toCreateRequestPayload,
  type RequestFormField,
} from '../schemas/requestSchemas';
import { CategoryField } from './CategoryField';
import { PhotoField } from './PhotoField';
import { PlaceField } from './PlaceField';

export interface NewRequestScreenProps {
  /** Demande créée : ouverture du rapprochement. */
  onCreated: (requestId: string) => void;
  /** Abandon confirmé (ou formulaire vierge). */
  onCancel: () => void;
}

/** E10 — Création d'une demande d'intervention. */
export function NewRequestScreen({ onCreated, onCancel }: NewRequestScreenProps) {
  const { t } = useTranslation();
  const createRequest = useCreateRequest();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const form = useForm({
    resolver: zodResolver(requestFormSchema),
    defaultValues: { categorySlug: '', title: '', description: '', photos: [], place: null },
  });
  const description = useWatch({ control: form.control, name: 'description' });
  const { isDirty } = form.formState;

  const messageOf = (error: FieldError | undefined) => {
    if (!error?.message) return undefined;
    return error.type === 'server' ? error.message : t(error.message);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await createRequest.mutateAsync(toCreateRequestPayload(values));
      onCreated(created.id);
    } catch (error) {
      const appError = normalizeError(error);
      const fieldErrors = Object.entries(mapRequestFieldErrors(appError.fieldErrors)) as [
        RequestFormField,
        string,
      ][];
      for (const [field, message] of fieldErrors) {
        form.setError(field, { type: 'server', message });
      }
      if (fieldErrors.length === 0) {
        setFormError(
          appError.kind === 'validation'
            ? describeError(appError, t)
            : t('requests:form.sendFailed'),
        );
      }
    }
  });

  const requestCancel = () => {
    if (isDirty) setConfirmingCancel(true);
    else onCancel();
  };

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {t('requests:form.title')}
      </Text>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      <Controller
        control={form.control}
        name="categorySlug"
        render={({ field, fieldState }) => (
          <CategoryField
            value={field.value}
            onChange={field.onChange}
            error={messageOf(fieldState.error)}
          />
        )}
      />
      <FormTextField control={form.control} name="title" label={t('requests:form.requestTitle')} />
      <FormTextField
        control={form.control}
        name="description"
        label={t('requests:form.description')}
        multiline
      />
      <Text variant="caption" tone="muted">
        {t('requests:form.descriptionCounter', {
          count: description.trim().length,
          max: DESCRIPTION_MAX_LENGTH,
        })}
      </Text>
      <Controller
        control={form.control}
        name="photos"
        render={({ field, fieldState }) => (
          <PhotoField
            value={field.value}
            onChange={field.onChange}
            error={messageOf(fieldState.error)}
          />
        )}
      />
      <Controller
        control={form.control}
        name="place"
        render={({ field, fieldState }) => (
          <PlaceField
            value={field.value}
            onChange={field.onChange}
            error={messageOf(fieldState.error)}
          />
        )}
      />
      <Button
        label={t('requests:form.submit')}
        onPress={() => void onSubmit()}
        loading={createRequest.isPending}
      />
      <Button
        label={t('requests:form.cancel')}
        onPress={requestCancel}
        disabled={createRequest.isPending}
        variant="ghost"
      />
      <ConfirmDialog
        visible={confirmingCancel}
        title={t('requests:form.cancelTitle')}
        message={t('requests:form.cancelMessage')}
        confirmLabel={t('requests:form.discard')}
        cancelLabel={t('requests:form.keepEditing')}
        onConfirm={() => {
          setConfirmingCancel(false);
          onCancel();
        }}
        onCancel={() => setConfirmingCancel(false)}
      />
    </Screen>
  );
}
