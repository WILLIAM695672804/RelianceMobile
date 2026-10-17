import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import created from '@/test/fixtures/disputes/dispute-created.json';
import messageAdded from '@/test/fixtures/disputes/dispute-message.json';
import dispute from '@/test/fixtures/disputes/dispute.json';
import disputes from '@/test/fixtures/disputes/disputes.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { disputesTranslations } from '../i18n';
import { DisputeFormScreen } from './DisputeFormScreen';
import { DisputesScreen } from './DisputesScreen';
import { DisputeThreadScreen } from './DisputeThreadScreen';

const ID = dispute.data.id;
const FIRST = disputes.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('DisputesScreen', () => {
  it('présente les litiges et leur état', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/disputes').reply(200, disputes);
    await renderWithProviders(<DisputesScreen onOpen={jest.fn()} />, {
      api,
      translations: [disputesTranslations],
    });

    expect(await screen.findAllByText('Qualité insuffisante')).toHaveLength(disputes.data.length);
    expect(screen.getAllByText('Ouvert')).not.toHaveLength(0);
    expect(screen.getAllByText(`Contre ${FIRST.defendant.name}`)).not.toHaveLength(0);
  });

  it('annonce l’absence de litige', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/disputes').reply(200, { data: [] });
    await renderWithProviders(<DisputesScreen onOpen={jest.fn()} />, {
      api,
      translations: [disputesTranslations],
    });

    expect(await screen.findByText('Aucun litige ouvert.')).toBeOnTheScreen();
  });

  it('ouvre le fil du litige pressé', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/disputes').reply(200, disputes);
    const onOpen = jest.fn();
    await renderWithProviders(<DisputesScreen onOpen={onOpen} />, {
      api,
      translations: [disputesTranslations],
    });
    const user = userEvent.setup();

    const cards = await screen.findAllByRole('button', {
      name: 'Ouvrir le litige Qualité insuffisante',
    });
    await user.press(cards[0]!);

    expect(onOpen).toHaveBeenCalledWith(FIRST.id);
  });
});

describe('DisputeFormScreen', () => {
  it('ouvre un litige avec le motif choisi', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/disputes').reply(201, created);
    const onOpened = jest.fn();
    await renderWithProviders(
      <DisputeFormScreen
        requestId={created.data.request_id}
        against={created.data.against}
        onOpened={onOpened}
      />,
      { api, translations: [disputesTranslations] },
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Retard excessif' }));
    await user.type(screen.getByLabelText('Description'), 'Le technicien ne vient pas.');
    await user.press(screen.getByRole('button', { name: 'Ouvrir le litige' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: created.data.request_id,
      against: created.data.against,
      reason: 'delay',
      description: 'Le technicien ne vient pas.',
    });
    expect(onOpened).toHaveBeenCalledWith(created.data.id);
  });

  it('refuse une description vide', async () => {
    const { api, mock } = setupApi();
    await renderWithProviders(
      <DisputeFormScreen requestId="r1" against="t1" onOpened={jest.fn()} />,
      { api, translations: [disputesTranslations] },
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Ouvrir le litige' }));

    expect(await screen.findByText('Décrivez le problème rencontré.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });
});

describe('DisputeThreadScreen', () => {
  it('présente le dossier et son fil', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/disputes/${ID}`).reply(200, dispute);
    await renderWithProviders(<DisputeThreadScreen disputeId={ID} />, {
      api,
      translations: [disputesTranslations],
    });

    expect(await screen.findByText(dispute.data.description)).toBeOnTheScreen();
    expect(screen.getByText(dispute.data.messages[0]!.message)).toBeOnTheScreen();
  });

  it('ajoute un message au dossier', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/disputes/${ID}`).reply(200, dispute);
    mock.onPost(`/disputes/${ID}/message`).reply(200, messageAdded);
    const sessionStore = createSessionStore();
    sessionStore.getState().setAuthenticated(buildSessionUser('client'));
    await renderWithProviders(<DisputeThreadScreen disputeId={ID} />, {
      api,
      translations: [disputesTranslations],
      sessionStore,
    });
    const user = userEvent.setup();

    await screen.findByText(dispute.data.description);
    await user.type(screen.getByLabelText('Votre message'), 'La prise est toujours descellée.');
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      message: 'La prise est toujours descellée.',
    });
    expect(await screen.findByText('Message ajouté au dossier.')).toBeOnTheScreen();
  });

  it('ferme la saisie sur un litige résolu', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/disputes/${ID}`).reply(200, {
      data: { ...dispute.data, status: 'resolved', resolution: 'Remboursement de 5 000 FCFA' },
    });
    await renderWithProviders(<DisputeThreadScreen disputeId={ID} />, {
      api,
      translations: [disputesTranslations],
    });

    expect(
      await screen.findByText('Ce litige est clos : aucun message ne peut plus y être ajouté.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Envoyer' })).toBeNull();
    expect(screen.getByText('Décision : Remboursement de 5 000 FCFA')).toBeOnTheScreen();
  });
});
