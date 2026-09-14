import { AppError } from '@/core/errors';

const XSRF_COOKIE = 'XSRF-TOKEN';

/** Accès aux cookies de la pile réseau native. */
export interface CookieReader {
  /** Valeur brute (encodée URL) du cookie `name` pour `url`. */
  get(url: string, name: string): Promise<string | undefined>;
  clearAll(): Promise<void>;
}

/** Fournit le jeton `X-XSRF-TOKEN` des requêtes d'écriture. */
export interface CsrfManager {
  getToken(): Promise<string>;
  /** Oublie la mémorisation de `/sanctum/csrf-cookie` (après une 419 ou une déconnexion). */
  invalidate(): void;
}

export interface CsrfManagerDeps {
  apiUrl: string;
  fetchCsrfCookie: () => Promise<void>;
  cookies: CookieReader;
}

/**
 * Crée le gestionnaire CSRF Sanctum : un seul appel mémorisé à `/sanctum/csrf-cookie`,
 * lecture du cookie `XSRF-TOKEN` à chaque requête, une relance si le cookie est absent.
 */
export function createCsrfManager({
  apiUrl,
  fetchCsrfCookie,
  cookies,
}: CsrfManagerDeps): CsrfManager {
  let pending: Promise<void> | null = null;

  const ensureCookie = (): Promise<void> => {
    if (!pending) {
      pending = fetchCsrfCookie().catch((error: unknown) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };

  const readToken = async (): Promise<string | undefined> => {
    const raw = await cookies.get(apiUrl, XSRF_COOKIE);
    return raw ? decodeURIComponent(raw) : undefined;
  };

  return {
    async getToken() {
      await ensureCookie();
      let token = await readToken();
      if (!token) {
        pending = null;
        await ensureCookie();
        token = await readToken();
      }
      if (!token) throw new AppError({ kind: 'csrf' });
      return token;
    },
    invalidate() {
      pending = null;
    },
  };
}
