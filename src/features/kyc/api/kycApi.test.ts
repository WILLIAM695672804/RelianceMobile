import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import kycMine from '@/test/fixtures/kyc/kyc-mine.json';
import kycUploaded from '@/test/fixtures/kyc/kyc-uploaded.json';

import { fetchMyDocuments, uploadDocument } from './kycApi';

describe('kycApi', () => {
  it('fetchMyDocuments lit les justificatifs', async () => {
    const client = axios.create({ baseURL: 'http://api.test/api/v1' });
    new MockAdapter(client).onGet('/auth/kyc/mine').reply(200, kycMine);

    await expect(fetchMyDocuments(client)).resolves.toHaveLength(kycMine.length);
  });

  it('uploadDocument envoie le type et le fichier en multipart', async () => {
    const client = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(client);
    mock.onPost('/auth/kyc/upload').reply(200, kycUploaded);
    const append = jest.spyOn(FormData.prototype, 'append');
    const file = { uri: 'file:///cache/cni.jpg', name: 'cni.jpg', type: 'image/jpeg' };

    const document = await uploadDocument(client, { type: 'cni', file });

    expect(document.id).toBe(kycUploaded.document.id);
    expect(append).toHaveBeenCalledWith('type', 'cni');
    expect(append).toHaveBeenCalledWith('document', file);
    expect(mock.history.post[0]?.headers?.['Content-Type']).toBe('multipart/form-data');
    append.mockRestore();
  });
});
