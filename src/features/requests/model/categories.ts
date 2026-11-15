import type { IconName } from '@/shared/ui';

/** Domaine d'intervention proposé au client (maquette `SERVICE_CATEGORIES`). */
export interface ServiceCategory {
  slug: string;
  label: string;
  icon: IconName;
  /** Teinte de la tuile ; à défaut, l'accent du thème. */
  color?: string;
}
