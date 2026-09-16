import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { requestsKeys } from '@/features/requests';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import activeMission from '@/test/fixtures/matching/active-mission.json';
import matchResults from '@/test/fixtures/matching/match-results.json';
import proposalAccepted from '@/test/fixtures/matching/proposal-accepted.json';
import proposalRefused from '@/test/fixtures/matching/proposal-refused.json';
import proposalSent from '@/test/fixtures/matching/proposal-sent.json';
import proposals from '@/test/fixtures/matching/proposals.json';
import technicianProfile from '@/test/fixtures/matching/technician-profile.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { matchingKeys } from './matchingKeys';
import { useMatchResults, useSelectTechnician, useTechnicianProfile } from './useMatching';
import {
  useAcceptProposal,
  useActiveMission,
  useProposalsSync,
  useReceivedProposals,
  useRefuseProposal,
} from './useProposals';

function setup() {
  const fake = createFakeRealtimeClient();
  const realtime = createRealtimeService(() => fake.client);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('technicien', { id: 'u1' }));
  realtime.start();
  const providers = createTestProviders({ realtime, sessionStore });
  return {
    ...providers,
    fake,
    mock: new MockAdapter(providers.api),
    wrapper: providers.TestProviders,
  };
}

describe('hooks matching', () => {
  it('matchingKeys hiérarchise les clés sous « matching »', () => {
    expect(matchingKeys.matches('r1')).toEqual(['matching', 'matches', 'r1']);
    expect(matchingKeys.technician('t1')).toEqual(['matching', 'technician', 't1']);
    expect(matchingKeys.proposals()).toEqual(['matching', 'proposals']);
    expect(matchingKeys.activeMission()).toEqual(['matching', 'active-mission']);
  });

  it('lit les résultats, le profil, les propositions et la mission', async () => {
    const { mock, wrapper } = setup();
    mock.onPost('/requests/r1/match').reply(200, matchResults);
    mock.onGet('/technicians/t1/profile').reply(200, technicianProfile);
    mock.onGet('/proposals/my').reply(200, proposals);
    mock.onGet('/proposals/active-mission').reply(200, activeMission);

    const hooks = [
      await renderHook(() => useMatchResults('r1'), { wrapper }),
      await renderHook(() => useTechnicianProfile('t1'), { wrapper }),
      await renderHook(() => useReceivedProposals(), { wrapper }),
      await renderHook(() => useActiveMission(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('useSelectTechnician invalide les demandes du client', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/requests/r1/select-technician').reply(201, proposalSent);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useSelectTechnician('r1'), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ technicianId: 't1', price: 15000, message: null });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestsKeys.all });
  });

  it('accepter ou refuser une proposition invalide le rapprochement', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/proposals/p1/accept').reply(200, proposalAccepted);
    mock.onPost('/proposals/p2/refuse').reply(200, proposalRefused);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const accept = await renderHook(() => useAcceptProposal(), { wrapper });
    const refuse = await renderHook(() => useRefuseProposal(), { wrapper });
    await act(async () => {
      await accept.result.current.mutateAsync('p1');
      await refuse.result.current.mutateAsync('p2');
    });
    await waitFor(() => expect(refuse.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: matchingKeys.all });
  });

  it('useProposalsSync invalide les caches selon l’événement du canal proposals', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useProposalsSync(), { wrapper });
    await act(async () => {
      fake.channels.get('proposals.u1')?.emit('ProposalCreated', { id: 'p1' });
    });
    expect(invalidate).toHaveBeenLastCalledWith({ queryKey: matchingKeys.all });

    await act(async () => {
      fake.channels.get('proposals.u1')?.emit('ProposalAccepted', { proposal_id: 'p1' });
    });
    expect(invalidate).toHaveBeenLastCalledWith({ queryKey: requestsKeys.all });

    invalidate.mockClear();
    await act(async () => {
      fake.channels.get('proposals.u1')?.emit('ProposalRefused', { proposal_id: 'p1' });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestsKeys.all });
  });
});
