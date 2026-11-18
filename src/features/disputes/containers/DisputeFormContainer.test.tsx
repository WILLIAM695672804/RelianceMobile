import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import created from '@/test/fixtures/disputes/dispute-created.json';
import requestDetail from '@/test/fixtures/requests/request-detail.json';
import holds from '@/test/fixtures/wallet/holds.json';
import { renderWithProviders } from '@/test/render';

import { disputesTranslations } from '../i18n';
import { DisputeFormContainer } from './DisputeFormContainer';

const REQUEST_ID = 'r1';

async function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet(`/requests/${REQUEST_ID}`).reply(200, requestDetail);
  mock.onGet('/holds').reply(200, holds);
  const props = { onBack: jest.fn(), onOpened: jest.fn() };
  await renderWithProviders(
    <DisputeFormContainer requestId={REQUEST_ID} against="t1" {...props} />,
    { api, translations: [disputesTranslations] },
  );
  return { mock, props, user: userEvent.setup() };
}

describe('DisputeFormContainer', () => {
  it('ouvre le litige avec le motif et la description', async () => {
    const { mock, props, user } = await setup();
    mock.onPost('/disputes').reply(201, created);

    await user.press(await screen.findByRole('radio', { name: /Retard excessif/ }));
    await fireEvent.changeText(
      screen.getByLabelText('Décrivez la situation'),
      'Le technicien est arrivé avec trois heures de retard.',
    );
    await user.press(screen.getByRole('button', { name: 'Ouvrir le litige' }));

    await waitFor(() => expect(props.onOpened).toHaveBeenCalledWith(created.data.id));
    expect(JSON.parse(mock.history.post[0]!.data as string)).toEqual({
      request_id: REQUEST_ID,
      against: 't1',
      reason: 'delay',
      description: 'Le technicien est arrivé avec trois heures de retard.',
    });
    expect(screen.queryByRole('button', { name: 'Ajouter une preuve' })).toBeNull();
  });

  it('exige une description avant tout envoi', async () => {
    const { mock, user } = await setup();

    await user.press(await screen.findByRole('radio', { name: /Retard excessif/ }));
    await user.press(screen.getByRole('button', { name: 'Ouvrir le litige' }));

    expect(await screen.findByText('Décrivez le problème rencontré.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });
});
