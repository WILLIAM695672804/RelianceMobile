import activeMission from '@/test/fixtures/matching/active-mission.json';
import matchResults from '@/test/fixtures/matching/match-results.json';
import proposalSent from '@/test/fixtures/matching/proposal-sent.json';
import proposals from '@/test/fixtures/matching/proposals.json';
import technicianProfile from '@/test/fixtures/matching/technician-profile.json';

import {
  activeMissionResponseSchema,
  matchResponseSchema,
  offerFormSchema,
  proposalSentResponseSchema,
  receivedProposalsResponseSchema,
  technicianProfileResponseSchema,
  toOfferPayload,
} from './matchingSchemas';

describe('matchingSchemas', () => {
  it('lit les résultats du rapprochement et convertit les tarifs', () => {
    const { technicians } = matchResponseSchema.parse(matchResults).data;

    expect(technicians).toHaveLength(matchResults.data.technicians.length);
    expect(typeof technicians[0]?.skills[0]?.hourly_rate).toBe('number');
  });

  it('accepte un rapprochement sans résultat', () => {
    expect(
      matchResponseSchema.parse({
        status: 'success',
        data: { technicians: [], scoring_details: { reason: 'Aucun technicien' } },
      }).data.technicians,
    ).toEqual([]);
  });

  it('lit le profil public sans conserver courriel ni téléphone', () => {
    const profile = technicianProfileResponseSchema.parse(technicianProfile).data;

    expect(profile.id).toBe(technicianProfile.data.id);
    expect(profile).not.toHaveProperty('email');
    expect(profile).not.toHaveProperty('phone');
  });

  it('lit la proposition envoyée, les propositions reçues et la mission en cours', () => {
    expect(proposalSentResponseSchema.parse(proposalSent).data.status).toBe('pending');
    expect(receivedProposalsResponseSchema.parse(proposals).data.data).toHaveLength(
      proposals.data.data.length,
    );
    expect(activeMissionResponseSchema.parse(activeMission).data?.request.title).toBe(
      activeMission.data.request.title,
    );
    expect(activeMissionResponseSchema.parse({ status: 'success', data: null }).data).toBeNull();
  });

  it('valide le prix et le message de l’offre', () => {
    expect(offerFormSchema.safeParse({ price: '15000', message: '' }).success).toBe(true);
    expect(offerFormSchema.safeParse({ price: '0', message: '' }).error?.issues[0]?.message).toBe(
      'matching:offer.errors.priceInvalid',
    );
    expect(
      offerFormSchema
        .safeParse({ price: '12,5', message: 'x'.repeat(1001) })
        .error?.issues.map((issue) => issue.message),
    ).toEqual(['matching:offer.errors.priceInvalid', 'matching:offer.errors.messageTooLong']);
  });

  it('toOfferPayload convertit le prix et omet un message vide', () => {
    expect(toOfferPayload('t1', { price: '15000', message: '  ' })).toEqual({
      technicianId: 't1',
      price: 15000,
      message: null,
    });
    expect(toOfferPayload('t1', { price: '9000', message: ' Demain matin ' }).message).toBe(
      'Demain matin',
    );
  });
});
