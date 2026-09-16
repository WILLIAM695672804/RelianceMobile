import { groupSkillsByCategory } from './skillGroups';

describe('groupSkillsByCategory', () => {
  it('regroupe par catégorie, trie catégories et compétences, range les orphelines à part', () => {
    const groups = groupSkillsByCategory(
      [
        { id: '1', slug: 'plomberie-generale', name: 'Plomberie générale', category: 'Plomberie' },
        { id: '2', slug: 'eclairage', name: 'Éclairage / LED', category: 'Électricité' },
        { id: '3', slug: 'debouchage', name: 'Débouchage canalisation', category: 'Plomberie' },
        { id: '4', slug: 'divers', name: 'Divers', category: null },
      ],
      'Autres',
    );

    expect(groups.map((group) => group.category)).toEqual(['Électricité', 'Plomberie', 'Autres']);
    expect(groups[1]?.skills.map((skill) => skill.slug)).toEqual([
      'debouchage',
      'plomberie-generale',
    ]);
  });
});
