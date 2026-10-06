import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import quoteCreated from '@/test/fixtures/billing/quote-created.json';
import quoteSent from '@/test/fixtures/billing/quote-sent.json';
import { renderWithProviders } from '@/test/render';

import { billingTranslations } from '../i18n';
import { QuoteEditorCard } from './QuoteEditorCard';

const NBSP = ' ';
const REQUEST_ID = quoteCreated.data.request_id;
const QUOTE_ID = quoteCreated.data.id;

async function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  await renderWithProviders(<QuoteEditorCard requestId={REQUEST_ID} />, {
    api,
    translations: [billingTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('QuoteEditorCard', () => {
  it('additionne les lignes saisies et préremplit le total', async () => {
    const { user } = await setup();

    await fireEvent.changeText(screen.getByLabelText('Intitulé de la ligne'), 'Main d’œuvre');
    await fireEvent.changeText(screen.getByLabelText('Montant de la ligne (FCFA)'), '12000');
    await user.press(screen.getByRole('button', { name: 'Ajouter la ligne' }));

    await fireEvent.changeText(screen.getByLabelText('Intitulé de la ligne'), 'Pièces');
    await fireEvent.changeText(screen.getByLabelText('Montant de la ligne (FCFA)'), '6000');
    await user.press(screen.getByRole('button', { name: 'Ajouter la ligne' }));

    expect(screen.getByText(`Total des lignes : 18${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Montant total (FCFA)')).toHaveDisplayValue('18000');
  });

  it('refuse une ligne sans intitulé ou au montant non entier', async () => {
    const { user } = await setup();

    await user.press(screen.getByRole('button', { name: 'Ajouter la ligne' }));
    expect(await screen.findByText('Indiquez l’intitulé de la ligne.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Intitulé de la ligne'), 'Pièces');
    await fireEvent.changeText(screen.getByLabelText('Montant de la ligne (FCFA)'), '6 000');
    await user.press(screen.getByRole('button', { name: 'Ajouter la ligne' }));
    expect(await screen.findByText('Indiquez un montant entier en FCFA.')).toBeOnTheScreen();
  });

  it('enregistre un brouillon avec son détail', async () => {
    const { mock, user } = await setup();
    mock.onPost('/quotes').reply(201, quoteCreated);

    await fireEvent.changeText(screen.getByLabelText('Intitulé de la ligne'), 'Main d’œuvre');
    await fireEvent.changeText(screen.getByLabelText('Montant de la ligne (FCFA)'), '12000');
    await user.press(screen.getByRole('button', { name: 'Ajouter la ligne' }));
    await fireEvent.changeText(screen.getByLabelText('Validité (jours)'), '7');
    await user.press(screen.getByRole('button', { name: 'Enregistrer le brouillon' }));

    expect(await screen.findByText('Brouillon enregistré.')).toBeOnTheScreen();
    const body = JSON.parse(mock.history.post[0]?.data as string);
    expect(body).toMatchObject({
      request_id: REQUEST_ID,
      total_amount: 12000,
      breakdown: [{ label: 'Main d’œuvre', amount: 12000 }],
    });
    expect(body.valid_until).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('enregistre puis envoie le devis', async () => {
    const { mock, user } = await setup();
    mock.onPost('/quotes').reply(201, quoteCreated);
    mock.onPost(`/quotes/${QUOTE_ID}/send`).reply(200, quoteSent);

    await fireEvent.changeText(screen.getByLabelText('Montant total (FCFA)'), '18000');
    await user.press(screen.getByRole('button', { name: 'Enregistrer et envoyer' }));

    expect(await screen.findByText('Devis envoyé au client.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.post).toHaveLength(2));
  });

  it('signale l’échec du serveur', async () => {
    const { mock, user } = await setup();
    mock.onPost('/quotes').reply(500, {});

    await fireEvent.changeText(screen.getByLabelText('Montant total (FCFA)'), '18000');
    await user.press(screen.getByRole('button', { name: 'Enregistrer le brouillon' }));

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
  });
});
