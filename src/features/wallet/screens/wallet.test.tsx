import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import transactions from '@/test/fixtures/wallet/transactions.json';
import wallet from '@/test/fixtures/wallet/wallet.json';
import { renderWithProviders } from '@/test/render';

import { walletTranslations } from '../i18n';
import { RechargeScreen } from './RechargeScreen';
import { WalletScreen } from './WalletScreen';
import { WithdrawScreen } from './WithdrawScreen';

const NBSP = ' ';

const funded = {
  data: { ...wallet.data, balance: 42000, available_balance: 32000, held_amount: 10000 },
};
const movements = {
  data: [
    {
      id: 't1',
      amount: '12000.00',
      balance_after: '42000.00',
      type: 'credit',
      meta: { type: 'mission' },
      created_at: '2026-10-06T10:00:00.000000Z',
    },
  ],
};

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('WalletScreen (E19)', () => {
  it('présente les soldes et les derniers mouvements', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/wallet').reply(200, funded);
    mock.onGet('/wallet/transactions').reply(200, movements);
    await renderWithProviders(<WalletScreen onRecharge={jest.fn()} onWithdraw={jest.fn()} />, {
      api,
      translations: [walletTranslations],
    });

    expect(await screen.findByText(`42${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('Solde disponible')).toBeOnTheScreen();
    expect(screen.getByText(`32${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText(`10${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(await screen.findByText('Crédit')).toBeOnTheScreen();
    expect(screen.getByText(`12${NBSP}000${NBSP}FCFA — 06/10/2026`)).toBeOnTheScreen();
  });

  it('annonce un historique vide et ouvre les deux formulaires', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/wallet').reply(200, wallet);
    mock.onGet('/wallet/transactions').reply(200, transactions);
    const onRecharge = jest.fn();
    const onWithdraw = jest.fn();
    await renderWithProviders(<WalletScreen onRecharge={onRecharge} onWithdraw={onWithdraw} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Aucun mouvement enregistré.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Recharger' }));
    await user.press(screen.getByRole('button', { name: 'Demander un retrait' }));

    expect(onRecharge).toHaveBeenCalledTimes(1);
    expect(onWithdraw).toHaveBeenCalledTimes(1);
  });

  it('propose de réessayer après un échec', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/wallet').reply(500, {});
    mock.onGet('/wallet/transactions').reply(500, {});
    await renderWithProviders(<WalletScreen onRecharge={jest.fn()} onWithdraw={jest.fn()} />, {
      api,
      translations: [walletTranslations],
    });

    expect(
      (await screen.findAllByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'))
        .length,
    ).toBeGreaterThan(0);
  });
});

describe('RechargeScreen (E20)', () => {
  it('exige le téléphone pour le mobile money puis envoie la demande', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/wallet/recharge').reply(200, { message: 'Paiement initié', status: 'pending' });
    const onDone = jest.fn();
    await renderWithProviders(<RechargeScreen onDone={onDone} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Montant (FCFA)'), '5000');
    await user.press(screen.getByRole('button', { name: 'Lancer la recharge' }));
    expect(
      await screen.findByText('Indiquez le numéro associé au compte mobile.'),
    ).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Numéro de téléphone'), '600000000');
    await user.press(screen.getByRole('button', { name: 'Lancer la recharge' }));

    expect(await screen.findByText('Demande enregistrée : Paiement initié')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      amount: 5000,
      method: 'momo',
      phone_number: '600000000',
    });
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it('refuse un montant inférieur au minimum', async () => {
    const { api, mock } = setupApi();
    await renderWithProviders(<RechargeScreen onDone={jest.fn()} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Montant (FCFA)'), '50');
    await fireEvent.changeText(screen.getByLabelText('Numéro de téléphone'), '600000000');
    await user.press(screen.getByRole('button', { name: 'Lancer la recharge' }));

    expect(await screen.findByText('La recharge minimale est de 100 FCFA.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('affiche le refus de la passerelle', async () => {
    const { api, mock } = setupApi();
    mock
      .onPost('/wallet/recharge')
      .reply(422, { message: "Échec de l'initiation du paiement", status: 'failed' });
    await renderWithProviders(<RechargeScreen onDone={jest.fn()} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Montant (FCFA)'), '5000');
    await fireEvent.changeText(screen.getByLabelText('Numéro de téléphone'), '600000000');
    await user.press(screen.getByRole('button', { name: 'Lancer la recharge' }));

    expect(await screen.findByText("Échec de l'initiation du paiement")).toBeOnTheScreen();
  });

  it('n’exige pas de téléphone pour la carte bancaire', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/wallet/recharge').reply(200, { message: 'Paiement initié', status: 'pending' });
    await renderWithProviders(<RechargeScreen onDone={jest.fn()} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Montant (FCFA)'), '5000');
    await user.press(screen.getByRole('button', { name: 'Choisir : Carte bancaire' }));
    await user.press(screen.getByRole('button', { name: 'Lancer la recharge' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      amount: 5000,
      method: 'card',
    });
  });
});

describe('WithdrawScreen (E21)', () => {
  it('envoie la demande de retrait', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/wallet/withdraw').reply(200, { message: 'Demande de retrait enregistrée' });
    const onDone = jest.fn();
    await renderWithProviders(<WithdrawScreen onDone={onDone} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Montant (FCFA)'), '1000');
    await fireEvent.changeText(screen.getByLabelText('Numéro de téléphone'), '690000000');
    await user.press(screen.getByRole('button', { name: 'Envoyer la demande' }));

    expect(
      await screen.findByText('Demande enregistrée : Demande de retrait enregistrée'),
    ).toBeOnTheScreen();
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it('affiche le message d’un solde insuffisant', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/wallet/withdraw').reply(422, { message: 'Solde insuffisant' });
    await renderWithProviders(<WithdrawScreen onDone={jest.fn()} />, {
      api,
      translations: [walletTranslations],
    });
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Montant (FCFA)'), '400000');
    await fireEvent.changeText(screen.getByLabelText('Numéro de téléphone'), '690000000');
    await user.press(screen.getByRole('button', { name: 'Envoyer la demande' }));

    expect(await screen.findByText('Solde insuffisant')).toBeOnTheScreen();
  });
});
