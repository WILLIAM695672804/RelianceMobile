import { z } from 'zod';

/** Justificatifs demandés par la plateforme (alignés sur la page web « KYC »). */
export const KYC_DOCUMENT_TYPES = ['cni', 'casier', 'cert', 'photo'] as const;
export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export const KYC_STATUSES = ['pending', 'approved', 'rejected'] as const;

/** Statut connu, ou valeur inconnue tolérée si le backend enrichit l'énumération. */
const statusSchema = z.enum(KYC_STATUSES).or(z.string());

/** Document KYC ; `file_path`, `user_id` et `validated_by` sont écartés. */
export const kycDocumentSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: statusSchema.nullish(),
  rejection_reason: z.string().nullish(),
  url: z.string(),
  created_at: z.string().nullish(),
});
export type KycDocument = z.infer<typeof kycDocumentSchema>;

export const kycDocumentListSchema = z.array(kycDocumentSchema);

export const kycUploadResponseSchema = z.object({
  message: z.string(),
  document: kycDocumentSchema,
});

/** Charge utile de `KycStatusChanged` (canal `user.{id}`). */
export const kycStatusEventSchema = z.object({
  status: statusSchema,
  rejection_reason: z.string().nullish(),
  type: z.literal('kyc_status'),
});
