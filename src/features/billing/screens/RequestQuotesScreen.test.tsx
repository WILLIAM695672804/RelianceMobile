import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore, type Role } from '@/core/session';
import quoteAccepted from '@/test/fixtures/billing/quote-accepted.json';
import quoteCreated from '@/test/fixtures/billing/quote-created.json';
import quoteRejected from '@/test/fixtures/billing/quote-rejected.json';
import quoteSent from '@/test/fixtures/billing/quote-sent.json';
import quotes from '@/test/fixtures/billing/quotes.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { billingTranslations } from '../i18n';
import { RequestQuotesScreen } from './RequestQuotesScreen';

const NBSP = ' ';
const REQUEST_ID = quoteCreated.data.request_id;
const QUOTE_ID = quoteCreated.data.id;

/** Devis en brouillon (envoyable par le technicien). */
const draftQuotes = { data: [quoteCreated.data] };
/** Devis envoyé (décidable par le client). */
const sentQuotes = { data: [quoteSent.data] };

async function setup(role: Role, list: unknown = quotes) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet(`/requests/${REQUEST_ID}/quotes`).reply(200, list);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser(role));
  const onOpenInvoices = jest.fn();
  await renderWithProviders(
    <RequestQuotesScreen requestId={REQUEST_ID} onOpenInvoices={onOpenInvoices} />,
    { api, sessionStore, translations: [billingTranslations] },
  );
  return { mock, onOpenInvoices, user: userEvent.setup() };
}

describe('RequestQuotesScreen (E17)', () => {
  it('présente les devis et leur détail chiffré', async () => {
    await setup('client');

    expect(await screen.findByText(`Montant total : 18${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    const line = quoteCreated.data.breakdown[0]!;
    expect(screen.getByText(`${line.label} : 12${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getAllByText('Envoyé').length).toBeGreaterThan(0);
  });

  it('propose au technicien de rédiger un devis et d’envoyer un brouillon', async () => {
    const { mock, user } = await setup('technicien', draftQuotes);
    mock.onPost(`/quotes/${QUOTE_ID}/send`).reply(200, quoteSent);

    expect(await screen.findByText('Brouillon')).toBeOnTheScreen();
    expect(screen.getByText('Nouveau devis')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Envoyer au client' }));

    expect(await screen.findByText('Devis envoyé au client.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
  });

  it('n’offre aucune action d’émission au client', async () => {
    await setup('client', draftQuotes);

    expect(await screen.findByText('Brouillon')).toBeOnTheScreen();
    expect(screen.queryByText('Nouveau devis')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Envoyer au client' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Accepter le devis' })).not.toBeOnTheScreen();
  });

  it('laisse le client accepter un devis envoyé', async () => {
    const { mock, onOpenInvoices, user } = await setup('client', sentQuotes);
    mock.onPost(`/quotes/${QUOTE_ID}/accept`).reply(200, quoteAccepted);

    await user.press(await screen.findByRole('button', { name: 'Accepter le devis' }));
    expect(
      screen.getByText(
        `Le devis de 18${NBSP}000${NBSP}FCFA sera accepté et une facture sera émise.`,
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Accepter' }));

    expect(await screen.findByText(/^Devis accepté : facture .+ émise\.$/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Voir mes factures' }));
    expect(onOpenInvoices).toHaveBeenCalledTimes(1);
  });

  it('laisse le client refuser un devis envoyé', async () => {
    const { mock, user } = await setup('client', sentQuotes);
    mock.onPost(`/quotes/${QUOTE_ID}/reject`).reply(200, quoteRejected);

    await user.press(await screen.findByRole('button', { name: 'Refuser le devis' }));
    await user.press(screen.getByRole('button', { name: 'Refuser' }));

    expect(await screen.findByText('Devis refusé.')).toBeOnTheScreen();
  });

  it('affiche le message du serveur quand le devis n’est plus acceptable', async () => {
    const { mock, user } = await setup('client', sentQuotes);
    mock
      .onPost(`/quotes/${QUOTE_ID}/accept`)
      .reply(422, { message: 'Ce devis ne peut plus être accepté' });

    await user.press(await screen.findByRole('button', { name: 'Accepter le devis' }));
    await user.press(screen.getByRole('button', { name: 'Accepter' }));

    expect(await screen.findByText('Ce devis ne peut plus être accepté')).toBeOnTheScreen();
  });

  it('annonce l’absence de devis', async () => {
    await setup('client', { data: [] });

    expect(await screen.findByText('Aucun devis reçu pour cette demande.')).toBeOnTheScreen();
  });
});
