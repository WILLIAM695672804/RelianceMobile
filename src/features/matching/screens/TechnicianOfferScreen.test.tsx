import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import proposalSent from '@/test/fixtures/matching/proposal-sent.json';
import selectValidationError from '@/test/fixtures/matching/select-validation-error.json';
import { buildServiceRequest } from '@/test/fixtures/serviceRequests';
import { renderWithProviders } from '@/test/render';

import { matchingTranslations } from '../i18n';
import { TechnicianOfferScreen } from './TechnicianOfferScreen';

const NBSP = ' ';

const profile = {
  id: 't1',
  name: 'Technicien Démo',
  email: 'technicien@example.test',
  phone: null,
  avatar_url: null,
  verified: true,
  rating: 4.8,
  num_reviews: 32,
  bio: 'Électricien certifié, installations résidentielles.',
  competences: [],
  kyc_approved: true,
  skills: [
    {
      id: 's1',
      name: 'Dépannage électrique',
      slug: 'depannage-electrique',
      category: 'Électricité',
      proficiency: 3,
      hourly_rate: '9000.00',
      travel_fee: '2000.00',
    },
  ],
  service_perimeter: { city: 'Yaoundé', address: null, zones: [], radius: 10 },
  badges: [],
  recent_reviews: [
    {
      id: 'v1',
      rating: 5,
      comment: 'Travail soigné.',
      reviewer: { name: 'Client Démo', avatar_url: null },
      created_at: '2026-09-10T10:00:00+00:00',
    },
  ],
};

async function setup(
  profileReply: [number, unknown] = [200, { status: 'success', data: profile }],
) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technicians/t1/profile').reply(...profileReply);
  mock.onGet('/requests/r1').reply(200, { status: 'success', data: buildServiceRequest() });
  const onSent = jest.fn();
  await renderWithProviders(
    <TechnicianOfferScreen requestId="r1" technicianId="t1" onSent={onSent} />,
    { api, translations: [matchingTranslations] },
  );
  return { mock, onSent, user: userEvent.setup() };
}

describe('TechnicianOfferScreen (E12)', () => {
  it('présente le profil public sans coordonnées et préremplit le prix indicatif', async () => {
    await setup();

    expect(await screen.findByText('Technicien Démo')).toBeOnTheScreen();
    expect(screen.getByText('Note : 4,8 / 5 (32 avis)')).toBeOnTheScreen();
    expect(screen.getByText('Zone d’intervention : Yaoundé')).toBeOnTheScreen();
    expect(
      screen.getByText('Électricien certifié, installations résidentielles.'),
    ).toBeOnTheScreen();
    expect(screen.getByText(`9${NBSP}000${NBSP}FCFA de l’heure`)).toBeOnTheScreen();
    expect(screen.getByText('5,0 / 5 — Client Démo')).toBeOnTheScreen();
    expect(screen.getByText('Travail soigné.')).toBeOnTheScreen();
    expect(screen.queryByText('technicien@example.test')).not.toBeOnTheScreen();
    expect(screen.getByText(`Prix indicatif estimé : 15${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Prix proposé (FCFA)')).toHaveDisplayValue('15000');
  });

  it('envoie la proposition puis rend la main', async () => {
    const { mock, onSent, user } = await setup();
    mock.onPost('/requests/r1/select-technician').reply(201, proposalSent);
    await screen.findByText('Technicien Démo');

    await fireEvent.changeText(screen.getByLabelText('Prix proposé (FCFA)'), '12000');
    await fireEvent.changeText(
      screen.getByLabelText('Message au technicien (facultatif)'),
      'Passez demain matin.',
    );
    await user.press(screen.getByRole('button', { name: 'Envoyer la proposition' }));

    await waitFor(() => expect(onSent).toHaveBeenCalledTimes(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      technician_id: 't1',
      price: 12000,
      message: 'Passez demain matin.',
    });
  });

  it('refuse un prix non entier', async () => {
    const { mock, user } = await setup();
    await screen.findByText('Technicien Démo');

    await fireEvent.changeText(screen.getByLabelText('Prix proposé (FCFA)'), '12,5');
    await user.press(screen.getByRole('button', { name: 'Envoyer la proposition' }));

    expect(await screen.findByText('Indiquez un prix entier en FCFA.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('affiche les erreurs de validation du serveur', async () => {
    const { mock, onSent, user } = await setup();
    mock.onPost('/requests/r1/select-technician').reply(422, selectValidationError);
    await screen.findByText('Technicien Démo');

    await user.press(screen.getByRole('button', { name: 'Envoyer la proposition' }));

    expect(
      await screen.findByText(selectValidationError.errors.technician_id[0] ?? ''),
    ).toBeOnTheScreen();
    expect(onSent).not.toHaveBeenCalled();
  });

  it('signale un technicien introuvable', async () => {
    await setup([404, { message: 'Not found' }]);

    expect(await screen.findByText('Élément introuvable.')).toBeOnTheScreen();
  });
});
