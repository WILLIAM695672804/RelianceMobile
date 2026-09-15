import { NativeModule, requireNativeModule } from 'expo';

declare class RelianceCookiesModule extends NativeModule {
  /** Valeur brute du cookie `name` applicable à `url`, ou `null`. */
  getCookieValue(url: string, name: string): Promise<string | null>;
  /** Supprime tous les cookies de la pile réseau. */
  clearAll(): Promise<void>;
}

export default requireNativeModule<RelianceCookiesModule>('RelianceCookies');
