import type { TranslationResources } from '@/core/i18n';

const fr = {
  feed: {
    title: 'Fil Reliance',
    mine: 'Mon fil',
    explore: 'Découvrir',
    empty: 'Aucune publication pour le moment.',
    emptyMine: 'Votre fil est vide : suivez des techniciens ou publiez.',
    author: '{{name}}',
    unknownAuthor: 'Membre Reliance',
    publishedAt: 'Publié le {{date}}',
    likes: '{{count}} j’aime',
    comments: '{{count}} commentaire(s)',
    like: 'J’aime',
    liked: 'Je n’aime plus',
    likeNamed: '{{action}} la publication de {{name}}',
    open: 'Voir la publication',
    openNamed: 'Voir la publication de {{name}}',
    actionFailed: 'L’opération a échoué. Veuillez réessayer.',
  },
  compose: {
    title: 'Publier',
    content: 'Votre message',
    submit: 'Publier',
    published: 'Publication enregistrée.',
    errors: {
      contentRequired: 'Saisissez un message.',
      contentTooLong: 'Le message ne doit pas dépasser 5000 caractères.',
    },
  },
  comments: {
    title: 'Commentaires',
    empty: 'Aucun commentaire.',
    content: 'Votre commentaire',
    submit: 'Commenter',
    added: 'Commentaire ajouté.',
    failed: 'L’envoi a échoué. Veuillez réessayer.',
    errors: {
      contentRequired: 'Saisissez un commentaire.',
      contentTooLong: 'Le commentaire ne doit pas dépasser 2000 caractères.',
    },
  },
  follow: {
    follow: 'Suivre',
    unfollow: 'Ne plus suivre',
    followNamed: 'Suivre {{name}}',
    unfollowNamed: 'Ne plus suivre {{name}}',
    followers: '{{count}} abonné(s)',
    followed: 'Vous suivez ce compte.',
    unfollowed: 'Vous ne suivez plus ce compte.',
    failed: 'L’opération a échoué. Veuillez réessayer.',
    suggestionsTitle: 'Comptes à suivre',
    suggestionsEmpty: 'Aucune suggestion pour le moment.',
    rating: 'Note : {{rating}} / 5',
  },
};

const en: typeof fr = {
  feed: {
    title: 'Reliance feed',
    mine: 'My feed',
    explore: 'Explore',
    empty: 'No post yet.',
    emptyMine: 'Your feed is empty: follow technicians or publish.',
    author: '{{name}}',
    unknownAuthor: 'Reliance member',
    publishedAt: 'Published on {{date}}',
    likes: '{{count}} like(s)',
    comments: '{{count}} comment(s)',
    like: 'Like',
    liked: 'Unlike',
    likeNamed: '{{action}} the post by {{name}}',
    open: 'View the post',
    openNamed: 'View the post by {{name}}',
    actionFailed: 'The operation failed. Please try again.',
  },
  compose: {
    title: 'Publish',
    content: 'Your message',
    submit: 'Publish',
    published: 'Post saved.',
    errors: {
      contentRequired: 'Enter a message.',
      contentTooLong: 'The message must not exceed 5000 characters.',
    },
  },
  comments: {
    title: 'Comments',
    empty: 'No comment.',
    content: 'Your comment',
    submit: 'Comment',
    added: 'Comment added.',
    failed: 'Sending failed. Please try again.',
    errors: {
      contentRequired: 'Enter a comment.',
      contentTooLong: 'The comment must not exceed 2000 characters.',
    },
  },
  follow: {
    follow: 'Follow',
    unfollow: 'Unfollow',
    followNamed: 'Follow {{name}}',
    unfollowNamed: 'Unfollow {{name}}',
    followers: '{{count}} follower(s)',
    followed: 'You now follow this account.',
    unfollowed: 'You no longer follow this account.',
    failed: 'The operation failed. Please try again.',
    suggestionsTitle: 'Accounts to follow',
    suggestionsEmpty: 'No suggestion for now.',
    rating: 'Rating: {{rating}} / 5',
  },
};

/** Ressources du namespace `social`. */
export const socialTranslations: TranslationResources = {
  fr: { social: fr },
  en: { social: en },
};
