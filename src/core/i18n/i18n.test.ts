import { createI18n, resolveLanguage } from './createI18n';
import { en } from './resources/en';
import { fr } from './resources/fr';

function keyPaths(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : keyPaths(value as object, `${prefix}${key}.`),
  );
}

describe('resolveLanguage', () => {
  it.each([
    [['en-US'], 'en'],
    [['de-DE', 'fr-CM'], 'fr'],
    [[null, 'EN'], 'en'],
    [[], 'fr'],
    [['es-ES'], 'fr'],
  ])('résout %j en %s', (tags, expected) => {
    expect(resolveLanguage(tags)).toBe(expected);
  });
});

describe('createI18n', () => {
  it('traduit les ressources du socle en français par défaut', () => {
    const i18n = createI18n();
    expect(i18n.language).toBe('fr');
    expect(i18n.t('errors:network')).toBe('Vérifiez votre connexion.');
    expect(i18n.t('common:actions.retry')).toBe('Réessayer');
  });

  it('traduit en anglais sur demande', () => {
    expect(createI18n([], 'en').t('errors:network')).toBe('Check your connection.');
  });

  it('fusionne les ressources des features', () => {
    const i18n = createI18n(
      [{ fr: { demo: { hello: 'Bonjour' } }, en: { demo: { hello: 'Hello' } } }],
      'en',
    );
    expect(i18n.t('demo:hello')).toBe('Hello');
    expect(i18n.t('errors:server')).toBe('An error occurred. Please try again later.');
  });

  it('maintient des clés identiques en français et en anglais', () => {
    expect(keyPaths(en)).toEqual(keyPaths(fr));
  });
});
