import kycMine from '@/test/fixtures/kyc/kyc-mine.json';
import kycStatusChanged from '@/test/fixtures/kyc/kyc-status-changed.json';
import kycUploaded from '@/test/fixtures/kyc/kyc-uploaded.json';

import { kycDocumentListSchema, kycStatusEventSchema, kycUploadResponseSchema } from './kycSchemas';

describe('contrat des justificatifs', () => {
  it('POST /auth/kyc/upload 200 : document soumis', () => {
    const parsed = kycUploadResponseSchema.parse(kycUploaded);
    expect(parsed.message).toBe('Document KYC soumis');
    expect(parsed.document).toMatchObject({ type: 'cni' });
  });

  it('GET /auth/kyc/mine 200 : contient le document soumis', () => {
    const documents = kycDocumentListSchema.parse(kycMine);
    expect(documents.map((document) => document.id)).toContain(kycUploaded.document.id);
    expect(documents.find((document) => document.id === kycUploaded.document.id)?.status).toBe(
      'pending',
    );
  });

  it('KycStatusChanged : statut et motif', () => {
    expect(kycStatusEventSchema.parse(kycStatusChanged)).toEqual({
      status: 'rejected',
      rejection_reason: 'Document illisible',
      type: 'kyc_status',
    });
  });

  it('tolère un statut inconnu', () => {
    expect(
      kycDocumentListSchema.parse([{ id: 'k1', type: 'cni', status: 'archived', url: 'u' }])[0]
        ?.status,
    ).toBe('archived');
  });
});
