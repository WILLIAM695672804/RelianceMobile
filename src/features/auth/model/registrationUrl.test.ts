import { registrationUrl } from './registrationUrl';

describe('registrationUrl', () => {
  it('compose le parcours web du rôle', () => {
    expect(registrationUrl('https://reliance.cm', 'technicien')).toBe(
      'https://reliance.cm/inscription/technicien',
    );
  });

  it('renvoie null sans application web configurée', () => {
    expect(registrationUrl(null, 'client')).toBeNull();
  });
});
