import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Text } from '@/shared/components';
import { formatAmount } from '@/shared/format';

import { useCreateQuote, useSendQuote } from '../hooks/useBilling';
import { sumLines } from '../model/quoteStatus';
import {
  quoteFormSchema,
  quoteLineFormSchema,
  toQuoteLine,
  toQuotePayload,
  type QuoteLine,
} from '../schemas/billingSchemas';

/** Validité proposée par défaut, en jours. */
const DEFAULT_VALIDITY_DAYS = '7';

export interface QuoteEditorCardProps {
  requestId: string;
  /** Devis enregistré (brouillon ou envoyé). */
  onSaved?: () => void;
}

/** E16 — Rédaction d'un devis : lignes de détail, total et validité. */
export function QuoteEditorCard({ requestId, onSaved }: QuoteEditorCardProps) {
  const { t } = useTranslation();
  const createQuote = useCreateQuote(requestId);
  const sendQuote = useSendQuote();
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lineForm = useForm({
    resolver: zodResolver(quoteLineFormSchema),
    defaultValues: { label: '', amount: '' },
  });
  const quoteForm = useForm({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: { totalAmount: '', validityDays: DEFAULT_VALIDITY_DAYS },
  });

  const addLine = lineForm.handleSubmit((values) => {
    setNotice(null);
    setError(null);
    const next = [...lines, toQuoteLine(values)];
    setLines(next);
    quoteForm.setValue('totalAmount', String(sumLines(next)), { shouldValidate: true });
    lineForm.reset();
  });

  const removeLine = (index: number) => {
    const next = lines.filter((_, position) => position !== index);
    setLines(next);
    quoteForm.setValue('totalAmount', next.length > 0 ? String(sumLines(next)) : '', {
      shouldValidate: next.length > 0,
    });
  };

  const save = (send: boolean) =>
    quoteForm.handleSubmit(async (values) => {
      setNotice(null);
      setError(null);
      try {
        const quote = await createQuote.mutateAsync(toQuotePayload(requestId, values, lines));
        if (send) {
          await sendQuote.mutateAsync(quote.id);
          setNotice(t('billing:quotes.sent'));
        } else {
          setNotice(t('billing:editor.draftSaved'));
        }
        setLines([]);
        quoteForm.reset({ totalAmount: '', validityDays: DEFAULT_VALIDITY_DAYS });
        onSaved?.();
      } catch (cause) {
        setError(describeError(normalizeError(cause), t));
      }
    });

  const pending = createQuote.isPending || sendQuote.isPending;

  return (
    <Card>
      <Text variant="subtitle">{t('billing:editor.title')}</Text>
      <Text variant="caption" tone="muted">
        {t('billing:editor.hint')}
      </Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}

      {lines.map((line, index) => (
        <View key={`${line.label}-${index}`} style={styles.line}>
          <Text>
            {t('billing:quotes.line', { label: line.label, amount: formatAmount(line.amount) })}
          </Text>
          <Button
            label={t('billing:editor.removeLine', { label: line.label })}
            accessibilityLabel={t('billing:editor.removeLine', { label: line.label })}
            onPress={() => removeLine(index)}
            variant="ghost"
          />
        </View>
      ))}
      {lines.length > 0 ? (
        <Text tone="muted">
          {t('billing:editor.linesTotal', { amount: formatAmount(sumLines(lines)) })}
        </Text>
      ) : null}

      <FormTextField
        control={lineForm.control}
        name="label"
        label={t('billing:editor.lineLabel')}
      />
      <FormTextField
        control={lineForm.control}
        name="amount"
        label={t('billing:editor.lineAmount')}
        keyboardType="number-pad"
      />
      <Button
        label={t('billing:editor.addLine')}
        onPress={() => void addLine()}
        variant="secondary"
      />

      <FormTextField
        control={quoteForm.control}
        name="totalAmount"
        label={t('billing:editor.total')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={quoteForm.control}
        name="validityDays"
        label={t('billing:editor.validity')}
        keyboardType="number-pad"
      />
      <Button
        label={t('billing:editor.saveAndSend')}
        onPress={() => void save(true)()}
        loading={pending}
      />
      <Button
        label={t('billing:editor.saveDraft')}
        onPress={() => void save(false)()}
        disabled={pending}
        variant="secondary"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  line: { gap: 4 },
});
