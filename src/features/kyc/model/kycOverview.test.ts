import type { KycDocument } from '../schemas/kycSchemas';
import { buildKycOverview } from './kycOverview';

const doc = (overrides: Partial<KycDocument>): KycDocument => ({
  id: 'k',
  type: 'cni',
  status: 'pending',
  rejection_reason: null,
  url: 'http://api.test/storage/kyc/document.png',
  created_at: '2026-09-16T10:00:00.000000Z',
  ...overrides,
});

describe('buildKycOverview', () => {
  it('liste les quatre justificatifs attendus, à fournir par défaut', () => {
    expect(buildKycOverview([]).map((item) => [item.type, item.status])).toEqual([
      ['cni', 'missing'],
      ['casier', 'missing'],
      ['cert', 'missing'],
      ['photo', 'missing'],
    ]);
  });

  it('retient le document le plus récent de chaque type', () => {
    const [cni] = buildKycOverview([
      doc({
        id: 'ancien',
        status: 'rejected',
        rejection_reason: 'Flou',
        created_at: '2026-09-01T10:00:00Z',
      }),
      doc({ id: 'recent', status: 'approved', created_at: '2026-09-10T10:00:00Z' }),
    ]);
    expect(cni).toMatchObject({
      status: 'approved',
      rejectionReason: null,
      document: { id: 'recent' },
    });
  });

  it('expose le motif de refus', () => {
    const [cni] = buildKycOverview([
      doc({ status: 'rejected', rejection_reason: 'Document illisible' }),
    ]);
    expect(cni).toMatchObject({ status: 'rejected', rejectionReason: 'Document illisible' });
  });

  it('considère un statut absent ou inconnu comme en attente et ignore les types non suivis', () => {
    const overview = buildKycOverview([
      doc({ type: 'casier', status: null }),
      doc({ type: 'cert', status: 'archived' }),
      doc({ type: 'rccm', status: 'approved' }),
    ]);
    expect(overview.map((item) => item.status)).toEqual([
      'missing',
      'pending',
      'pending',
      'missing',
    ]);
  });
});
