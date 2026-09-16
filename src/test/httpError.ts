import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

/** Erreur Axios portant une réponse HTTP, pour les tests de normalisation et de contrat. */
export function httpError(status: number, data: unknown): AxiosError {
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return new AxiosError(
    'échec',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    response as AxiosResponse,
  );
}
