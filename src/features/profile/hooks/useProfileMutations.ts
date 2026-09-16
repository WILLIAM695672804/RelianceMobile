import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useApiClient, type UploadFile } from '@/core/api';
import { useSession, useSessionActions, type SessionUser } from '@/core/session';
import { authKeys } from '@/features/auth';

import {
  changePassword,
  requestUpgrade,
  updateProfile,
  uploadAvatar,
  type PasswordPayload,
} from '../api/profileApi';
import type { ProfilePayload, UpgradePayload } from '../schemas/profileSchemas';
import { applyProfileToSession } from './sessionSync';

/** Met à jour l'utilisateur de session (et son cache hors ligne), puis invalide le compte complet. */
function useSessionUpdate() {
  const current = useSession((state) => state.user);
  const { signIn } = useSessionActions();
  const queryClient = useQueryClient();
  return (update: (user: SessionUser) => SessionUser) => {
    if (current) signIn(update(current));
    return queryClient.invalidateQueries({ queryKey: authKeys.account() });
  };
}

/** E09 — modification du nom, du courriel ou du téléphone. */
export function useUpdateProfile() {
  const api = useApiClient();
  const updateSession = useSessionUpdate();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => updateProfile(api, payload),
    onSuccess: (user) => updateSession((current) => applyProfileToSession(current, user)),
  });
}

/** E09 — nouvelle photo de profil. */
export function useUploadAvatar() {
  const api = useApiClient();
  const updateSession = useSessionUpdate();
  return useMutation({
    mutationFn: (file: UploadFile) => uploadAvatar(api, file),
    onSuccess: (avatarUrl) => updateSession((current) => ({ ...current, avatarUrl })),
  });
}

export function useChangePassword() {
  const api = useApiClient();
  return useMutation({ mutationFn: (payload: PasswordPayload) => changePassword(api, payload) });
}

/** Demande de passage au rôle technicien ; la décision arrive par `RoleUpgradeDecision`. */
export function useRequestUpgrade() {
  const api = useApiClient();
  return useMutation({ mutationFn: (payload: UpgradePayload) => requestUpgrade(api, payload) });
}
