import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import quoteAcceptError from '@/test/fixtures/billing/quote-accept-error.json';
import quoteAccepted from '@/test/fixtures/billing/quote-accepted.json';
import quotes from '@/test/fixtures/billing/quotes.json';
import requestDetail from '@/test/fixtures/requests/request-detail.json';
import { renderWithProviders } from '@/test/render';

import { billingTranslations } from '../i18n';
import { quoteListResponseSchema } from '../schemas/billingSchemas';
import { ClientQuoteContainer, pendingQuote, quoteLines } from './ClientQuoteContainer';

const parsed = quoteListResponseSchema.parse(quotes).data;
const LATEST = parsed[0]!;
const REQUEST_ID = 'r1';
const labels = { flat: 'Intervention', other: 'Autres prestations' };

describe('quoteLines', () => {
  it('reprend la ventilation qui couvre le total', () => {
    expect(quoteLines(parsed[1]!, labels).map((line) => line.unitPrice)).toEqual([12000, 6000]);
  });

  it('se replie sur une ligne forfaitaire sans ventilation', () => {
    expect(quoteLines(LATEST, labels)).toEqual([
      { label: 'Intervention', quantity: 1, unitPrice: 25000 },
    ]);
  });

  it('complète une ventilation partielle par une ligne d’écart', () => {
    const partial = { ...LATEST, breakdown: [{ label: 'Pièces', amount: 5000 }] };
    expect(quoteLines(partial, labels).at(-1)).toEqual({
      label: 'Autres prestations',
      quantity: 1,
      unitPrice: 20000,
    });
  });
});

it('pendingQuote retient le plus récent des devis envoyés', () => {
  expect(pendingQuote(parsed)?.id).toBe(LATEST.id);
  expect(pendingQuote(parsed.map((quote) => ({ ...quote, status: 'accepted' })))).toBeNull();
});

async function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet(`/requests/${REQUEST_ID}/quotes`).reply(200, quotes);
  mock.onGet(`/requests/${REQUEST_ID}`).reply(200, requestDetail);
  const props = { onBack: jest.fn(), onAccepted: jest.fn() };
  await renderWithProviders(<ClientQuoteContainer requestId={REQUEST_ID} {...props} />, {
    api,
    translations: [billingTranslations],
  });
  return { mock, props, user: userEvent.setup() };
}

describe('ClientQuoteContainer', () => {
  it('accepte le devis après adhésion aux conditions', async () => {
    const { mock, props, user } = await setup();
    mock.onPost(`/quotes/${LATEST.id}/accept`).reply(200, quoteAccepted);

    await user.press(
      await screen.findByRole('checkbox', {
        name: 'J’accepte les conditions et la signature électronique.',
      }),
    );
    await user.press(screen.getByRole('button', { name: 'Signer et bloquer le séquestre' }));

    await waitFor(() => expect(props.onAccepted).toHaveBeenCalled());
  });

  it('signale un refus du serveur sans quitter le devis', async () => {
    const { mock, props, user } = await setup();
    mock.onPost(`/quotes/${LATEST.id}/accept`).reply(422, quoteAcceptError);

    await user.press(
      await screen.findByRole('checkbox', {
        name: 'J’accepte les conditions et la signature électronique.',
      }),
    );
    await user.press(screen.getByRole('button', { name: 'Signer et bloquer le séquestre' }));

    expect(await screen.findByText(quoteAcceptError.message)).toBeOnTheScreen();
    expect(props.onAccepted).not.toHaveBeenCalled();
  });

  it('refuse le devis puis revient en arrière', async () => {
    const { mock, props, user } = await setup();
    mock.onPost(`/quotes/${LATEST.id}/reject`).reply(200, { message: 'ok', data: LATEST });

    await user.press(await screen.findByRole('button', { name: 'Refuser' }));

    await waitFor(() => expect(props.onBack).toHaveBeenCalled());
  });
});
