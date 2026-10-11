import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import type { UploadFile } from '@/core/api';
import { AdaptiveGrid, Button, IconButton, Text } from '@/shared/components';
import { pickImage, type ImageSource } from '@/shared/media';

import { MAX_PHOTOS } from '../schemas/requestSchemas';
import { PermissionNotice } from './PermissionNotice';

export interface PhotoFieldProps {
  value: UploadFile[];
  onChange: (photos: UploadFile[]) => void;
  /** Message déjà traduit. */
  error?: string;
}

/** Photos d'une demande : appareil photo ou galerie, cinq au plus, retrait possible. */
export function PhotoField({ value, onChange, error }: PhotoFieldProps) {
  const { t } = useTranslation();
  const [deniedSource, setDeniedSource] = useState<ImageSource | null>(null);
  const full = value.length >= MAX_PHOTOS;

  const add = async (source: ImageSource) => {
    setDeniedSource(null);
    const picked = await pickImage(source, { quality: 0.7 });
    if (picked.status === 'denied') {
      setDeniedSource(source);
      return;
    }
    if (picked.status === 'picked') onChange([...value, picked.file].slice(0, MAX_PHOTOS));
  };

  return (
    <View style={styles.field}>
      <Text variant="caption" tone="muted">
        {t('requests:form.photos')}
      </Text>
      <Text variant="caption" tone="muted">
        {t('requests:form.photosHint', { max: MAX_PHOTOS })}
      </Text>
      {value.length > 0 ? (
        <AdaptiveGrid minTileWidth={88} gap={8}>
          {value.map((photo, index) => (
            <View key={`${photo.uri}-${index}`} style={styles.photo}>
              <Image
                source={{ uri: photo.uri }}
                accessibilityLabel={t('requests:form.photo', { index: index + 1 })}
                style={styles.thumbnail}
              />
              <View style={styles.remove}>
                <IconButton
                  icon="close"
                  tone="danger"
                  filled
                  accessibilityLabel={t('requests:form.removePhoto', { index: index + 1 })}
                  onPress={() => onChange(value.filter((_, position) => position !== index))}
                />
              </View>
            </View>
          ))}
        </AdaptiveGrid>
      ) : null}
      <View style={styles.sources}>
        <Button
          label={t('requests:form.fromCamera')}
          icon="camera"
          onPress={() => void add('camera')}
          disabled={full}
          variant="secondary"
        />
        <Button
          label={t('requests:form.fromLibrary')}
          icon="image"
          onPress={() => void add('library')}
          disabled={full}
          variant="secondary"
        />
      </View>
      {deniedSource ? (
        <PermissionNotice message={t(`requests:form.permissionDenied.${deniedSource}`)} />
      ) : null}
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  photo: { position: 'relative' },
  thumbnail: { width: '100%', aspectRatio: 1, borderRadius: 10 },
  remove: { position: 'absolute', top: -4, right: -4 },
  sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
