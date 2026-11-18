import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import payment from '@/test/fixtures/wallet/payment.json';
import settled from '@/test/fixtures/wallet/payment-settled.json';
import { renderWithProviders } from '@/test/render';

import { walletTranslations } from '../i18n';
import { PaymentConfirmationScreen } from './PaymentConfirmationScreen';

const PAYMENT_ID = payment.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

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
