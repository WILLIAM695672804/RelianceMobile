import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { applyServerErrors, describeError, normalizeError } from '@/core/errors';
import { useSession, type ApiUser } from '@/core/session';
import { useAccount } from '@/features/auth';
import { FormField } from '@/shared/forms';
import { pickImage, type ImageSource } from '@/shared/media';
import { Avatar, Banner, Button, QueryGate, Screen, TopBar } from '@/shared/ui';

import { useUpdateProfile, useUploadAvatar } from '../hooks/useProfileMutations';
import {
  profileFormSchema,
  toProfilePayload,
  type ProfileFormValues,
} from '../schemas/profileSchemas';

export interface EditProfileScreenProps {
  /** Appelé après un enregistrement réussi. */
  onDone: () => void;
  onBack?: () => void;
}

/** E09 — Modification du profil ; le téléphone, absent de la session, est relu sur `/auth/me`. */
export function EditProfileScreen({ onDone, onBack }: EditProfileScreenProps) {
  const account = useAccount();
  return (
    <QueryGate queries={[account]}>
      {() => <EditProfileForm account={account.data!} onDone={onDone} onBack={onBack ?? onDone} />}
    </QueryGate>
  );
}

function EditProfileForm({
  account,
  onDone,
  onBack,
}: {
  account: ApiUser;
  onDone: () => void;
  onBack: () => void;
}) {
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
    <Screen
      testID="edition-profil"
      footer={
        <Button
          label={t('profile:edit.submit')}
          size="lg"
          full
          onPress={() => void onSubmit()}
          loading={updateProfile.isPending}
        />
      }
    >
      <TopBar title={t('profile:edit.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        {notice ? <Banner tone="success" message={notice} /> : null}

        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
          <Avatar name={account.name} uri={avatarUrl} size={96} />
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}
          >
            <Button
              label={t('profile:edit.fromLibrary')}
              icon="image"
              variant="soft"
              size="sm"
              onPress={() => void changeAvatar('library')}
              loading={uploadAvatar.isPending}
            />
            <Button
              label={t('profile:edit.fromCamera')}
              icon="camera"
              variant="ghost"
              size="sm"
              onPress={() => void changeAvatar('camera')}
              disabled={uploadAvatar.isPending}
            />
          </View>
        </View>

        <FormField
          control={form.control}
          name="name"
          label={t('profile:edit.name')}
          icon="user"
          autoComplete="name"
        />
        <FormField
          control={form.control}
          name="email"
          label={t('profile:edit.email')}
          icon="inbox"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          hint={t('profile:edit.emailChangeNotice')}
        />
        <FormField
          control={form.control}
          name="phone"
          label={t('profile:edit.phone')}
          icon="phone"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </View>
    </Screen>
  );
}
