import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as ImagePicker from 'expo-image-picker';

import skills from '@/test/fixtures/profile/skills.json';
import requestCreated from '@/test/fixtures/requests/request-created.json';
import requestValidationError from '@/test/fixtures/requests/request-validation-error.json';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';
import { NewRequestScreen } from './NewRequestScreen';

type User = ReturnType<typeof userEvent.setup>;

async function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/skills').reply(200, skills);
  const onCreated = jest.fn();
  const onCancel = jest.fn();
  await renderWithProviders(<NewRequestScreen onCreated={onCreated} onCancel={onCancel} />, {
    api,
    translations: [requestsTranslations],
  });
  return { mock, onCreated, onCancel, user: userEvent.setup() };
}

async function fillValidForm(user: User) {
  await user.press(screen.getByRole('button', { name: 'Choisir une catégorie' }));
  await user.press(await screen.findByRole('button', { name: 'Dépannage électrique' }));
  await fireEvent.changeText(screen.getByLabelText('Intitulé'), 'Panne de courant');
  await fireEvent.changeText(
    screen.getByLabelText('Description du problème'),
    'Plus de courant dans la cuisine depuis ce matin.',
  );
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: 'file:///cache/panne.jpg', width: 1, height: 1 }],
  } as ImagePicker.ImagePickerResult);
  await user.press(screen.getByRole('button', { name: 'Ajouter depuis la galerie' }));
  await screen.findByRole('button', { name: 'Retirer la photo 1' });
  await user.press(screen.getByRole('button', { name: 'Utiliser ma position' }));
  await screen.findByText('Position retenue : Rue de la démonstration, Yaoundé');
}

describe('NewRequestScreen (E10)', () => {
  it('met en évidence les champs invalides sans rien envoyer', async () => {
    const { mock, user } = await setup();

    await user.press(screen.getByRole('button', { name: 'Envoyer la demande' }));

    expect(await screen.findByText('Choisissez une catégorie.')).toBeOnTheScreen();
    expect(screen.getByText('Indiquez un intitulé.')).toBeOnTheScreen();
    expect(
      screen.getByText('La description doit compter au moins 20 caractères.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Ajoutez au moins une photo.')).toBeOnTheScreen();
    expect(screen.getByText('Indiquez la localisation de l’intervention.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('envoie la demande complète puis transmet son identifiant', async () => {
    const { mock, onCreated, user } = await setup();
    mock.onPost('/requests').reply(201, requestCreated);
    await fillValidForm(user);
    expect(screen.getByText('48 / 1000 caractères')).toBeOnTheScreen();
    const append = jest.spyOn(FormData.prototype, 'append');

    await user.press(screen.getByRole('button', { name: 'Envoyer la demande' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(requestCreated.data.id));
    expect(append).toHaveBeenCalledWith('category_slug', 'depannage-electrique');
    expect(append).toHaveBeenCalledWith('latitude', '3.848');
    expect(append).toHaveBeenCalledWith('city', 'Yaoundé');
    expect(append).toHaveBeenCalledWith('photos[0]', {
      uri: 'file:///cache/panne.jpg',
      name: 'panne.jpg',
      type: 'image/jpeg',
    });
    append.mockRestore();
  });

  it('conserve la saisie et signale l’échec de l’envoi', async () => {
    const { mock, onCreated, user } = await setup();
    mock.onPost('/requests').reply(500);
    await fillValidForm(user);

    await user.press(screen.getByRole('button', { name: 'Envoyer la demande' }));

    expect(await screen.findByText('L’envoi a échoué. Veuillez réessayer.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Intitulé')).toHaveDisplayValue('Panne de courant');
    expect(screen.getByRole('button', { name: 'Retirer la photo 1' })).toBeOnTheScreen();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('rattache les erreurs de validation du serveur aux champs', async () => {
    const { mock, user } = await setup();
    mock.onPost('/requests').reply(422, requestValidationError);
    await fillValidForm(user);

    await user.press(screen.getByRole('button', { name: 'Envoyer la demande' }));

    expect(await screen.findByText(requestValidationError.errors.title[0] ?? '')).toBeOnTheScreen();
    expect(screen.getByText(requestValidationError.errors.latitude[0] ?? '')).toBeOnTheScreen();
  });

  it('demande confirmation avant d’abandonner une saisie', async () => {
    const { onCancel, user } = await setup();
    await fireEvent.changeText(screen.getByLabelText('Intitulé'), 'Panne');

    await user.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(
      screen.getByText('Vous allez perdre les informations saisies. Continuer ?'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Poursuivre la saisie' }));
    expect(onCancel).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Annuler' }));
    await user.press(screen.getByRole('button', { name: 'Abandonner' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('quitte sans confirmation un formulaire vierge', async () => {
    const { onCancel, user } = await setup();

    await user.press(screen.getByRole('button', { name: 'Annuler' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('affiche la jauge d’avancement du formulaire', async () => {
    await setup();

    const bars = screen.getAllByTestId(/^new-request-steps-bar-/);
    expect(bars).toHaveLength(4);
    expect(screen.getByTestId('new-request-steps').props.accessibilityValue).toEqual({
      min: 1,
      max: 4,
      now: 1,
    });
  });
});
