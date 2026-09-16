import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { LocationsScreen } from './LocationsScreen';

const home = { id: 'l1', label: 'Maison', address: 'Rue 1', city: 'Douala', is_default: true };
const office = { id: 'l2', label: 'Bureau', address: 'Rue 2', city: null, is_default: false };

async function setup(locations: unknown[] = [home, office]) {
  const providers = await renderWithProviders(<LocationsScreen />, {
    translations: [profileTranslations],
  });
  const mock = new MockAdapter(providers.api);
  mock.onGet('/locations').reply(200, locations);
  await providers.queryClient.invalidateQueries();
  return { ...providers, mock, user: userEvent.setup() };
}

describe('LocationsScreen', () => {
  it('liste les adresses et distingue l’adresse par défaut', async () => {
    await setup();

    expect(await screen.findByText('Maison')).toBeOnTheScreen();
    expect(screen.getByText('Rue 1, Douala')).toBeOnTheScreen();
    expect(screen.getByText('Par défaut')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Définir par défaut : Bureau' })).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Définir par défaut : Maison' }),
    ).not.toBeOnTheScreen();
  });

  it('annonce l’absence d’adresse', async () => {
    await setup([]);
    expect(await screen.findByText('Aucune adresse enregistrée.')).toBeOnTheScreen();
  });

  it('définit l’adresse par défaut puis recharge la liste', async () => {
    const { mock, user } = await setup();
    mock.onPatch('/locations/l2/default').reply(200, { message: 'Adresse par défaut mise à jour' });

    await user.press(await screen.findByRole('button', { name: 'Définir par défaut : Bureau' }));

    await waitFor(() => expect(mock.history.get.length).toBeGreaterThanOrEqual(2));
    expect(mock.history.patch).toHaveLength(1);
  });

  it('supprime une adresse après confirmation', async () => {
    const { mock, user } = await setup();
    mock.onDelete('/locations/l2').reply(200, { message: 'Adresse supprimée' });

    await user.press(await screen.findByRole('button', { name: 'Supprimer : Bureau' }));
    expect(
      screen.getByText('L’adresse « Bureau » sera définitivement supprimée.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  });

  it('ajoute une adresse', async () => {
    const { mock, user } = await setup();
    mock.onPost('/locations').reply(201, {
      message: 'Adresse ajoutée avec succès',
      location: { id: 'l3', label: 'Atelier', address: 'Rue 3', city: null, is_default: true },
    });

    await user.press(await screen.findByRole('button', { name: 'Ajouter une adresse' }));
    await fireEvent.changeText(screen.getByLabelText('Libellé'), 'Atelier');
    await fireEvent.changeText(screen.getByLabelText('Adresse'), 'Rue 3');
    await fireEvent(screen.getByLabelText('Adresse par défaut'), 'valueChange', true);
    await user.press(screen.getByRole('button', { name: 'Enregistrer l’adresse' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      label: 'Atelier',
      address: 'Rue 3',
      is_default: true,
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Ajouter une adresse' })).toBeOnTheScreen(),
    );
  });

  it('affiche l’échec d’une action', async () => {
    const { mock, user } = await setup();
    mock.onPatch('/locations/l2/default').reply(500);

    await user.press(await screen.findByRole('button', { name: 'Définir par défaut : Bureau' }));

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
  });
});
