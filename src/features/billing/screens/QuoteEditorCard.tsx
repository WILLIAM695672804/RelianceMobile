import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import { Banner, Button, Card, ListRow, SectionLabel, Text } from '@/shared/ui';
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
    <Card padding={16}>
      <View style={{ gap: 14 }}>
        <View style={{ gap: 4 }}>
          <Text variant="section">{t('billing:editor.title')}</Text>
          <Text variant="caption" tone="muted">
            {t('billing:editor.hint')}
          </Text>
        </View>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}

        {lines.length > 0 ? (
          <View>
            {lines.map((line, index) => (
              <ListRow
                key={`${line.label}-${index}`}
                divider={index > 0}
                title={t('billing:quotes.line', {
                  label: line.label,
                  amount: formatAmount(line.amount),
                })}
                trailing={
                  <Button
                    label={t('billing:editor.removeLine', { label: line.label })}
                    accessibilityLabel={t('billing:editor.removeLine', { label: line.label })}
                    variant="ghost"
                    size="sm"
                    onPress={() => removeLine(index)}
                  />
                }
              />
            ))}
            <Text variant="labelStrong" tone="primary" align="right" style={{ marginTop: 6 }}>
              {t('billing:editor.linesTotal', { amount: formatAmount(sumLines(lines)) })}
            </Text>
          </View>
        ) : null}

        <SectionLabel label={t('billing:editor.addLine')} />
        <FormField control={lineForm.control} name="label" label={t('billing:editor.lineLabel')} />
        <FormField
          control={lineForm.control}
          name="amount"
          label={t('billing:editor.lineAmount')}
          keyboardType="number-pad"
        />
        <Button
          label={t('billing:editor.addLine')}
          icon="plus"
          variant="soft"
          full
          onPress={() => void addLine()}
        />

        <FormField
          control={quoteForm.control}
          name="totalAmount"
          label={t('billing:editor.total')}
          icon="wallet"
          keyboardType="number-pad"
        />
        <FormField
          control={quoteForm.control}
          name="validityDays"
          label={t('billing:editor.validity')}
          icon="calendar"
          keyboardType="number-pad"
        />
        <Button
          label={t('billing:editor.saveAndSend')}
          icon="send"
          full
          onPress={() => void save(true)()}
          loading={pending}
        />
        <Button
          label={t('billing:editor.saveDraft')}
          variant="ghost"
          full
          onPress={() => void save(false)()}
          disabled={pending}
        />
      </View>
    </Card>
  );
}
