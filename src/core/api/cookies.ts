import RelianceCookies from '../../../modules/reliance-cookies';

import type { CookieReader } from './csrf';

/** Lecture des cookies partagés avec la pile réseau native (module `modules/reliance-cookies`). */
export const nativeCookieReader: CookieReader = {
  async get(url, name) {
    return (await RelianceCookies.getCookieValue(url, name)) ?? undefined;
  },
  async flush() {
    await RelianceCookies.flush();
  },
  async clearAll() {
    await RelianceCookies.clearAll();
  },
};
