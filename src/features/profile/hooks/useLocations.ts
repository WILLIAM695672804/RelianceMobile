import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';

import { useApiClient } from '@/core/api';

import {
  createLocation,
  deleteLocation,
  fetchLocations,
  setDefaultLocation,
} from '../api/profileApi';
import type { LocationPayload } from '../schemas/profileSchemas';
import { profileKeys } from './profileKeys';

/** Adresses de l'utilisateur connecté. */
export function useLocations() {
  const api = useApiClient();
  return useQuery({ queryKey: profileKeys.locations(), queryFn: () => fetchLocations(api) });
}

/** Mutation d'adresse suivie du rechargement de la liste. */
function useLocationMutation<TVariables>(
  mutate: (client: AxiosInstance, variables: TVariables) => Promise<unknown>,
) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => mutate(api, variables),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.locations() }),
  });
}

export const useCreateLocation = () => useLocationMutation<LocationPayload>(createLocation);
export const useDeleteLocation = () => useLocationMutation<string>(deleteLocation);
export const useSetDefaultLocation = () => useLocationMutation<string>(setDefaultLocation);
