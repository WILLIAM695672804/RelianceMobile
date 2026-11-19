import type { TranslationResources } from '@/core/i18n';

/** Textes repris à l'identique de la version web (`RelianceFrontend/src/pages/Legal.tsx`). */
const fr = {
  updated: 'Dernière mise à jour : mai 2026.',
  links: {
    terms: 'CGU',
    privacy: 'Confidentialité',
    separator: '·',
  },
  terms: {
    short: 'Conditions d’utilisation',
    title: 'Conditions générales d’utilisation',
    intro:
      'Les présentes conditions régissent l’utilisation de la plateforme Reliance, mettant en relation des clients et des techniciens certifiés.',
    sections: {
      '0': {
        title: '1. Objet',
        body: 'Reliance fournit une plateforme de mise en relation et de gestion d’interventions techniques. L’inscription vaut acceptation des présentes conditions.',
      },
      '1': {
        title: '2. Compte utilisateur',
        body: 'Chaque utilisateur est responsable de l’exactitude des informations fournies et de la confidentialité de ses identifiants.',
      },
      '2': {
        title: '3. Paiements',
        body: 'Les paiements et recharges de portefeuille sont opérés via des prestataires sécurisés. Les fonds en séquestre sont libérés à la validation de l’intervention.',
      },
      '3': {
        title: '4. Responsabilités',
        body: 'Reliance agit en qualité d’intermédiaire. La qualité des prestations relève des techniciens, soumis à un processus de vérification (KYC).',
      },
      '4': {
        title: '5. Résiliation',
        body: 'Tout compte peut être suspendu en cas de non-respect des présentes conditions.',
      },
    },
  },
  privacy: {
    short: 'Confidentialité',
    title: 'Politique de confidentialité',
    intro:
      'Reliance accorde une importance primordiale à la protection de vos données personnelles.',
    sections: {
      '0': {
        title: '1. Données collectées',
        body: 'Nous collectons les informations de compte (nom, adresse électronique, téléphone), de localisation (pour le rapprochement) et de transaction (pour le portefeuille).',
      },
      '1': {
        title: '2. Utilisation',
        body: 'Vos données servent à fournir le service : mise en relation, paiements, notifications et amélioration de la plateforme.',
      },
      '2': {
        title: '3. Partage',
        body: 'Vos données ne sont jamais vendues. Elles peuvent être partagées avec les techniciens concernés par une intervention et nos prestataires de paiement.',
      },
      '3': {
        title: '4. Sécurité',
        body: 'Les mots de passe sont chiffrés et l’authentification peut être renforcée par la double authentification.',
      },
      '4': {
        title: '5. Vos droits',
        body: 'Vous pouvez accéder à vos données, les rectifier ou les supprimer en nous contactant via la page Contact du site Reliance.',
      },
    },
  },
};

const en: typeof fr = {
  updated: 'Last updated: May 2026.',
  links: { terms: 'Terms', privacy: 'Privacy', separator: '·' },
  terms: {
    short: 'Terms of use',
    title: 'Terms of use',
    intro:
      'These terms govern the use of the Reliance platform, which connects clients with certified technicians.',
    sections: {
      '0': {
        title: '1. Purpose',
        body: 'Reliance provides a platform for connecting people and managing technical jobs. Signing up implies acceptance of these terms.',
      },
      '1': {
        title: '2. User account',
        body: 'Each user is responsible for the accuracy of the information provided and for keeping their credentials confidential.',
      },
      '2': {
        title: '3. Payments',
        body: 'Payments and wallet top-ups are handled by secure providers. Funds held in escrow are released once the job is validated.',
      },
      '3': {
        title: '4. Liability',
        body: 'Reliance acts as an intermediary. The quality of services is the responsibility of technicians, who go through a verification process (KYC).',
      },
      '4': {
        title: '5. Termination',
        body: 'Any account may be suspended if these terms are not respected.',
      },
    },
  },
  privacy: {
    short: 'Privacy',
    title: 'Privacy policy',
    intro: 'Reliance attaches the utmost importance to protecting your personal data.',
    sections: {
      '0': {
        title: '1. Data collected',
        body: 'We collect account information (name, email address, phone), location (for matching) and transactions (for the wallet).',
      },
      '1': {
        title: '2. Use',
        body: 'Your data is used to provide the service: matching, payments, notifications and improving the platform.',
      },
      '2': {
        title: '3. Sharing',
        body: 'Your data is never sold. It may be shared with the technicians involved in a job and with our payment providers.',
      },
      '3': {
        title: '4. Security',
        body: 'Passwords are encrypted and sign-in can be strengthened with two-factor authentication.',
      },
      '4': {
        title: '5. Your rights',
        body: 'You can access, correct or delete your data by contacting us through the Contact page of the Reliance website.',
      },
    },
  },
};

/** Ressources du namespace `legal`. */
export const legalTranslations: TranslationResources = { fr: { legal: fr }, en: { legal: en } };
