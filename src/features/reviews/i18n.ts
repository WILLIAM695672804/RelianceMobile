import type { TranslationResources } from '@/core/i18n';

const fr = {
  form: {
    title: 'Noter l’intervention',
    hint: 'Votre avis aide les prochains clients à choisir.',
    rating: 'Votre note',
    rate: 'Noter {{value}} sur 5',
    selected: 'Note retenue : {{value}} / 5',
    comment: 'Commentaire (facultatif)',
    submit: 'Envoyer mon avis',
    sent: 'Merci, votre avis est enregistré.',
    errors: {
      ratingRequired: 'Choisissez une note de 1 à 5.',
      commentTooLong: 'Le commentaire ne doit pas dépasser 2000 caractères.',
    },
  },
  mine: {
    title: 'Mes avis',
    empty: 'Aucun avis reçu pour le moment.',
    rating: '{{rating}} / 5',
    author: 'Par {{name}}',
    anonymous: 'Client',
    request: 'Mission : {{title}}',
    receivedAt: 'Reçu le {{date}}',
    reputation: 'Réputation : {{total}} points',
    reputationChange: '{{change}} points — {{reason}}',
    badges: 'Badges obtenus',
    noBadges: 'Aucun badge obtenu.',
  },
};

const en: typeof fr = {
  form: {
    title: 'Rate the job',
    hint: 'Your review helps the next clients choose.',
    rating: 'Your rating',
    rate: 'Rate {{value}} out of 5',
    selected: 'Selected rating: {{value}} / 5',
    comment: 'Comment (optional)',
    submit: 'Send my review',
    sent: 'Thank you, your review is recorded.',
    errors: {
      ratingRequired: 'Choose a rating from 1 to 5.',
      commentTooLong: 'The comment must not exceed 2000 characters.',
    },
  },
  mine: {
    title: 'My reviews',
    empty: 'No review received yet.',
    rating: '{{rating}} / 5',
    author: 'By {{name}}',
    anonymous: 'Client',
    request: 'Job: {{title}}',
    receivedAt: 'Received on {{date}}',
    reputation: 'Reputation: {{total}} points',
    reputationChange: '{{change}} points — {{reason}}',
    badges: 'Badges earned',
    noBadges: 'No badge earned.',
  },
};

/** Ressources du namespace `reviews`. */
export const reviewsTranslations: TranslationResources = {
  fr: { reviews: fr },
  en: { reviews: en },
};
