import {
  columnsFor,
  gutterFor,
  maxContentWidthFor,
  sizeClassOf,
  typeScaleFor,
  SIZE_CLASSES,
} from './breakpoints';

describe('sizeClassOf', () => {
  it('classe les téléphones d’entrée de gamme en compact', () => {
    expect(sizeClassOf(320)).toBe('compact');
    expect(sizeClassOf(359)).toBe('compact');
  });

  it('classe les téléphones courants en medium', () => {
    expect(sizeClassOf(360)).toBe('medium');
    expect(sizeClassOf(412)).toBe('medium');
    expect(sizeClassOf(599)).toBe('medium');
  });

  it('classe les tablettes en expanded puis large', () => {
    expect(sizeClassOf(600)).toBe('expanded');
    expect(sizeClassOf(839)).toBe('expanded');
    expect(sizeClassOf(840)).toBe('large');
    expect(sizeClassOf(1280)).toBe('large');
  });

  it('couvre les quatre classes', () => {
    expect(SIZE_CLASSES).toEqual(['compact', 'medium', 'expanded', 'large']);
  });
});

describe('gutterFor', () => {
  it('élargit la gouttière avec la classe de taille', () => {
    expect(gutterFor('compact')).toBe(12);
    expect(gutterFor('medium')).toBe(16);
    expect(gutterFor('expanded')).toBe(24);
    expect(gutterFor('large')).toBe(32);
  });
});

describe('columnsFor', () => {
  it('déduit le nombre de colonnes de la largeur utile et de la largeur minimale de tuile', () => {
    expect(columnsFor(320, 100, 12)).toBe(2);
    expect(columnsFor(412, 100, 12)).toBe(3);
    expect(columnsFor(800, 100, 12)).toBe(7);
  });

  it('rend toujours au moins une colonne', () => {
    expect(columnsFor(80, 200, 12)).toBe(1);
  });

  it('respecte un plafond lorsqu’il est fourni', () => {
    expect(columnsFor(1280, 100, 12, 4)).toBe(4);
  });
});

describe('maxContentWidthFor', () => {
  it('ne borne pas les téléphones et borne les grands écrans', () => {
    expect(maxContentWidthFor('compact')).toBeUndefined();
    expect(maxContentWidthFor('medium')).toBeUndefined();
    expect(maxContentWidthFor('expanded')).toBe(640);
    expect(maxContentWidthFor('large')).toBe(720);
  });
});

describe('typeScaleFor', () => {
  it('réduit sur les petits écrans et agrandit sur les grands', () => {
    expect(typeScaleFor('compact')).toBeLessThan(1);
    expect(typeScaleFor('medium')).toBe(1);
    expect(typeScaleFor('expanded')).toBeGreaterThan(1);
    expect(typeScaleFor('large')).toBeGreaterThan(typeScaleFor('expanded'));
  });
});
