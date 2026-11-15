import type { TranslationResources } from '@/core/i18n';

const fr = {
  statuses: {
    open: 'Ouvert',
    in_review: 'En examen',
    resolved: 'Résolu',
    closed: 'Clos',
  },
  reasons: {
    work_not_done: 'Travail non réalisé',
    quality: 'Qualité insuffisante',
    delay: 'Retard excessif',
    amount: 'Montant contesté',
    behaviour: 'Comportement inapproprié',
    other: 'Autre motif',
  },
  list: {
    title: 'Mes litiges',
    empty: 'Aucun litige ouvert.',
    openedAt: 'Ouvert le {{date}}',
    against: 'Contre {{name}}',
    open: 'Ouvrir le litige {{reason}}',
  },
  form: {
    title: 'Signaler un problème',
    hint: 'Décrivez le problème : la médiation examinera votre dossier.',
    reason: 'Motif',
    description: 'Description',
    submit: 'Ouvrir le litige',
    submitted: 'Litige ouvert. La médiation vous répondra dans le fil.',
    errors: {
      reasonRequired: 'Choisissez un motif.',
      descriptionRequired: 'Décrivez le problème rencontré.',
      descriptionTooLong: 'La description est trop longue.',
    },
  },
  thread: {
    title: 'Litige',
    resolution: 'Décision : {{resolution}}',
    closed: 'Ce litige est clos : aucun message ne peut plus y être ajouté.',
    message: 'Votre message',
    send: 'Envoyer',
    sent: 'Message ajouté au dossier.',
    me: 'Moi',
    unknownSender: 'Médiation',
    sentAt: 'à {{time}}',
    empty: 'Aucun message dans ce dossier.',
    errors: {
      messageRequired: 'Saisissez un message.',
      messageTooLong: 'Le message est trop long.',
    },
  },
};

const en: typeof fr = {
  statuses: {
    open: 'Open',
    in_review: 'Under review',
    resolved: 'Resolved',
    closed: 'Closed',
  },
  reasons: {
    work_not_done: 'Work not done',
    quality: 'Poor quality',
    delay: 'Excessive delay',
    amount: 'Disputed amount',
    behaviour: 'Inappropriate behaviour',
    other: 'Other reason',
  },
  list: {
    title: 'My disputes',
    empty: 'No open dispute.',
    openedAt: 'Opened on {{date}}',
    against: 'Against {{name}}',
    open: 'Open the dispute {{reason}}',
  },
  form: {
    title: 'Report a problem',
    hint: 'Describe the problem: mediation will review your case.',
    reason: 'Reason',
    description: 'Description',
    submit: 'Open the dispute',
    submitted: 'Dispute opened. Mediation will answer in the thread.',
    errors: {
      reasonRequired: 'Choose a reason.',
      descriptionRequired: 'Describe the problem.',
      descriptionTooLong: 'The description is too long.',
    },
  },
  thread: {
    title: 'Dispute',
    resolution: 'Decision: {{resolution}}',
    closed: 'This dispute is closed: no further message can be added.',
    message: 'Your message',
    send: 'Send',
    sent: 'Message added to the case.',
    me: 'Me',
    unknownSender: 'Mediation',
    sentAt: 'at {{time}}',
    empty: 'No message in this case.',
    errors: {
      messageRequired: 'Enter a message.',
      messageTooLong: 'The message is too long.',
    },
  },
};

/** Ressources du namespace `disputes`. */
export const disputesTranslations: TranslationResources = {
  fr: { disputes: fr },
  en: { disputes: en },
};
