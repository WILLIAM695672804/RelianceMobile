import { createMemoryStore } from '@/core/storage';

import { createSearchHistory, HISTORY_LIMIT } from './searchHistory';

describe('createSearchHistory', () => {
  it('est vide au départ', () => {
    expect(createSearchHistory(createMemoryStore()).read()).toEqual([]);
  });

  it('place la recherche la plus récente en tête', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('plombier');
    history.remember('électricien');

    expect(history.read()).toEqual(['électricien', 'plombier']);
  });

  it('ne garde qu’une occurrence par terme', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('plombier');
    history.remember('électricien');
    history.remember('plombier');

    expect(history.read()).toEqual(['plombier', 'électricien']);
  });

  it('borne l’historique', () => {
    const history = createSearchHistory(createMemoryStore());
    for (let index = 0; index <= HISTORY_LIMIT; index += 1) history.remember(`terme ${index}`);

    expect(history.read()).toHaveLength(HISTORY_LIMIT);
  });

  it('ignore une recherche vide', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('   ');

    expect(history.read()).toEqual([]);
  });

  it('oublie un terme et se purge', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('plombier');
    history.remember('électricien');
    history.forget('plombier');

    expect(history.read()).toEqual(['électricien']);

    history.clear();
    expect(history.read()).toEqual([]);
  });

  it('survit à un nouveau démarrage', () => {
    const store = createMemoryStore();
    createSearchHistory(store).remember('caméra');

    expect(createSearchHistory(store).read()).toEqual(['caméra']);
  });

  it('purge une valeur illisible', () => {
    const store = createMemoryStore();
    store.set('directory.search.history', '{ pas du JSON');

    expect(createSearchHistory(store).read()).toEqual([]);
  });
});
