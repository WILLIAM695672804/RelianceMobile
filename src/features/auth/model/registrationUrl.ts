import type { RegistrableRole } from '../schemas/authSchemas';

/**
 * Adresse de l'inscription web pour un rôle (`/inscription/<rôle>` côté RelianceFrontend).
 * @returns `null` si l'application web n'est pas configurée.
 */
export function registrationUrl(webUrl: string | null, role: RegistrableRole): string | null {
  return webUrl ? `${webUrl}/inscription/${role}` : null;
}
