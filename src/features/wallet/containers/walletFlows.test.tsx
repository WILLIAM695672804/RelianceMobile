import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import rechargeInitiated from '@/test/fixtures/wallet/recharge-initiated.json';
import credited from '@/test/fixtures/wallet/transactions-credited.json';
import wallet from '@/test/fixtures/wallet/wallet.json';
import withdrawInsufficient from '@/test/fixtures/wallet/withdraw-insufficient.json';
import { renderWithProviders } from '@/test/render';

import { walletTranslations } from '../i18n';
import { transactionPageSchema } from '../schemas/walletSchemas';
import { MoneyFlowContainer } from './MoneyFlowContainer';
import { TransactionContainer, toTransactionDetail } from './TransactionContainer';

const FUNDED = { data: { ...wallet.data, balance: 40000, available_balance: 40000 } };
const translations = [walletTranslations];

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/wallet').reply(200, FUNDED);
  return { api, mock };
}

function flowProps() {
  return { onBack: jest.fn(), onDone: jest.fn(), onPending: jest.fn() };
}

describe('MoneyFlowContainer', () => {
  it('recharge par mobile money et mène à la confirmation du paiement', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/wallet/recharge').reply(200, rechargeInitiated);
    const props = flowProps();
    await renderWithProviders(<MoneyFlowContainer mode="topUp" {...props} />, {
      api,
      translations,
    });
    const user = userEvent.setup();

    await fireEvent.changeText(await screen.findByLabelText('Numéro mobile money'), '670000000');
    await user.press(screen.getByRole('button', { name: 'Recharger · 10 000 FCFA' }));

    await waitFor(() => expect(props.onPending).toHaveBeenCalledWith(rechargeInitiated.payment_id));
    expect(JSON.parse(mock.history.post[0]!.data as string)).toEqual({
      amount: 10000,
      method: 'momo',
      phone_number: '670000000',
    });
  });

  it('n’envoie pas de demande de mobile money sans numéro', async () => {
    const { api, mock } = setupApi();
    await renderWithProviders(<MoneyFlowContainer mode="topUp" {...flowProps()} />, {
      api,
      translations,
    });

    const submit = await screen.findByRole('button', { name: 'Recharger · 10 000 FCFA' });
    expect(submit).toBeDisabled();
    expect(mock.history.post).toHaveLength(0);
  });

  it('relaie le refus d’un retrait par le serveur', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/wallet/withdraw').reply(422, withdrawInsufficient);
    const props = flowProps();
    await renderWithProviders(<MoneyFlowContainer mode="withdraw" {...props} />, {
      api,
      translations,
    });
    const user = userEvent.setup();

    await fireEvent.changeText(await screen.findByLabelText('Numéro mobile money'), '670000000');
    await user.press(screen.getByRole('button', { name: /Retirer · / }));

    expect(await screen.findByText('Solde insuffisant')).toBeOnTheScreen();
    expect(props.onPending).not.toHaveBeenCalled();
  });
});

describe('TransactionContainer', () => {
  const [entry] = transactionPageSchema.parse(credited).data;

  it('présente le mouvement en reçu', () => {
    const detail = toTransactionDetail(entry!, (key, options) =>
      typeof options?.defaultValue === 'string' && key.includes('transaction.') ? key : key,
    );
    expect(detail.amount).toBe(25000);
    expect(detail.rows.map((row) => row.label)).toEqual([
      'wallet:movement.date',
      'wallet:movement.balanceAfter',
      'wallet:movement.source',
      'wallet:movement.reference',
    ]);
  });

  it('relit le mouvement dans l’historique', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    new MockAdapter(api).onGet('/wallet/transactions').reply(200, credited);
    await renderWithProviders(
      <TransactionContainer transactionId={entry!.id} onBack={jest.fn()} />,
      {
        api,
        translations,
      },
    );
    expect(await screen.findByText('35 000 FCFA')).toBeOnTheScreen();
  });
});
