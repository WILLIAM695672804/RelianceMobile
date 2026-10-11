import { FALLBACK_CATEGORY_ICON, iconForCategory } from './categoryIcons';

describe('iconForCategory', () => {
  it.each([
    ['Plomberie', 'wrench'],
    ['Électricité', 'bolt'],
    ['Sécurité', 'camera'],
    ['Informatique', 'laptop'],
    ['Électronique', 'plug'],
    ['Mécanique', 'cog'],
    ['Climatisation', 'sun'],
    ['Bâtiment', 'home'],
  ])('associe %s à l’icône %s', (category, icon) => {
    expect(iconForCategory(category)).toBe(icon);
  });

  it('ignore la casse et les diacritiques', () => {
    expect(iconForCategory('ELECTRICITE')).toBe('bolt');
    expect(iconForCategory('  plomberie ')).toBe('wrench');
  });

  it('retombe sur l’icône générique pour un domaine inconnu ou absent', () => {
    expect(iconForCategory('Espaces verts')).toBe(FALLBACK_CATEGORY_ICON);
    expect(iconForCategory(null)).toBe(FALLBACK_CATEGORY_ICON);
    expect(iconForCategory(undefined)).toBe(FALLBACK_CATEGORY_ICON);
  });
});
