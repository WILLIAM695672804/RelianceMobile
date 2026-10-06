import type { TranslationResources } from '@/core/i18n';

const fr = {
  list: {
    title: 'Messagerie',
    empty: 'Aucune conversation.',
    fallbackTitle: 'Discussion',
    unread: '{{count}} non lu(s)',
    noMessage: 'Aucun message échangé.',
    lastMessage: '{{sender}} : {{body}}',
    open: 'Ouvrir la conversation',
    openNamed: 'Ouvrir : {{title}}',
    totalUnread: '{{count}} message(s) non lu(s)',
  },
  thread: {
    title: 'Conversation',
    empty: 'Démarrez la conversation.',
    me: 'Moi',
    unknownSender: 'Interlocuteur',
    sentAt: '{{time}}',
    body: 'Votre message',
    send: 'Envoyer',
    sendFailed: 'L’envoi a échoué. Veuillez réessayer.',
    errors: {
      bodyRequired: 'Saisissez un message.',
      bodyTooLong: 'Le message ne doit pas dépasser 5000 caractères.',
    },
  },
  start: {
    title: 'Ouverture de la conversation…',
    failed: 'Impossible d’ouvrir la conversation.',
    retry: 'Réessayer',
  },
};

const en: typeof fr = {
  list: {
    title: 'Messages',
    empty: 'No conversation.',
    fallbackTitle: 'Conversation',
    unread: '{{count}} unread',
    noMessage: 'No message exchanged.',
    lastMessage: '{{sender}}: {{body}}',
    open: 'Open the conversation',
    openNamed: 'Open: {{title}}',
    totalUnread: '{{count}} unread message(s)',
  },
  thread: {
    title: 'Conversation',
    empty: 'Start the conversation.',
    me: 'Me',
    unknownSender: 'Participant',
    sentAt: '{{time}}',
    body: 'Your message',
    send: 'Send',
    sendFailed: 'Sending failed. Please try again.',
    errors: {
      bodyRequired: 'Enter a message.',
      bodyTooLong: 'The message must not exceed 5000 characters.',
    },
  },
  start: {
    title: 'Opening the conversation…',
    failed: 'The conversation could not be opened.',
    retry: 'Retry',
  },
};

/** Ressources du namespace `chat`. */
export const chatTranslations: TranslationResources = {
  fr: { chat: fr },
  en: { chat: en },
};
