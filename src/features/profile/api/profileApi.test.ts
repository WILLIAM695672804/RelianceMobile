import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import avatarUpdated from '@/test/fixtures/profile/avatar-updated.json';
import locationCreated from '@/test/fixtures/profile/location-created.json';
import locationDeleted from '@/test/fixtures/profile/location-deleted.json';
import locations from '@/test/fixtures/profile/locations.json';
import profileUpdated from '@/test/fixtures/profile/profile-updated.json';

import {
  changePassword,
  createLocation,
  deleteLocation,
  fetchLocations,
  requestUpgrade,
  setDefaultLocation,
  updateProfile,
  uploadAvatar,
} from './profileApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

const body = (data: unknown) => JSON.parse(data as string) as unknown;

describe('profileApi', () => {
  it('updateProfile envoie les champs modifiés et renvoie l’utilisateur', async () => {
    const { client, mock } = setup();
    mock.onPut('/auth/profile').reply(200, profileUpdated);

    const user = await updateProfile(client, { name: 'Technicien Démo' });

    expect(user.email).toBe('technicien@example.test');
    expect(body(mock.history.put[0]?.data)).toEqual({ name: 'Technicien Démo' });
  });

  it('changePassword renvoie le message du serveur', async () => {
    const { client, mock } = setup();
    mock
      .onPut('/auth/profile/password')
      .reply(200, { message: 'Mot de passe modifié avec succès.' });

    await expect(
      changePassword(client, {
        current_password: 'ancien-mdp',
        new_password: 'nouveau-mdp',
        new_password_confirmation: 'nouveau-mdp',
      }),
    ).resolves.toBe('Mot de passe modifié avec succès.');
  });

  it('uploadAvatar envoie un formulaire multipart', async () => {
    const { client, mock } = setup();
    mock.onPost('/auth/profile/avatar').reply(200, avatarUpdated);
    const append = jest.spyOn(FormData.prototype, 'append');

    const url = await uploadAvatar(client, {
      uri: 'file:///cache/a.png',
      name: 'a.png',
      type: 'image/png',
    });

    expect(url).toBe(avatarUpdated.avatar_url);
    expect(append).toHaveBeenCalledWith('avatar', {
      uri: 'file:///cache/a.png',
      name: 'a.png',
      type: 'image/png',
    });
    expect(mock.history.post[0]?.headers?.['Content-Type']).toBe('multipart/form-data');
    append.mockRestore();
  });

  it('gère les adresses', async () => {
    const { client, mock } = setup();
    const id = locationCreated.location.id;
    mock.onGet('/locations').reply(200, locations);
    mock.onPost('/locations').reply(201, locationCreated);
    mock.onDelete(`/locations/${id}`).reply(200, locationDeleted);
    mock
      .onPatch(`/locations/${id}/default`)
      .reply(200, { message: 'Adresse par défaut mise à jour' });

    await expect(fetchLocations(client)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id })]),
    );
    await expect(
      createLocation(client, { label: 'Capture', address: 'Rue 1', is_default: false }),
    ).resolves.toMatchObject({ id, label: 'Capture' });
    await expect(setDefaultLocation(client, id)).resolves.toBe('Adresse par défaut mise à jour');
    await expect(deleteLocation(client, id)).resolves.toBe('Adresse supprimée');
  });

  it('requestUpgrade transmet la motivation', async () => {
    const { client, mock } = setup();
    mock
      .onPost('/auth/request-upgrade')
      .reply(200, { message: "Demande d'upgrade soumise. Un administrateur va la valider." });

    await requestUpgrade(client, { motivation: 'Électricien depuis dix ans à Douala.' });

    expect(body(mock.history.post[0]?.data)).toEqual({
      motivation: 'Électricien depuis dix ans à Douala.',
    });
  });
});
