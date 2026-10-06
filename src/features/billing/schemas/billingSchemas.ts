import { z } from 'zod';

import { decimalSchema } from '@/core/api';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/** Ligne de détail d'un devis (JSON libre côté serveur). */
export const quoteLineSchema = z.object({ label: z.string(), amount: decimalSchema });
export type QuoteLine = z.infer<typeof quoteLineSchema>;

/** Devis (`QuoteResource`). */
export const quoteSchema = z.object({
  id: z.string(),
  request_id: z.string(),
  issuer_id: z.string().nullish(),
  issuer: z.object({ id: z.string(), name: z.string() }).nullish(),
  total_amount: decimalSchema,
  breakdown: z.array(quoteLineSchema).nullish().transform(asList),
  status: z.string(),
  valid_until: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type Quote = z.infer<typeof quoteSchema>;

export const quoteResponseSchema = z.object({ data: quoteSchema });
export const quoteListResponseSchema = z.object({ data: z.array(quoteSchema) });

export const quoteAcceptedResponseSchema = z.object({
  message: z.string(),
  data: z.object({ quote: quoteSchema, invoice_id: z.string() }),
});

/** Facture (`InvoiceResource`). */
export const invoiceSchema = z.object({
  id: z.string(),
  quote_id: z.string().nullish(),
  client_id: z.string().nullish(),
  issuer_id: z.string().nullish(),
  client: z.object({ id: z.string(), name: z.string() }).nullish(),
  issuer: z.object({ id: z.string(), name: z.string() }).nullish(),
  amount: decimalSchema,
  tax_amount: decimalSchema.nullish(),
  reference: z.string().nullish(),
  status: z.string(),
  created_at: z.string().nullish(),
});
export type Invoice = z.infer<typeof invoiceSchema>;

export const invoiceResponseSchema = z.object({ data: invoiceSchema });

export const invoicePageSchema = z.object({
  data: z.array(invoiceSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

export const VALIDITY_MIN_DAYS = 1;
export const VALIDITY_MAX_DAYS = 90;

const wholeAmount = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, message);

/** Formulaire d'une ligne de détail. */
export const quoteLineFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'billing:editor.errors.labelRequired')
    .max(120, 'billing:editor.errors.labelTooLong'),
  amount: wholeAmount('billing:editor.errors.amountInvalid'),
});
export type QuoteLineFormValues = z.infer<typeof quoteLineFormSchema>;

export function toQuoteLine(values: QuoteLineFormValues): QuoteLine {
  return { label: values.label.trim(), amount: Number(values.amount) };
}

/** Formulaire du devis : total et validité exprimée en jours. */
export const quoteFormSchema = z.object({
  totalAmount: wholeAmount('billing:editor.errors.totalInvalid'),
  validityDays: wholeAmount('billing:editor.errors.validityInvalid').refine(
    (value): boolean => Number(value) <= VALIDITY_MAX_DAYS,
    'billing:editor.errors.validityTooLong',
  ),
});
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

/** Corps de `POST /quotes`. */
export interface QuotePayload {
  requestId: string;
  totalAmount: number;
  breakdown: QuoteLine[] | null;
  validUntil: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Date d'échéance au format `AAAA-MM-JJ`, calculée en temps universel. */
function addDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function toQuotePayload(
  requestId: string,
  values: QuoteFormValues,
  lines: QuoteLine[],
  now: Date = new Date(),
): QuotePayload {
  return {
    requestId,
    totalAmount: Number(values.totalAmount),
    breakdown: lines.length > 0 ? lines : null,
    validUntil: addDays(now, Number(values.validityDays)),
  };
}
