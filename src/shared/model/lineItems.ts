/** Ligne chiffrée d'un diagnostic, d'un devis ou d'une facture. */
export interface LineItem {
  label: string;
  /** Précision sous le libellé (« Pièce détachée », « 45 min · forfait »). */
  detail?: string;
  quantity: number;
  /** Prix unitaire, en FCFA. */
  unitPrice: number;
}

export interface Totals {
  subtotal: number;
  /** Frais de plateforme ; 0 lorsqu'ils ne s'appliquent pas. */
  fee: number;
  total: number;
}

/** Sous-total, frais (taux appliqué au sous-total, arrondi à l'unité) et total. */
export function totalsOf(lines: readonly LineItem[], feeRate = 0): Totals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const fee = Math.round(subtotal * feeRate);
  return { subtotal, fee, total: subtotal + fee };
}
