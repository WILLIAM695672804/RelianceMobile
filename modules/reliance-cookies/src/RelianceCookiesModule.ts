import { NativeModule, requireNativeModule } from 'expo';

declare class RelianceCookiesModule extends NativeModule {
  /** Valeur brute du cookie `name` applicable à `url`, ou `null`. */
  getCookieValue(url: string, name: string): Promise<string | null>;
  /** Écrit sans délai les cookies sur disque (Android) ; sans effet sur iOS. */
  flush(): Promise<void>;
  /** Supprime tous les cookies de la pile réseau. */
  clearAll(): Promise<void>;
}

export default requireNativeModule<RelianceCookiesModule>('RelianceCookies');
