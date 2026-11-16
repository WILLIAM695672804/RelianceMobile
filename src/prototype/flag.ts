/**
 * Mode prototype : `EXPO_PUBLIC_PROTOTYPE=1` dans `.env` fait démarrer l'application sur le
 * prototype navigable de la refonte, alimenté par des données d'exemple, sans serveur.
 */
export const PROTOTYPE_ENABLED = process.env.EXPO_PUBLIC_PROTOTYPE === '1';
