import type { TranslationResources } from '@/core/i18n';

const fr = {
  open: {
    title: 'Ouvrir un litige',
    secured:
      'Vos fonds sont sécurisés : tant que le litige n’est pas résolu, le paiement reste bloqué dans le séquestre Reliance.',
    missionHeld: '{{reference}} · {{amount}} en séquestre',
    reason: 'Motif du litige',
    details: 'Décrivez la situation',
    detailsPlaceholder: 'Soyez précis : que s’est-il passé ?',
    evidence: 'Preuves photos',
    add: 'Ajouter',
    addEvidence: 'Ajouter une preuve',
    removeEvidence: 'Retirer la preuve {{number}}',
    notice:
      'En soumettant, vous acceptez la médiation Reliance. Les fausses déclarations entraînent la suspension du compte.',
    cancel: 'Annuler',
    submit: 'Ouvrir le litige',
  },
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
  reasonHints: {
    work_not_done: 'Le problème persiste ou n’est pas résolu',
    quality: 'Malfaçon, casse ou détérioration pendant l’intervention',
    delay: 'En retard ou absent au rendez-vous',
    amount: 'Montant non conforme au devis',
    behaviour: 'Attitude ou propos déplacés',
    other: 'Décrivez votre situation',
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
  open: {
    title: 'Open a dispute',
    secured:
      'Your funds are safe: until the dispute is resolved, the payment stays held in the Reliance escrow.',
    missionHeld: '{{reference}} · {{amount}} in escrow',
    reason: 'Reason',
    details: 'Describe the situation',
    detailsPlaceholder: 'Be specific: what happened?',
    evidence: 'Photo evidence',
    add: 'Add',
    addEvidence: 'Add evidence',
    removeEvidence: 'Remove evidence {{number}}',
    notice:
      'By submitting, you accept Reliance mediation. False statements lead to account suspension.',
    cancel: 'Cancel',
    submit: 'Open the dispute',
  },
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
  reasonHints: {
    work_not_done: 'The problem persists or is not solved',
    quality: 'Poor workmanship, breakage or damage during the job',
    delay: 'Late or absent for the appointment',
    amount: 'Amount does not match the quote',
    behaviour: 'Inappropriate attitude or language',
    other: 'Describe your situation',
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
