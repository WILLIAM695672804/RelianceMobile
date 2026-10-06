import empty from '@/test/fixtures/directory/technicians-empty.json';
import technicians from '@/test/fixtures/directory/technicians.json';

import { technicianPageSchema } from './directorySchemas';

describe('directorySchemas', () => {
  it('lit une page de l’annuaire et convertit les tarifs', () => {
    const page = technicianPageSchema.parse(technicians);

    expect(page.data).toHaveLength(technicians.data.length);
    expect(typeof page.data[0]?.skills[0]?.hourly_rate).toBe('number');
    expect(page.meta?.total).toBe(technicians.meta.total);
  });

  it('accepte une page vide', () => {
    const page = technicianPageSchema.parse(empty);

    expect(page.data).toEqual([]);
    expect(page.meta?.total).toBe(0);
  });
});
