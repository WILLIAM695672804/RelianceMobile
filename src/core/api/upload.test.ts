import { appendFile, MULTIPART_HEADERS } from './upload';

describe('upload', () => {
  it('ajoute le descripteur de fichier attendu par React Native', () => {
    const form = new FormData();
    const append = jest.spyOn(form, 'append');

    appendFile(form, 'avatar', { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' });

    expect(append).toHaveBeenCalledWith('avatar', {
      uri: 'file:///photo.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
  });

  it('déclare un envoi multipart', () => {
    expect(MULTIPART_HEADERS).toEqual({ 'Content-Type': 'multipart/form-data' });
  });
});
