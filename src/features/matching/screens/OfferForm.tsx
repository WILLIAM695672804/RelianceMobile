import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { Button, FormTextField, Text } from '@/shared/components';
import { formatAmount } from '@/shared/format';

import { useSelectTechnician } from '../hooks/useMatching';
import { offerFormSchema, toOfferPayload } from '../schemas/matchingSchemas';

export interface OfferFormProps {
  requestId: string;
  technicianId: string;
  /** Prix indicatif de l'analyse de la demande. */
  suggestedPrice: number | null;
  onSent: () => void;
}

/** Offre adressée au technicien choisi : prix (prérempli) et message facultatif. */
export function OfferForm({ requestId, technicianId, suggestedPrice, onSent }: OfferFormProps) {
  const { t } = useTranslation();
  const selectTechnician = useSelectTechnician(requestId);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      price: suggestedPrice != null ? String(Math.round(suggestedPrice)) : '',
      message: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await selectTechnician.mutateAsync(toOfferPayload(technicianId, values));
      onSent();
    } catch (error) {
      const appError = normalizeError(error);
      // L'identifiant du technicien n'est pas un champ du formulaire : son erreur est affichée en tête.
      const technicianError = appError.fieldErrors.technician_id?.[0];
      if (technicianError) setFormError(technicianError);
      else if (!applyServerErrors(form.setError, appError)) {
        setFormError(describeError(appError, t));
      }
    }
  });

  return (
    <>
      <Text variant="subtitle">{t('matching:offer.yourOffer')}</Text>
      {suggestedPrice != null ? (
        <Text tone="muted">
          {t('matching:offer.suggestedPrice', { amount: formatAmount(suggestedPrice) })}
        </Text>
      ) : null}
      {formError ? <Text tone="danger">{formError}</Text> : null}
      <FormTextField
        control={form.control}
        name="price"
        label={t('matching:offer.price')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={form.control}
        name="message"
        label={t('matching:offer.message')}
        multiline
      />
      <Button
        label={t('matching:offer.submit')}
        onPress={() => void onSubmit()}
        loading={selectTechnician.isPending}
      />
    </>
  );
}
