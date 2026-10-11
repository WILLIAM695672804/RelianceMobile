import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { useSession, type ApiUser } from '@/core/session';
import { useAccount } from '@/features/auth';
import { Avatar, Button, FormTextField, Screen, StateView, Text } from '@/shared/components';
import { pickImage, type ImageSource } from '@/shared/media';

import { useUpdateProfile, useUploadAvatar } from '../hooks/useProfileMutations';
import {
  profileFormSchema,
  toProfilePayload,
  type ProfileFormValues,
} from '../schemas/profileSchemas';

export interface EditProfileScreenProps {
  /** Appelé après un enregistrement réussi. */
  onDone: () => void;
}

/** E09 — Modification du profil ; le téléphone, absent de la session, est relu sur `/auth/me`. */
export function EditProfileScreen({ onDone }: EditProfileScreenProps) {
  const account = useAccount();

  if (account.isPending) {
    return (
      <Screen>
        <StateView status="loading" />
      </Screen>
    );
  }
  if (account.isError) {
    return (
      <Screen>
        <StateView status="error" error={account.error} onRetry={() => void account.refetch()} />
      </Screen>
    );
  }
  return <EditProfileForm account={account.data} onDone={onDone} />;
}

function EditProfileForm({ account, onDone }: { account: ApiUser; onDone: () => void }) {
  const { t } = useTranslation();
  const avatarUrl = useSession((state) => state.user?.avatarUrl ?? null);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const initial: ProfileFormValues = {
    name: account.name,
    email: account.email,
    phone: account.phone ?? '',
  };
  const form = useForm({ resolver: zodResolver(profileFormSchema), defaultValues: initial });

  const resetMessages = () => {
    setFormError(null);
    setNotice(null);
  };

  const changeAvatar = async (source: ImageSource) => {
    resetMessages();
    const picked = await pickImage(source, { allowsEditing: true, aspect: [1, 1] });
    if (picked.status === 'denied') {
      setFormError(t('profile:edit.permissionDenied'));
      return;
    }
    if (picked.status === 'canceled') return;
    try {
      await uploadAvatar.mutateAsync(picked.file);
      setNotice(t('profile:edit.avatarSaved'));
    } catch (error) {
      const appError = normalizeError(error);
      setFormError(appError.fieldErrors.avatar?.[0] ?? describeError(appError, t));
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    resetMessages();
    const payload = toProfilePayload(values, initial);
    if (Object.keys(payload).length === 0) {
      setNotice(t('profile:edit.nothingToSave'));
      return;
    }
    try {
      await updateProfile.mutateAsync(payload);
      onDone();
    } catch (error) {
      const appError = normalizeError(error);
      if (!applyServerErrors(form.setError, appError)) setFormError(describeError(appError, t));
    }
  });

  return (
    <Screen title={t('profile:edit.title')} scroll>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      {notice ? <Text tone="primary">{notice}</Text> : null}

      <View style={styles.avatar}>
        <Avatar name={account.name} uri={avatarUrl} size={96} />
        <Button
          label={t('profile:edit.fromLibrary')}
          onPress={() => void changeAvatar('library')}
          loading={uploadAvatar.isPending}
          variant="secondary"
        />
        <Button
          label={t('profile:edit.fromCamera')}
          onPress={() => void changeAvatar('camera')}
          disabled={uploadAvatar.isPending}
          variant="ghost"
        />
      </View>

      <FormTextField
        control={form.control}
        name="name"
        label={t('profile:edit.name')}
        autoComplete="name"
      />
      <FormTextField
        control={form.control}
        name="email"
        label={t('profile:edit.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Text variant="caption" tone="muted">
        {t('profile:edit.emailChangeNotice')}
      </Text>
      <FormTextField
        control={form.control}
        name="phone"
        label={t('profile:edit.phone')}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <Button
        label={t('profile:edit.submit')}
        onPress={() => void onSubmit()}
        loading={updateProfile.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', gap: 8 },
});
