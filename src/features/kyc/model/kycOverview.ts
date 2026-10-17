import { KYC_DOCUMENT_TYPES, type KycDocument, type KycDocumentType } from '../schemas/kycSchemas';

export type KycItemStatus = 'missing' | 'pending' | 'approved' | 'rejected';

export interface KycItem {
  type: KycDocumentType;
  status: KycItemStatus;
  rejectionReason: string | null;
  document: KycDocument | null;
}

const createdAt = (document: KycDocument) =>
  document.created_at ? Date.parse(document.created_at) : 0;

/**
 * Synthèse par justificatif attendu : le document le plus récent de chaque type fait foi.
 * Un statut absent ou inconnu vaut « en attente » ; les types non suivis sont ignorés.
 */
export function buildKycOverview(documents: readonly KycDocument[]): KycItem[] {
  return KYC_DOCUMENT_TYPES.map((type) => {
    const latest = documents
      .filter((document) => document.type === type)
      .sort((a, b) => createdAt(b) - createdAt(a))[0];
    if (!latest) return { type, status: 'missing', rejectionReason: null, document: null };
    const status =
      latest.status === 'approved' || latest.status === 'rejected' ? latest.status : 'pending';
    return {
      type,
      status,
      rejectionReason: status === 'rejected' ? (latest.rejection_reason ?? null) : null,
      document: latest,
    };
  });
}

/** Vrai lorsqu'aucune pièce ne manque ni n'est refusée : le parcours peut se poursuivre. */
export function allSubmitted(documents: readonly KycDocument[]): boolean {
  return buildKycOverview(documents).every(
    (item) => item.status === 'pending' || item.status === 'approved',
  );
}
