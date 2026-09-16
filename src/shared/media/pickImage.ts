import * as ImagePicker from 'expo-image-picker';

import type { UploadFile } from '@/core/api';

export type ImageSource = 'library' | 'camera';

export type PickImageResult =
  { status: 'picked'; file: UploadFile } | { status: 'canceled' } | { status: 'denied' };

export interface PickImageOptions {
  /** Recadrage proposé après la sélection. */
  allowsEditing?: boolean;
  /** Proportions du recadrage (Android). */
  aspect?: [number, number];
  /** Compression, de 0 à 1. */
  quality?: number;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

/** Descripteur d'envoi d'une image choisie ; nom et type sont déduits de l'URI à défaut. */
export function toUploadFile(
  asset: Pick<ImagePicker.ImagePickerAsset, 'uri'> &
    Partial<Pick<ImagePicker.ImagePickerAsset, 'fileName' | 'mimeType'>>,
): UploadFile {
  const name = asset.fileName || asset.uri.split('/').pop() || 'image.jpg';
  const extension = name.includes('.') ? (name.split('.').pop()?.toLowerCase() ?? '') : '';
  return {
    uri: asset.uri,
    name,
    type: asset.mimeType ?? MIME_BY_EXTENSION[extension] ?? 'image/jpeg',
  };
}

/** Ouvre la galerie ou l'appareil photo après avoir sollicité l'autorisation correspondante. */
export async function pickImage(
  source: ImageSource,
  options: PickImageOptions = {},
): Promise<PickImageResult> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const launch =
    source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
  const result = await launch({
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? false,
    aspect: options.aspect,
    quality: options.quality ?? 0.8,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? { status: 'picked', file: toUploadFile(asset) } : { status: 'canceled' };
}
