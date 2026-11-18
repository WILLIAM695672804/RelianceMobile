import type { AppNotification } from '../schemas/notificationSchemas';
import { notificationTarget } from './notificationTarget';

function notification(payload: Record<string, unknown>): AppNotification {
  return { id: 'n1', title: 'Titre', is_read: false, payload };
}

describe('notificationTarget', () => {
  it('ouvre la conversation en priorité', () => {
    expect(
      notificationTarget(notification({ conversation_id: 'c1', request_id: 'r1' }), 'client'),
    ).toEqual({ kind: 'conversation', id: 'c1' });
  });

  it('ouvre le portefeuille pour un mouvement financier', () => {
    expect(
      notificationTarget(notification({ type: 'credit', request_id: 'r1' }), 'client'),
    ).toEqual({ kind: 'wallet' });
  });

  it('ouvre la demande côté client et la mission côté technicien', () => {
    const item = notification({ type: 'quote_received', request_id: 'r1' });
    expect(notificationTarget(item, 'client')).toEqual({ kind: 'request', id: 'r1' });
    expect(notificationTarget(item, 'technicien')).toEqual({ kind: 'mission' });
    expect(notificationTarget(notification({ job_id: 'j1' }), 'technicien')).toEqual({
      kind: 'mission',
    });
  });

  it('mène le technicien à ses propositions', () => {
    expect(
      notificationTarget(notification({ type: 'proposal', proposal_id: 'p1' }), 'technicien'),
    ).toEqual({ kind: 'proposals' });
  });

  it('ne propose rien sans identifiant exploitable', () => {
    expect(notificationTarget(notification({ type: 'kyc' }), 'agence')).toBeNull();
    expect(notificationTarget(notification({ request_id: 'r1' }), 'agence')).toBeNull();
  });
});
