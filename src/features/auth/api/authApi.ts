import type { AxiosInstance } from 'axios';
import { z } from 'zod';

import { parseResponse } from '@/core/api';
import { apiUserSchema, toSessionUser, type ApiUser, type SessionUser } from '@/core/session';

import {
  loginResponseSchema,
  messageResponseSchema,
  registerResponseSchema,
  twoFactorSetupSchema,
  type RegisterPayload,
} from '../schemas/authSchemas';

export interface LoginPayload {
  email: string;
  password: string;
  /** Code TOTP, requis lorsque la 2FA est active. */
  code?: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export type TwoFactorSetup = z.infer<typeof twoFactorSetupSchema>;

const accountResponseSchema = z.object({ user: apiUserSchema });

const postMessage = async (client: AxiosInstance, url: string, body?: object): Promise<string> => {
  const { data } = await client.post(url, body);
  return parseResponse(messageResponseSchema, data).message;
};

/** `POST /auth/login` : ouvre la session (cookie) et renvoie l'utilisateur. */
export async function login(client: AxiosInstance, payload: LoginPayload): Promise<SessionUser> {
  const { data } = await client.post('/auth/login', payload);
  return toSessionUser(parseResponse(loginResponseSchema, data).user);
}

/** `POST /auth/register` : crée le compte et ouvre la session. */
export async function register(
  client: AxiosInstance,
  payload: RegisterPayload,
): Promise<SessionUser> {
  const { data } = await client.post('/auth/register', payload);
  return toSessionUser(parseResponse(registerResponseSchema, data).user);
}

/** `GET /auth/me` : utilisateur complet (écran compte, état 2FA). */
export async function fetchAccount(client: AxiosInstance): Promise<ApiUser> {
  const { data } = await client.get('/auth/me');
  return parseResponse(accountResponseSchema, data).user;
}

/** `POST /auth/forgot-password`. */
export const forgotPassword = (client: AxiosInstance, email: string) =>
  postMessage(client, '/auth/forgot-password', { email });

/** `POST /auth/reset-password`. */
export const resetPassword = (client: AxiosInstance, payload: ResetPasswordPayload) =>
  postMessage(client, '/auth/reset-password', payload);

/** `POST /auth/email/verification-notification`. */
export const resendVerification = (client: AxiosInstance) =>
  postMessage(client, '/auth/email/verification-notification');

/** `POST /auth/2fa/generate` : secret et QR code SVG. */
export async function generateTwoFactor(client: AxiosInstance): Promise<TwoFactorSetup> {
  const { data } = await client.post('/auth/2fa/generate');
  return parseResponse(twoFactorSetupSchema, data);
}

/** `POST /auth/2fa/enable`. */
export const enableTwoFactor = (client: AxiosInstance, code: string) =>
  postMessage(client, '/auth/2fa/enable', { code });

/** `POST /auth/2fa/disable`. */
export const disableTwoFactor = (client: AxiosInstance, code: string) =>
  postMessage(client, '/auth/2fa/disable', { code });
