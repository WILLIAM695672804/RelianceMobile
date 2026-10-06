import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import identity from '@/test/fixtures/technician/identity.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { TechnicianProfileScreen } from './TechnicianProfileScreen';

const NBSP = ' ';

async function setup(reply: [number, unknown] = [200, identity]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technician/profile').reply(...reply);
  await renderWithProviders(<TechnicianProfileScreen />, {
    api,
    translations: [profileTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('TechnicianProfileScreen', () => {
  it('présente le profil et préremplit la présentation', async () => {
    await setup();

    expect(await screen.findByText(identity.data.name)).toBeOnTheScreen();
    expect(screen.getByText('Profil vérifié')).toBeOnTheScreen();
    expect(screen.getByText('Identité en cours de validation')).toBeOnTheScreen();
    expect(screen.getByText('Note : 4,8 / 5 (32 avis)')).toBeOnTheScreen();
    expect(screen.getByText(`Zone d’intervention : Yaounde — 50${NBSP}km`)).toBeOnTheScreen();
    expect(screen.getByText('Compétences déclarées : 5')).toBeOnTheScreen();
    expect(screen.getByLabelText('Présentation')).toHaveDisplayValue(identity.data.bio);
  });

  it('enregistre la présentation et les savoir-faire', async () => {
    const { mock, user } = await setup();
    mock.onPut('/technician/profile').reply(200, identity);
    await screen.findByText(identity.data.name);

    await fireEvent.changeText(screen.getByLabelText('Présentation'), 'Électricien certifié.');
    await fireEvent.changeText(
      screen.getByLabelText('Savoir-faire (séparés par des virgules)'),
      'Mise aux normes, Tableaux',
    );
    await user.press(screen.getByRole('button', { name: 'Enregistrer le profil' }));

    expect(await screen.findByText('Profil professionnel enregistré.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      bio: 'Électricien certifié.',
      competences: ['Mise aux normes', 'Tableaux'],
    });
  });

  it('affiche l’erreur de validation du serveur sous le champ concerné', async () => {
    const { mock, user } = await setup();
    mock.onPut('/technician/profile').reply(422, {
      message: 'Invalide',
      errors: { bio: ['La présentation est trop longue.'], 'competences.0': ['Trop long.'] },
    });
    await screen.findByText(identity.data.name);

    await user.press(screen.getByRole('button', { name: 'Enregistrer le profil' }));

    expect(await screen.findByText('La présentation est trop longue.')).toBeOnTheScreen();
    expect(screen.getByText('Trop long.')).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec de lecture', async () => {
    const { mock, user } = await setup([500, {}]);

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    mock.onGet('/technician/profile').reply(200, identity);
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText(identity.data.name)).toBeOnTheScreen();
  });
});
