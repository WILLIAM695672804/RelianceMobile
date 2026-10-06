import type { TranslationResources } from '@/core/i18n';

const fr = {
  title: 'Annuaire des techniciens',
  searchLabel: 'Rechercher un technicien',
  submit: 'Rechercher',
  nearby: 'Autour de moi',
  nearbyActive: 'Autour de moi : activé',
  nearbyOff: 'Tout le pays',
  permissionDenied: 'Autorisation de localisation refusée.',
  openSettings: 'Ouvrir les réglages',
  positionUnavailable: 'Position indisponible. Réessayez à l’extérieur.',
  count: '{{count}} technicien(s) trouvé(s)',
  empty: 'Aucun technicien ne correspond à votre recherche.',
  verified: 'Vérifié',
  rating: 'Note : {{rating}} / 5 ({{count}} avis)',
  distance: 'Distance : {{distance}}',
  city: 'Ville : {{city}}',
  skills: 'Compétences : {{skills}}',
  fromRate: 'À partir de {{amount}} de l’heure',
  open: 'Voir le profil',
  profileTitle: 'Profil du technicien',
};

const en: typeof fr = {
  title: 'Technician directory',
  searchLabel: 'Search for a technician',
  submit: 'Search',
  nearby: 'Near me',
  nearbyActive: 'Near me: on',
  nearbyOff: 'Whole country',
  permissionDenied: 'Location permission denied.',
  openSettings: 'Open settings',
  positionUnavailable: 'Position unavailable. Try again outdoors.',
  count: '{{count}} technician(s) found',
  empty: 'No technician matches your search.',
  verified: 'Verified',
  rating: 'Rating: {{rating}} / 5 ({{count}} reviews)',
  distance: 'Distance: {{distance}}',
  city: 'City: {{city}}',
  skills: 'Skills: {{skills}}',
  fromRate: 'From {{amount}} per hour',
  open: 'View profile',
  profileTitle: 'Technician profile',
};

/** Ressources du namespace `directory`. */
export const directoryTranslations: TranslationResources = {
  fr: { directory: fr },
  en: { directory: en },
};
