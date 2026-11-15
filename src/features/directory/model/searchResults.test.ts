import searchFixture from '@/test/fixtures/directory/technicians.json';

import { technicianPageSchema } from '../schemas/directorySchemas';

import { highlight, technicianResult } from './searchResults';

const technicians = technicianPageSchema.parse(searchFixture).data;

describe('technicianResult', () => {
  it('projette un technicien capturé en résultat « pro »', () => {
    const first = technicians[0]!;
    const result = technicianResult(first);
    expect(result).toMatchObject({ id: first.id, kind: 'pro', title: first.name });
    if (first.skills[0]) expect(result.subtitle).toContain(first.skills[0].name);
  });

  it('omet les éléments absents de la ligne secondaire', () => {
    const bare = { ...technicians[0]!, skills: [], location: null, rating: null };
    expect(technicianResult(bare).subtitle).toBe('');
  });
});

describe('highlight', () => {
  it('isole chaque occurrence sans tenir compte de la casse', () => {
    expect(highlight('Paul Mvondo', 'paul')).toEqual([
      { text: 'Paul', match: true },
      { text: ' Mvondo', match: false },
    ]);
    expect(highlight('Ana Banana', 'an')).toEqual([
      { text: 'An', match: true },
      { text: 'a B', match: false },
      { text: 'an', match: true },
      { text: 'an', match: true },
      { text: 'a', match: false },
    ]);
  });

  it('rend le texte intact sans recherche ni occurrence', () => {
    expect(highlight('Paul', '  ')).toEqual([{ text: 'Paul', match: false }]);
    expect(highlight('Paul', 'zz')).toEqual([{ text: 'Paul', match: false }]);
  });
});
