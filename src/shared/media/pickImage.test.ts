import * as ImagePicker from 'expo-image-picker';

import { pickImage, toUploadFile } from './pickImage';

const picked = (asset: Partial<ImagePicker.ImagePickerAsset>) =>
  ({
    canceled: false,
    assets: [{ uri: 'file:///cache/photo.png', width: 1, height: 1, ...asset }],
  }) as ImagePicker.ImagePickerResult;

describe('toUploadFile', () => {
  it('reprend le nom et le type fournis par le sélecteur', () => {
    expect(
      toUploadFile({ uri: 'file:///cache/a.png', fileName: 'photo.png', mimeType: 'image/png' }),
    ).toEqual({ uri: 'file:///cache/a.png', name: 'photo.png', type: 'image/png' });
  });

  it('déduit le nom et le type de l’URI à défaut', () => {
    expect(toUploadFile({ uri: 'file:///cache/IMG_1.webp', fileName: null })).toEqual({
      uri: 'file:///cache/IMG_1.webp',
      name: 'IMG_1.webp',
      type: 'image/webp',
    });
  });

  it('retient JPEG pour une extension inconnue', () => {
    expect(toUploadFile({ uri: 'content://media/42' }).type).toBe('image/jpeg');
  });
});

describe('pickImage', () => {
  it('renvoie le fichier choisi dans la galerie', async () => {
    jest
      .mocked(ImagePicker.launchImageLibraryAsync)
      .mockResolvedValueOnce(picked({ fileName: 'photo.png', mimeType: 'image/png' }));

    await expect(pickImage('library', { allowsEditing: true, aspect: [1, 1] })).resolves.toEqual({
      status: 'picked',
      file: { uri: 'file:///cache/photo.png', name: 'photo.png', type: 'image/png' },
    });
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenLastCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  });

  it('signale l’abandon', async () => {
    await expect(pickImage('library')).resolves.toEqual({ status: 'canceled' });
  });

  it('n’ouvre pas l’appareil photo sans autorisation', async () => {
    jest
      .mocked(ImagePicker.requestCameraPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as ImagePicker.CameraPermissionResponse);

    await expect(pickImage('camera')).resolves.toEqual({ status: 'denied' });
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('photographie avec l’appareil photo', async () => {
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValueOnce(picked({}));

    await expect(pickImage('camera')).resolves.toMatchObject({ status: 'picked' });
  });
});
