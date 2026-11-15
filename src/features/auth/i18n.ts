import type { TranslationResources } from '@/core/i18n';

const fr = {
  onboarding: {
    slides: {
      '0': {
        title: 'Trouvez le bon technicien',
        body: 'Plomberie, électricité, sécurité, climatisation : des professionnels vérifiés près de chez vous.',
      },
      '1': {
        title: 'Paiement sécurisé par séquestre',
        body: 'Votre argent reste gelé jusqu’à la validation de l’intervention. Aucune avance non protégée.',
      },
      '2': {
        title: 'Suivez chaque intervention',
        body: 'Diagnostic, devis, intervention, facture : tout est tracé dans l’application.',
      },
    },
    next: 'Suivant',
    start: 'Commencer',
    skip: 'Passer',
  },
  login: {
    title: 'Connexion',
    subtitle: 'Accédez à votre espace Reliance.',
    email: 'Adresse électronique',
    password: 'Mot de passe',
    submit: 'Se connecter',
    forgotPassword: 'Mot de passe oublié ?',
    register: 'Créer un compte',
    invalidCredentials: 'Adresse électronique ou mot de passe incorrect.',
    accountDisabled: 'Votre compte est désactivé. Contactez le support.',
    twoFactorTitle: 'Vérification en deux étapes',
    twoFactorHint: 'Saisissez le code à six chiffres de votre application d’authentification.',
    twoFactorCode: 'Code de vérification',
    twoFactorSubmit: 'Vérifier',
    twoFactorInvalid: 'Code de vérification invalide.',
  },
  register: {
    title: 'Créer un compte',
    role: 'Type de compte',
    roles: { client: 'Client', technicien: 'Technicien', agence: 'Agence' },
    name: 'Nom complet',
    email: 'Adresse électronique',
    phone: 'Téléphone (facultatif)',
    password: 'Mot de passe',
    passwordConfirmation: 'Confirmation du mot de passe',
    agencyName: 'Nom de l’agence',
    address: 'Adresse (facultative)',
    description: 'Description (facultative)',
    bio: 'Présentation (facultative)',
    submit: 'Créer mon compte',
    haveAccount: 'J’ai déjà un compte',
  },
  forgotPassword: {
    title: 'Mot de passe oublié',
    hint: 'Saisissez votre adresse électronique : un lien de réinitialisation vous sera envoyé.',
    email: 'Adresse électronique',
    submit: 'Envoyer le lien',
    sent: 'Un lien de réinitialisation vient d’être envoyé à votre adresse électronique.',
    back: 'Retour à la connexion',
  },
  validation: {
    required: 'Ce champ est obligatoire.',
    email: 'Adresse électronique invalide.',
    passwordLength: 'Le mot de passe doit contenir au moins 8 caractères.',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    tooLong: 'Valeur trop longue.',
    twoFactorCode: 'Le code doit comporter six chiffres.',
  },
};

const en: typeof fr = {
  onboarding: {
    slides: {
      '0': {
        title: 'Find the right technician',
        body: 'Plumbing, electricity, security, air conditioning: vetted professionals close to you.',
      },
      '1': {
        title: 'Escrow-secured payment',
        body: 'Your money stays on hold until the job is validated. No unprotected advance.',
      },
      '2': {
        title: 'Follow every job',
        body: 'Diagnosis, quote, job, invoice: everything is tracked in the application.',
      },
    },
    next: 'Next',
    start: 'Get started',
    skip: 'Skip',
  },
  login: {
    title: 'Sign in',
    subtitle: 'Access your Reliance space.',
    email: 'Email address',
    password: 'Password',
    submit: 'Sign in',
    forgotPassword: 'Forgot password?',
    register: 'Create an account',
    invalidCredentials: 'Incorrect email address or password.',
    accountDisabled: 'Your account is disabled. Please contact support.',
    twoFactorTitle: 'Two-step verification',
    twoFactorHint: 'Enter the six-digit code from your authenticator app.',
    twoFactorCode: 'Verification code',
    twoFactorSubmit: 'Verify',
    twoFactorInvalid: 'Invalid verification code.',
  },
  register: {
    title: 'Create an account',
    role: 'Account type',
    roles: { client: 'Customer', technicien: 'Technician', agence: 'Agency' },
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone (optional)',
    password: 'Password',
    passwordConfirmation: 'Confirm password',
    agencyName: 'Agency name',
    address: 'Address (optional)',
    description: 'Description (optional)',
    bio: 'About you (optional)',
    submit: 'Create my account',
    haveAccount: 'I already have an account',
  },
  forgotPassword: {
    title: 'Forgot password',
    hint: 'Enter your email address and we will send you a reset link.',
    email: 'Email address',
    submit: 'Send the link',
    sent: 'A reset link has just been sent to your email address.',
    back: 'Back to sign in',
  },
  validation: {
    required: 'This field is required.',
    email: 'Invalid email address.',
    passwordLength: 'The password must contain at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
    tooLong: 'Value too long.',
    twoFactorCode: 'The code must contain six digits.',
  },
};

/** Ressources du namespace `auth`. */
export const authTranslations: TranslationResources = { fr: { auth: fr }, en: { auth: en } };
