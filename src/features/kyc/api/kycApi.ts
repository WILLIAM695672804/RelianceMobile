import type { AxiosInstance } from 'axios';

import { appendFile, MULTIPART_HEADERS, parseResponse, type UploadFile } from '@/core/api';

import {
  kycDocumentListSchema,
  kycUploadResponseSchema,
  type KycDocument,
  type KycDocumentType,
} from '../schemas/kycSchemas';

export interface KycUploadPayload {
  type: KycDocumentType;
  file: UploadFile;
}

/** `GET /auth/kyc/mine`. */
export async function fetchMyDocuments(client: AxiosInstance): Promise<KycDocument[]> {
  const { data } = await client.get('/auth/kyc/mine');
  return parseResponse(kycDocumentListSchema, data);
}

/** `POST /auth/kyc/upload` (multipart : `type`, `document`). */
export async function uploadDocument(
  client: AxiosInstance,
  { type, file }: KycUploadPayload,
): Promise<KycDocument> {
  const form = new FormData();
  form.append('type', type);
  appendFile(form, 'document', file);
  const { data } = await client.post('/auth/kyc/upload', form, { headers: MULTIPART_HEADERS });
  return parseResponse(kycUploadResponseSchema, data).document;
}
