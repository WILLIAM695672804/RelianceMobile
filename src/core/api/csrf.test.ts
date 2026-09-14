import { createCsrfManager, type CookieReader } from './csrf';

const API_URL = 'http://api.test';

/** Simule le cookie : chaque lecture consomme une valeur, la dernière est conservée. */
function fakeCookies(values: (string | undefined)[]) {
  const queue = [...values];
  const get = jest.fn(async (_url: string, _name: string) =>
    queue.length > 1 ? queue.shift() : queue[0],
  );
  const reader: CookieReader = { get, clearAll: jest.fn(async () => undefined) };
  return { reader, get };
}

describe('createCsrfManager', () => {
  it('mémorise l’appel à csrf-cookie et décode le jeton', async () => {
    const fetchCsrfCookie = jest.fn(async () => undefined);
    const { reader, get } = fakeCookies(['abc%3D']);
    const csrf = createCsrfManager({ apiUrl: API_URL, fetchCsrfCookie, cookies: reader });

    await expect(csrf.getToken()).resolves.toBe('abc=');
    await expect(csrf.getToken()).resolves.toBe('abc=');
    expect(fetchCsrfCookie).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(API_URL, 'XSRF-TOKEN');
  });

  it('relit le cookie à chaque appel (rotation par le serveur)', async () => {
    const { reader } = fakeCookies(['t1', 't2']);
    const csrf = createCsrfManager({
      apiUrl: API_URL,
      fetchCsrfCookie: async () => undefined,
      cookies: reader,
    });

    await expect(csrf.getToken()).resolves.toBe('t1');
    await expect(csrf.getToken()).resolves.toBe('t2');
  });

  it('relance une fois csrf-cookie si le cookie est absent', async () => {
    const fetchCsrfCookie = jest.fn(async () => undefined);
    const { reader } = fakeCookies([undefined, 'jeton']);
    const csrf = createCsrfManager({ apiUrl: API_URL, fetchCsrfCookie, cookies: reader });

    await expect(csrf.getToken()).resolves.toBe('jeton');
    expect(fetchCsrfCookie).toHaveBeenCalledTimes(2);
  });

  it('échoue en AppError csrf si le cookie reste absent', async () => {
    const fetchCsrfCookie = jest.fn(async () => undefined);
    const { reader } = fakeCookies([undefined]);
    const csrf = createCsrfManager({ apiUrl: API_URL, fetchCsrfCookie, cookies: reader });

    await expect(csrf.getToken()).rejects.toMatchObject({ kind: 'csrf' });
    expect(fetchCsrfCookie).toHaveBeenCalledTimes(2);
  });

  it('invalidate force un nouvel appel à csrf-cookie', async () => {
    const fetchCsrfCookie = jest.fn(async () => undefined);
    const { reader } = fakeCookies(['jeton']);
    const csrf = createCsrfManager({ apiUrl: API_URL, fetchCsrfCookie, cookies: reader });

    await csrf.getToken();
    csrf.invalidate();
    await csrf.getToken();
    expect(fetchCsrfCookie).toHaveBeenCalledTimes(2);
  });

  it('ne mémorise pas un appel en échec', async () => {
    const fetchCsrfCookie = jest
      .fn<Promise<void>, []>()
      .mockRejectedValueOnce(new Error('réseau'))
      .mockResolvedValueOnce(undefined);
    const { reader } = fakeCookies(['jeton']);
    const csrf = createCsrfManager({ apiUrl: API_URL, fetchCsrfCookie, cookies: reader });

    await expect(csrf.getToken()).rejects.toThrow('réseau');
    await expect(csrf.getToken()).resolves.toBe('jeton');
    expect(fetchCsrfCookie).toHaveBeenCalledTimes(2);
  });
});
