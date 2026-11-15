import { useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { Button, FormTextField, Screen, Text } from '@/shared/components';

import { isMobileMethod, PAYMENT_METHODS, type PaymentMethod } from '../model/transaction';
import type { PaymentPayload } from '../schemas/walletSchemas';

/** Valeurs communes aux deux formulaires de paiement. */
export interface PaymentFormValues {
  amount: string;
  method: PaymentMethod;
  phone: string;
}

export interface PaymentFormProps {
  title: string;
  hint: string;
  submitLabel: string;
  /** Schéma de validation propre à l'opération (recharge ou retrait). */
  resolver: Resolver<PaymentFormValues>;
  /** Conversion des valeurs en corps de requête. */
  toPayload: (values: PaymentFormValues) => PaymentPayload;
  /** Exécution de la demande ; renvoie le message du serveur et le paiement créé. */
  submit: (payload: PaymentPayload) => Promise<{ message: string; payment_id?: string | null }>;
  pending: boolean;
  onDone: () => void;
  /** Paiement en attente de confirmation : prioritaire sur `onDone`. */
  onPending?: (paymentId: string) => void;
}

/** Formulaire de demande de paiement : montant, moyen, téléphone si mobile money. */
export function PaymentForm({
  title,
  hint,
  submitLabel,
  resolver,
  toPayload,
  submit,
  pending,
  onDone,
  onPending,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<PaymentFormValues>({
    resolver,
    defaultValues: { amount: '', method: 'momo', phone: '' },
  });
  const method = useWatch({ control: form.control, name: 'method' });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setNotice(null);
    try {
      const result = await submit(toPayload(values));
      setNotice(t('wallet:forms.initiated', { message: result.message }));
      // Le paiement reste à confirmer auprès de l'opérateur : l'écran de confirmation prend la suite.
      if (onPending && result.payment_id) onPending(result.payment_id);
      else onDone();
    } catch (cause) {
      const appError = normalizeError(cause);
      setError(appError.serverMessage ?? describeError(appError, t));
    }
  });

  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      <Text tone="muted">{hint}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <FormTextField
        control={form.control}
        name="amount"
        label={t('wallet:forms.amount')}
        keyboardType="number-pad"
      />
      <Text variant="caption" tone="muted">
        {t('wallet:forms.method')}
      </Text>
      <View style={styles.methods}>
        {PAYMENT_METHODS.map((option) => {
          const label = t(`wallet:forms.methodLabel.${option}`);
          return (
            <Button
              key={option}
              label={label}
              accessibilityLabel={t('wallet:forms.chooseMethod', { method: label })}
              onPress={() => form.setValue('method', option, { shouldValidate: true })}
              variant={method === option ? 'primary' : 'ghost'}
            />
          );
        })}
      </View>
      {isMobileMethod(method) ? (
        <FormTextField
          control={form.control}
          name="phone"
          label={t('wallet:forms.phone')}
          keyboardType="phone-pad"
        />
      ) : null}
      <Button label={submitLabel} onPress={() => void onSubmit()} loading={pending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  methods: { gap: 8 },
});
