import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import matchResults from '@/test/fixtures/matching/match-results.json';
import proposalSent from '@/test/fixtures/matching/proposal-sent.json';
import { renderWithProviders } from '@/test/render';

import { matchingTranslations } from '../i18n';
import { matchResponseSchema } from '../schemas/matchingSchemas';
import { MatchingContainer, matchedToSummary } from './MatchingContainer';

const TECH = matchResults.data.technicians[0]!;

describe('matchedToSummary', () => {
  it('retient le tarif de la première compétence', () => {
    const [parsed] = matchResponseSchema.parse(matchResults).data.technicians;
    expect(matchedToSummary(parsed!)).toMatchObject({
      id: TECH.id,
      name: TECH.name,
      price: 7000,
      verified: Boolean(TECH.verified),
    });
  });
});

async function setup(results: unknown = matchResults) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onPost('/requests/r1/match').reply(200, results);
  const props = { onSent: jest.fn(), onViewProfile: jest.fn(), onClose: jest.fn() };
  await renderWithProviders(<MatchingContainer requestId="r1" {...props} />, {
    api,
    translations: [matchingTranslations],
  });
  return { mock, props, user: userEvent.setup() };
}

describe('MatchingContainer', () => {
  it('envoie la proposition au tarif affiché', async () => {
    const { mock, props, user } = await setup();
    mock.onPost('/requests/r1/select-technician').reply(201, proposalSent);

    await user.press(await screen.findByRole('button', { name: `Choisir ${TECH.name}` }));

    await waitFor(() => expect(props.onSent).toHaveBeenCalled());
    const body = JSON.parse(mock.history.post.at(-1)!.data as string);
    expect(body).toEqual({ technician_id: TECH.id, price: 7000, message: null });
  });

  it('passe par la fiche du technicien lorsque le tarif est inconnu', async () => {
    const withoutRate = {
      data: { technicians: [{ ...TECH, skills: [] }] },
    };
    const { mock, props, user } = await setup(withoutRate);

    await user.press(await screen.findByRole('button', { name: `Choisir ${TECH.name}` }));

    expect(props.onViewProfile).toHaveBeenCalledWith(TECH.id);
    expect(mock.history.post.some((r) => r.url?.endsWith('select-technician'))).toBe(false);
  });

  it('signale un refus du serveur sans quitter l’écran', async () => {
    const { mock, props, user } = await setup();
    mock
      .onPost('/requests/r1/select-technician')
      .reply(422, { message: 'Cette demande n’accepte plus de proposition.' });

    await user.press(await screen.findByRole('button', { name: `Choisir ${TECH.name}` }));

    expect(
      await screen.findByText('Cette demande n’accepte plus de proposition.'),
    ).toBeOnTheScreen();
    expect(props.onSent).not.toHaveBeenCalled();
  });
});
