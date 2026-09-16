/** Espace insécable : séparateur de milliers et d'unité en typographie française. */
const NBSP = ' ';

const pad = (value: number) => value.toString().padStart(2, '0');

/** Montant en francs CFA, arrondi à l'unité : « 15 000 FCFA ». */
export function formatAmount(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${rounded < 0 ? '-' : ''}${digits}${NBSP}FCFA`;
}

/** Distance : mètres sous le kilomètre, sinon kilomètres à une décimale. */
export function formatDistance(kilometres: number): string {
  if (kilometres < 1) return `${Math.round(kilometres * 1000)}${NBSP}m`;
  const rounded = Math.round(kilometres * 10) / 10;
  return `${rounded.toString().replace('.', ',')}${NBSP}km`;
}

/** Note sur 5 à une décimale : « 4,8 ». */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ',');
}

/** Date locale jour/mois/année ; chaîne vide si la date est illisible. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
