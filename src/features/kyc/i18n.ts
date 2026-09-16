import type { TranslationResources } from '@/core/i18n';

const fr = {
  title: 'Justificatifs d’identité',
  hint: 'Transmettez chaque justificatif : un administrateur les vérifie avant d’activer votre profil.',
  types: {
    cni: 'Carte nationale d’identité',
    casier: 'Extrait de casier judiciaire',
    cert: 'Certificats professionnels',
    photo: 'Photo portrait',
  },
  statuses: {
    missing: 'À fournir',
    pending: 'En cours de vérification',
    approved: 'Validé',
    rejected: 'Refusé',
  },
  rejectionReason: 'Motif : {{reason}}',
  fromCamera: 'Photographier',
  fromLibrary: 'Choisir une image',
  uploaded: 'Justificatif envoyé.',
  permissionDenied: 'Autorisation refusée : activez-la dans les réglages de l’appareil.',
};

const en: typeof fr = {
  title: 'Identity documents',
  hint: 'Submit each document: an administrator reviews them before activating your profile.',
  types: {
    cni: 'National identity card',
    casier: 'Criminal record extract',
    cert: 'Professional certificates',
    photo: 'Portrait photo',
  },
  statuses: {
    missing: 'Required',
    pending: 'Under review',
    approved: 'Approved',
    rejected: 'Rejected',
  },
  rejectionReason: 'Reason: {{reason}}',
  fromCamera: 'Take a photo',
  fromLibrary: 'Choose an image',
  uploaded: 'Document sent.',
  permissionDenied: 'Permission denied: enable it in the device settings.',
};

/** Ressources du namespace `kyc`. */
export const kycTranslations: TranslationResources = { fr: { kyc: fr }, en: { kyc: en } };
