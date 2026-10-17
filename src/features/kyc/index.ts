/**
 * Feature `kyc` — justificatifs d'identité du technicien : état, envoi et
 * rafraîchissement à la décision d'un administrateur (`KycStatusChanged`).
 * @packageDocumentation
 */

export { kycKeys } from './hooks/kycKeys';
export { useKycDocuments, useKycStatusSync, useUploadKycDocument } from './hooks/useKyc';
export { kycTranslations } from './i18n';
export {
  allSubmitted,
  buildKycOverview,
  type KycItem,
  type KycItemStatus,
} from './model/kycOverview';
export { KycScreen, type KycScreenProps } from './screens/KycScreen';
export { KYC_DOCUMENT_TYPES, type KycDocument, type KycDocumentType } from './schemas/kycSchemas';
