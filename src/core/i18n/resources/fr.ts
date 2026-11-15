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
    filters: {
      all: 'Tous',
    },
    toast: {
      close: 'Fermer la notification',
    },
    search: {
      clear: 'Effacer la recherche',
    },
    field: {
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
    },
    session: {
      expired: 'Votre session a expiré. Veuillez vous reconnecter.',
      checkConnection: 'Vérifiez votre connexion.',
      webOnly: 'Cet espace est réservé à la plateforme web.',
      webOnlyTitle: 'Espace réservé au web',
      openWeb: 'Ouvrir la plateforme web',
      unknownRole: 'Votre rôle n’est pas reconnu par l’application mobile.',
    },
    navigation: {
      home: 'Accueil',
      agency: 'Agence',
      mission: 'Mission',
      tracking: 'Suivi',
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
    states: {
      offlineTitle: 'Pas de connexion',
      offlineBody:
        'Reliance ne peut pas joindre ses serveurs. Vérifiez vos données mobiles ou votre Wi-Fi. Vos actions en attente seront envoyées dès le retour du réseau.',
      serverTitle: 'Quelque chose a cassé',
      limitTitle: 'Trop de demandes',
      limitAction: 'D’accord, je patiente',
      genericTitle: 'Chargement impossible',
      retry: 'Réessayer',
      support: 'Contacter le support',
    },
  },
};
