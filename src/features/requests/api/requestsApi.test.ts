import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import requestDetail from '@/test/fixtures/requests/request-detail.json';
import requestCreated from '@/test/fixtures/requests/request-created.json';
import requests from '@/test/fixtures/requests/requests.json';

import { createRequest, fetchRequest, fetchRequests } from './requestsApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

const photo = { uri: 'file:///cache/panne.jpg', name: 'panne.jpg', type: 'image/jpeg' };

describe('requestsApi', () => {
  it('fetchRequests lit la première page', async () => {
    const { client, mock } = setup();
    mock.onGet('/requests').reply(200, requests);

    const page = await fetchRequests(client);

    expect(page.data.map((request) => request.id)).toEqual(requests.data.map(({ id }) => id));
  });

  it('fetchRequest lit une demande', async () => {
    const { client, mock } = setup();
    mock.onGet(`/requests/${requestDetail.data.id}`).reply(200, requestDetail);

    await expect(fetchRequest(client, requestDetail.data.id)).resolves.toMatchObject({
      id: requestDetail.data.id,
      title: requestDetail.data.title,
    });
  });

  it('createRequest envoie les champs et les photos en multipart', async () => {
    const { client, mock } = setup();
    mock.onPost('/requests').reply(201, requestCreated);
    const append = jest.spyOn(FormData.prototype, 'append');

    const created = await createRequest(client, {
      title: 'Panne de courant',
      description: 'Plus de courant dans la cuisine depuis ce matin.',
      categorySlug: 'depannage-electrique',
      latitude: 3.848,
      longitude: 11.5021,
      addressLabel: 'Rue de la démonstration, Yaoundé',
      city: 'Yaoundé',
      photos: [photo],
    });

    expect(created.id).toBe(requestCreated.data.id);
    expect(append.mock.calls).toEqual([
      ['title', 'Panne de courant'],
      ['description', 'Plus de courant dans la cuisine depuis ce matin.'],
      ['category_slug', 'depannage-electrique'],
      ['latitude', '3.848'],
      ['longitude', '11.5021'],
      ['address_label', 'Rue de la démonstration, Yaoundé'],
      ['city', 'Yaoundé'],
      ['photos[0]', photo],
    ]);
    expect(mock.history.post[0]?.headers?.['Content-Type']).toBe('multipart/form-data');
    append.mockRestore();
  });

  it('createRequest omet l’adresse et la ville inconnues', async () => {
    const { client, mock } = setup();
    mock.onPost('/requests').reply(201, requestCreated);
    const append = jest.spyOn(FormData.prototype, 'append');

    await createRequest(client, {
      title: 'Panne',
      description: 'Plus de courant dans la cuisine depuis ce matin.',
      categorySlug: 'depannage-electrique',
      latitude: 3.848,
      longitude: 11.5021,
      addressLabel: null,
      city: null,
      photos: [],
    });

    const fields = append.mock.calls.map(([name]) => name);
    expect(fields).not.toContain('address_label');
    expect(fields).not.toContain('city');
    append.mockRestore();
  });
});
