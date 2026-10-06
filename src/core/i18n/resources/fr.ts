/** Ressources françaises du socle (namespaces `common` et `errors`). */
export const fr = {
  common: {
    appName: 'Reliance',
    actions: {
      retry: 'Réessayer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      back: 'Retour',
      logout: 'Se déconnecter',
    },
    states: {
      loading: 'Chargement…',
      empty: 'Aucun élément à afficher.',
    },
    offline: {
      banner: 'Vous êtes hors ligne. Certaines fonctionnalités sont limitées.',
    },
    session: {
      expired: 'Votre session a expiré. Veuillez vous reconnecter.',
      checkConnection: 'Vérifiez votre connexion.',
      webOnly: 'Cet espace est réservé à la plateforme web.',
      unknownRole: 'Votre rôle n’est pas reconnu par l’application mobile.',
    },
    navigation: {
      home: 'Accueil',
      activity: 'Activité',
      directory: 'Annuaire',
      account: 'Compte',
    },
    roles: {
      client: 'Client',
      technicien: 'Technicien',
      agence: 'Agence',
      admin: 'Administrateur',
      unknown: 'Rôle inconnu',
    },
    placeholder: {
      upcoming: 'Écran prévu dans un lot ultérieur.',
    },
    home: {
      greeting: 'Bonjour, {{name}}',
    },
  },
  errors: {
    network: 'Vérifiez votre connexion.',
    timeout: 'Le serveur met trop de temps à répondre. Vérifiez votre connexion.',
    unauthenticated: 'Votre session a expiré. Veuillez vous reconnecter.',
    forbidden: 'Vous n’êtes pas autorisé à effectuer cette action.',
    emailNotVerified: 'Votre adresse électronique n’est pas vérifiée.',
    twoFactorRequired: 'Un code de double authentification est requis.',
    notFound: 'Élément introuvable.',
    csrf: 'La requête a expiré. Veuillez réessayer.',
    validation: 'Certaines informations sont invalides.',
    rateLimited: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
    server: 'Une erreur est survenue. Veuillez réessayer ultérieurement.',
    contract: 'Réponse inattendue du serveur.',
    unknown: 'Une erreur inattendue est survenue.',
  },
};
