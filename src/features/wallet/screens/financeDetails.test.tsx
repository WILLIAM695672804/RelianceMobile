import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import payment from '@/test/fixtures/wallet/payment.json';
import settled from '@/test/fixtures/wallet/payment-settled.json';
import transactions from '@/test/fixtures/wallet/transactions-credited.json';
import wallet from '@/test/fixtures/wallet/wallet.json';
import { renderWithProviders } from '@/test/render';

import { walletTranslations } from '../i18n';
import { PaymentConfirmationScreen } from './PaymentConfirmationScreen';
import { TransactionDetailScreen } from './TransactionDetailScreen';
import { WalletScreen } from './WalletScreen';

const TRANSACTION = transactions.data[0]!;
const PAYMENT_ID = payment.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('TransactionDetailScreen', () => {
  it('présente le mouvement, le solde et l’origine', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/wallet/transactions').reply(200, transactions);
    await renderWithProviders(<TransactionDetailScreen transactionId={TRANSACTION.id} />, {
      api,
      translations: [walletTranslations],
    });

    expect(await screen.findByText('25 000 FCFA')).toBeOnTheScreen();
    expect(screen.getByText('Solde après : 35 000 FCFA')).toBeOnTheScreen();
    expect(screen.getByText('Origine : recharge du portefeuille')).toBeOnTheScreen();
    expect(screen.getByText('Crédit')).toBeOnTheScreen();
  });

  it('annonce un mouvement introuvable', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/wallet/transactions').reply(200, { data: [] });
    await renderWithProviders(<TransactionDetailScreen transactionId="inconnu" />, {
      api,
      translations: [walletTranslations],
    });

    expect(
      await screen.findByText('Ce mouvement n’apparaît plus dans l’historique.'),
    ).toBeOnTheScreen();
  });
});

describe('WalletScreen', () => {
  it('ouvre le détail du mouvement pressé', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/wallet').reply(200, wallet);
    mock.onGet('/wallet/transactions').reply(200, transactions);
    const onOpenTransaction = jest.fn();
    await renderWithProviders(
      <WalletScreen
        onRecharge={jest.fn()}
        onWithdraw={jest.fn()}
        onOpenTransaction={onOpenTransaction}
      />,
      { api, translations: [walletTranslations] },
    );
    const user = userEvent.setup();

    // Deux recharges du même montant figurent dans les fixtures : le premier mouvement suffit.
    const cards = await screen.findAllByRole('button', {
      name: 'Ouvrir le mouvement de 25 000 FCFA',
    });
    await user.press(cards[0]!);

    expect(onOpenTransaction).toHaveBeenCalledWith(TRANSACTION.id);
  });
});

describe('PaymentConfirmationScreen', () => {
  it('présente la référence et l’état en attente', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/payments/${PAYMENT_ID}`).reply(200, payment);
    await renderWithProviders(
      <PaymentConfirmationScreen paymentId={PAYMENT_ID} onDone={jest.fn()} />,
      { api, translations: [walletTranslations] },
    );

    expect(await screen.findByText('En attente')).toBeOnTheScreen();
    expect(screen.getByText(`Référence : ${payment.data.external_ref}`)).toBeOnTheScreen();
    expect(screen.getByText('Moyen : Virement bancaire')).toBeOnTheScreen();
  });

  it('confirme le paiement', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/payments/${PAYMENT_ID}`).reply(200, payment);
    mock.onPost(`/payments/${PAYMENT_ID}/confirm`).reply(200, { message: 'Paiement confirmé' });
    await renderWithProviders(
      <PaymentConfirmationScreen paymentId={PAYMENT_ID} onDone={jest.fn()} />,
      { api, translations: [walletTranslations] },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'J’ai validé sur mon téléphone' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(
      await screen.findByText('Paiement confirmé : le portefeuille est crédité.'),
    ).toBeOnTheScreen();
  });

  it('n’offre pas de confirmer un paiement déjà réglé', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/payments/${PAYMENT_ID}`).reply(200, settled);
    const onDone = jest.fn();
    await renderWithProviders(
      <PaymentConfirmationScreen paymentId={PAYMENT_ID} onDone={onDone} />,
      { api, translations: [walletTranslations] },
    );
    const user = userEvent.setup();

    expect(await screen.findByText('Réglé')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'J’ai validé sur mon téléphone' })).toBeNull();

    await user.press(screen.getByRole('button', { name: 'Revenir au portefeuille' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
