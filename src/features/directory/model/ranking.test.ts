import type { TechnicianCard } from '../schemas/directorySchemas';
import { rankTechnicians } from './ranking';

const card = (id: string, rating: number | null, reviews: number | null): TechnicianCard =>
  ({ id, name: id, rating, num_reviews: reviews, skills: [], verified: true }) as TechnicianCard;

describe('rankTechnicians', () => {
  it('ordonne par note décroissante', () => {
    const ranked = rankTechnicians([card('a', 4.2, 10), card('b', 4.9, 3)]);

    expect(ranked.map((entry) => entry.technician.id)).toEqual(['b', 'a']);
  });

  it('départage par nombre d’avis', () => {
    const ranked = rankTechnicians([card('a', 4.5, 2), card('b', 4.5, 9)]);

    expect(ranked.map((entry) => entry.technician.id)).toEqual(['b', 'a']);
  });

  it('relègue les techniciens sans note', () => {
    const ranked = rankTechnicians([card('a', null, 0), card('b', 3.1, 1)]);

    expect(ranked.map((entry) => entry.technician.id)).toEqual(['b', 'a']);
  });

  it('numérote les rangs à partir de 1', () => {
    expect(rankTechnicians([card('a', 5, 1), card('b', 4, 1)]).map((e) => e.rank)).toEqual([1, 2]);
  });

  it('laisse la liste d’origine intacte', () => {
    const source = [card('a', 4, 1), card('b', 5, 1)];
    rankTechnicians(source);

    expect(source.map((entry) => entry.id)).toEqual(['a', 'b']);
  });
});
