import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as ImagePicker from 'expo-image-picker';

import skills from '@/test/fixtures/profile/skills.json';
import requestCreated from '@/test/fixtures/requests/request-created.json';
import requestValidationError from '@/test/fixtures/requests/request-validation-error.json';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';
import { NewRequestContainer, skillTiles, toRequestPlace } from './NewRequestContainer';

type User = ReturnType<typeof userEvent.setup>;

describe('skillTiles', () => {
  const catalog = [
    { id: '1', slug: 'plomberie-generale', name: 'Plomberie générale', category: 'Plomberie' },
    { id: '2', slug: 'eclairage', name: 'Éclairage', category: 'Électricité' },
  ];

  it('restreint le choix au domaine transmis', () => {
    expect(skillTiles(catalog, 'Plomberie').map((tile) => tile.slug)).toEqual([
      'plomberie-generale',
    ]);
  });

  it('propose tout le catalogue sans domaine ou pour un domaine inconnu', () => {
    expect(skillTiles(catalog)).toHaveLength(2);
    expect(skillTiles(catalog, 'Jardinage')).toHaveLength(2);
  });
});

describe('toRequestPlace', () => {
  it('se replie sur un libellé générique et sur les coordonnées', () => {
    expect(
      toRequestPlace({ latitude: 3.848, longitude: 11.5021, label: null, city: null }, 'ici'),
    ).toEqual({ label: 'ici', detail: '3.8480, 11.5021' });
  });
});

async function setup(domain?: string) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/skills').reply(200, skills);
  const onCreated = jest.fn();
  await renderWithProviders(
    <NewRequestContainer domain={domain} onCreated={onCreated} onBack={jest.fn()} />,
    { api, translations: [requestsTranslations] },
  );
  return { mock, onCreated, user: userEvent.setup() };
}

async function fillUntilSummary(user: User) {
  await user.press(await screen.findByRole('radio', { name: 'Dépannage électrique' }));
  await user.press(screen.getByRole('button', { name: 'Continuer' }));
  await fireEvent.changeText(screen.getByLabelText('Intitulé court'), 'Panne de courant');
  await fireEvent.changeText(
    screen.getByLabelText('Description détaillée'),
    'Plus de courant dans la cuisine depuis ce matin.',
  );
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: 'file:///cache/panne.jpg', width: 1, height: 1 }],
  } as ImagePicker.ImagePickerResult);
  await user.press(screen.getByRole('button', { name: 'Ajouter une photo' }));
  await user.press(screen.getByRole('button', { name: 'Continuer' }));
  await user.press(screen.getByRole('button', { name: 'Me localiser' }));
  await screen.findAllByText('Rue de la démonstration, Yaoundé');
  await user.press(screen.getByRole('button', { name: 'Continuer' }));
}

describe('NewRequestContainer', () => {
  it('envoie la compétence choisie, la position et la photo', async () => {
    const { mock, onCreated, user } = await setup();
    mock.onPost('/requests').reply(201, requestCreated);
    const append = jest.spyOn(FormData.prototype, 'append');
    await fillUntilSummary(user);

    await user.press(screen.getByRole('button', { name: 'Lancer le rapprochement' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(requestCreated.data.id));
    expect(append).toHaveBeenCalledWith('category_slug', 'depannage-electrique');
    expect(append).toHaveBeenCalledWith('city', 'Yaoundé');
    expect(append).toHaveBeenCalledWith(
      'photos[0]',
      expect.objectContaining({ name: 'panne.jpg' }),
    );
    append.mockRestore();
  });

  it('affiche les erreurs de validation renvoyées par le serveur', async () => {
    const { mock, onCreated, user } = await setup();
    mock.onPost('/requests').reply(422, requestValidationError);
    await fillUntilSummary(user);

    await user.press(screen.getByRole('button', { name: 'Lancer le rapprochement' }));

    const first = Object.values(requestValidationError.errors)[0]![0]!;
    expect(await screen.findByText(new RegExp(first.slice(0, 20)))).toBeOnTheScreen();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('ne propose que les compétences du domaine choisi sur l’accueil', async () => {
    await setup('Plomberie');
    expect(await screen.findByRole('radio', { name: 'Plomberie générale' })).toBeOnTheScreen();
    expect(screen.queryByRole('radio', { name: 'Dépannage électrique' })).toBeNull();
  });
});
