import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore, type Role } from '@/core/session';
import appointmentConfirmed from '@/test/fixtures/planning/appointment-confirmed.json';
import appointmentCreated from '@/test/fixtures/planning/appointment-created.json';
import appointments from '@/test/fixtures/planning/appointments.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { planningTranslations } from '../i18n';
import { AppointmentsScreen } from './AppointmentsScreen';
import { NewAppointmentScreen } from './NewAppointmentScreen';

const APPOINTMENT = appointments.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

async function setupList(role: Role, list: unknown = appointments) {
  const { api, mock } = setupApi();
  mock.onGet('/appointments').reply(200, list);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser(role));
  await renderWithProviders(<AppointmentsScreen />, {
    api,
    sessionStore,
    translations: [planningTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('AppointmentsScreen', () => {
  it('liste les rendez-vous avec leur statut', async () => {
    await setupList('client');

    expect(await screen.findByText(`Demande : ${APPOINTMENT.request.title}`)).toBeOnTheScreen();
    expect(screen.getByText('Planifié')).toBeOnTheScreen();
    expect(screen.getByText(/^Le \d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}$/)).toBeOnTheScreen();
    expect(screen.getByText('Technicien : Technicien Démo')).toBeOnTheScreen();
  });

  it('n’offre aucune action au client', async () => {
    await setupList('client');

    await screen.findByText('Planifié');
    expect(
      screen.queryByRole('button', { name: `Confirmer : ${APPOINTMENT.request.title}` }),
    ).not.toBeOnTheScreen();
  });

  it('laisse le technicien confirmer un rendez-vous', async () => {
    const { mock, user } = await setupList('technicien');
    mock.onPatch(`/appointments/${APPOINTMENT.id}/status`).reply(200, appointmentConfirmed);

    await user.press(
      await screen.findByRole('button', { name: `Confirmer : ${APPOINTMENT.request.title}` }),
    );

    expect(await screen.findByText('Rendez-vous mis à jour.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({ status: 'confirmed' });
  });

  it('annonce une liste vide', async () => {
    await setupList('technicien', { data: [] });

    expect(await screen.findByText('Aucun rendez-vous.')).toBeOnTheScreen();
  });
});

describe('NewAppointmentScreen', () => {
  it('planifie un rendez-vous', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/appointments').reply(201, appointmentCreated);
    const onCreated = jest.fn();
    await renderWithProviders(
      <NewAppointmentScreen requestId="r1" technicianId="t1" onCreated={onCreated} />,
      { api, translations: [planningTranslations] },
    );
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Date (AAAA-MM-JJ)'), '2026-12-01');
    await fireEvent.changeText(screen.getByLabelText('Heure (HH:MM)'), '09:00');
    await fireEvent.changeText(
      screen.getByLabelText('Note pour le client (facultative)'),
      'Prévoir l’accès au tableau.',
    );
    await user.press(screen.getByRole('button', { name: 'Planifier' }));

    expect(await screen.findByText('Rendez-vous planifié.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: 'r1',
      technician_id: 't1',
      scheduled_start: '2026-12-01T09:00:00',
      scheduled_end: '2026-12-01T11:00:00',
      notes: 'Prévoir l’accès au tableau.',
    });
    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
  });

  it('refuse une date mal formée', async () => {
    const { api, mock } = setupApi();
    await renderWithProviders(
      <NewAppointmentScreen requestId="r1" technicianId="t1" onCreated={jest.fn()} />,
      { api, translations: [planningTranslations] },
    );
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Date (AAAA-MM-JJ)'), '01/12/2026');
    await fireEvent.changeText(screen.getByLabelText('Heure (HH:MM)'), '09:00');
    await user.press(screen.getByRole('button', { name: 'Planifier' }));

    expect(await screen.findByText('Indiquez une date au format AAAA-MM-JJ.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('affiche l’erreur du serveur', async () => {
    const { api, mock } = setupApi();
    mock.onPost('/appointments').reply(422, {
      message: 'Invalide',
      errors: { scheduled_start: ['La date doit être future.'] },
    });
    await renderWithProviders(
      <NewAppointmentScreen requestId="r1" technicianId="t1" onCreated={jest.fn()} />,
      { api, translations: [planningTranslations] },
    );
    const user = userEvent.setup();

    await fireEvent.changeText(screen.getByLabelText('Date (AAAA-MM-JJ)'), '2026-12-01');
    await fireEvent.changeText(screen.getByLabelText('Heure (HH:MM)'), '09:00');
    await user.press(screen.getByRole('button', { name: 'Planifier' }));

    expect(await screen.findByText('La date doit être future.')).toBeOnTheScreen();
  });
});
