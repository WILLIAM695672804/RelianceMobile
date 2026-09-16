import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import activeMission from '@/test/fixtures/matching/active-mission.json';
import matchResults from '@/test/fixtures/matching/match-results.json';
import proposalAccepted from '@/test/fixtures/matching/proposal-accepted.json';
import proposalRefused from '@/test/fixtures/matching/proposal-refused.json';
import proposalSent from '@/test/fixtures/matching/proposal-sent.json';
import proposals from '@/test/fixtures/matching/proposals.json';
import technicianProfile from '@/test/fixtures/matching/technician-profile.json';

import {
  acceptProposal,
  fetchActiveMission,
  fetchReceivedProposals,
  fetchTechnicianProfile,
  findTechnicians,
  refuseProposal,
  selectTechnician,
} from './matchingApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('matchingApi', () => {
  it('findTechnicians lance le rapprochement et classe les résultats', async () => {
    const { client, mock } = setup();
    mock.onPost('/requests/r1/match').reply(200, matchResults);

    const technicians = await findTechnicians(client, 'r1');

    expect(technicians.map((technician) => technician.id)).toEqual(
      matchResults.data.technicians.map(({ id }) => id),
    );
  });

  it('selectTechnician envoie l’offre au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/requests/r1/select-technician').reply(201, proposalSent);

    const sent = await selectTechnician(client, 'r1', {
      technicianId: 't1',
      price: 15000,
      message: null,
    });

    expect(sent.id).toBe(proposalSent.data.id);
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      technician_id: 't1',
      price: 15000,
      message: null,
    });
  });

  it('fetchTechnicianProfile lit le profil public', async () => {
    const { client, mock } = setup();
    mock.onGet('/technicians/t1/profile').reply(200, technicianProfile);

    await expect(fetchTechnicianProfile(client, 't1')).resolves.toMatchObject({
      id: technicianProfile.data.id,
    });
  });

  it('lit les propositions reçues et la mission en cours du technicien', async () => {
    const { client, mock } = setup();
    mock.onGet('/proposals/my').reply(200, proposals);
    mock.onGet('/proposals/active-mission').reply(200, activeMission);

    await expect(fetchReceivedProposals(client)).resolves.toHaveLength(proposals.data.data.length);
    await expect(fetchActiveMission(client)).resolves.toMatchObject({
      proposal_id: activeMission.data.proposal_id,
    });
  });

  it('acceptProposal et refuseProposal renvoient le message du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/proposals/p1/accept').reply(200, proposalAccepted);
    mock.onPost('/proposals/p2/refuse').reply(200, proposalRefused);

    await expect(acceptProposal(client, 'p1')).resolves.toBe(proposalAccepted.message);
    await expect(refuseProposal(client, 'p2')).resolves.toBe(proposalRefused.message);
  });
});
