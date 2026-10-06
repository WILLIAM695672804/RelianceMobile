import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import appointmentsUpcoming from '@/test/fixtures/planning/appointments-upcoming.json';
import calendar from '@/test/fixtures/planning/calendar.json';
import calendarEmpty from '@/test/fixtures/planning/calendar-empty.json';
import exceptionCreated from '@/test/fixtures/planning/exception-created.json';
import exceptionDeleted from '@/test/fixtures/planning/exception-deleted.json';
import slotCreated from '@/test/fixtures/planning/slot-created.json';
import slotDeleted from '@/test/fixtures/planning/slot-deleted.json';
import { renderWithProviders } from '@/test/render';

import { planningTranslations } from '../i18n';
import { ExceptionsScreen } from './ExceptionsScreen';
import { PlanningScreen } from './PlanningScreen';
import { TimeSlotsScreen } from './TimeSlotsScreen';

const NBSP = ' ';
/** Calendrier sans créneau ni indisponibilité (la fixture capturée en comporte). */
const calendarWithoutSlots = {
  status: 'success',
  data: { ...calendarEmpty.data, recurring_slots: [], exceptions: [], appointments: [] },
};
const FIRST_SLOT = calendar.data.recurring_slots[0]!;
const FIRST_EXCEPTION = calendar.data.exceptions[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('PlanningScreen (E25)', () => {
  it('présente la charge, les compteurs et les prochains rendez-vous', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onGet('/appointments/upcoming').reply(200, appointmentsUpcoming);
    await renderWithProviders(
      <PlanningScreen
        onOpenSlots={jest.fn()}
        onOpenExceptions={jest.fn()}
        onOpenAppointments={jest.fn()}
      />,
      { api, translations: [planningTranslations] },
    );

    expect(
      await screen.findByText(
        `Charge de la quinzaine : ${calendar.data.insights.capacity_percent}${NBSP}%`,
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${calendar.data.insights.booked_hours} h réservées sur ${calendar.data.insights.total_hours} h déclarées`,
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(`Créneaux déclarés : ${calendar.data.recurring_slots.length}`),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(`Indisponibilités : ${calendar.data.exceptions.length}`),
    ).toBeOnTheScreen();
    expect(await screen.findByText('Prochains rendez-vous')).toBeOnTheScreen();
  });

  it('ouvre les trois écrans liés', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendarWithoutSlots);
    mock.onGet('/appointments/upcoming').reply(200, { data: [] });
    const onOpenSlots = jest.fn();
    const onOpenExceptions = jest.fn();
    const onOpenAppointments = jest.fn();
    await renderWithProviders(
      <PlanningScreen
        onOpenSlots={onOpenSlots}
        onOpenExceptions={onOpenExceptions}
        onOpenAppointments={onOpenAppointments}
      />,
      { api, translations: [planningTranslations] },
    );
    const user = userEvent.setup();

    expect(await screen.findByText('Aucun rendez-vous à venir.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Gérer mes créneaux' }));
    await user.press(screen.getByRole('button', { name: 'Gérer mes indisponibilités' }));
    await user.press(screen.getByRole('button', { name: 'Tous mes rendez-vous' }));

    expect(onOpenSlots).toHaveBeenCalledTimes(1);
    expect(onOpenExceptions).toHaveBeenCalledTimes(1);
    expect(onOpenAppointments).toHaveBeenCalledTimes(1);
  });
});

describe('TimeSlotsScreen', () => {
  it('liste les créneaux par jour et en ajoute un', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onPost('/technician/time-slots').reply(201, slotCreated);
    await renderWithProviders(<TimeSlotsScreen />, { api, translations: [planningTranslations] });
    const user = userEvent.setup();

    // « Lundi » est aussi le libellé du sélecteur de jour : on attend un créneau daté.
    expect(
      (await screen.findAllByText(new RegExp(`^${FIRST_SLOT.start_time.slice(0, 5)}`))).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Lundi').length).toBeGreaterThan(1);

    await user.press(screen.getByRole('button', { name: 'Choisir : Mardi' }));
    await fireEvent.changeText(screen.getByLabelText('Heure de début (HH:MM)'), '08:00');
    await fireEvent.changeText(screen.getByLabelText('Heure de fin (HH:MM)'), '17:00');
    await user.press(screen.getByRole('button', { name: 'Ajouter le créneau' }));

    expect(await screen.findByText('Créneau ajouté.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      day_of_week: 2,
      start_time: '08:00',
      end_time: '17:00',
      repeat_weekly: true,
    });
  });

  it('refuse une heure mal formée ou une fin antérieure', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendarWithoutSlots);
    await renderWithProviders(<TimeSlotsScreen />, { api, translations: [planningTranslations] });
    const user = userEvent.setup();

    await screen.findByText('Aucun créneau déclaré.');
    await fireEvent.changeText(screen.getByLabelText('Heure de début (HH:MM)'), '8h');
    await fireEvent.changeText(screen.getByLabelText('Heure de fin (HH:MM)'), '17:00');
    await user.press(screen.getByRole('button', { name: 'Ajouter le créneau' }));
    expect(await screen.findByText('Indiquez une heure au format HH:MM.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Heure de début (HH:MM)'), '18:00');
    await user.press(screen.getByRole('button', { name: 'Ajouter le créneau' }));
    expect(
      await screen.findByText('L’heure de fin doit suivre l’heure de début.'),
    ).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('retire un créneau', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onDelete(/\/technician\/time-slots\/.+/).reply(200, slotDeleted);
    await renderWithProviders(<TimeSlotsScreen />, { api, translations: [planningTranslations] });
    const user = userEvent.setup();

    const buttons = await screen.findAllByRole('button', { name: /^Retirer le créneau/ });
    await user.press(buttons[0]!);

    expect(await screen.findByText('Créneau retiré.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  });
});

describe('ExceptionsScreen', () => {
  it('liste les indisponibilités et en ajoute une', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onPost('/technician/exceptions').reply(201, exceptionCreated);
    await renderWithProviders(<ExceptionsScreen />, { api, translations: [planningTranslations] });
    const user = userEvent.setup();

    expect(
      await screen.findByText(/^Du \d{2}\/\d{2}\/\d{4} au \d{2}\/\d{2}\/\d{4}$/),
    ).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Début (AAAA-MM-JJ)'), '2026-10-09');
    await fireEvent.changeText(screen.getByLabelText('Fin (AAAA-MM-JJ)'), '2026-10-10');
    await fireEvent.changeText(screen.getByLabelText('Motif (facultatif)'), 'Congé');
    await user.press(screen.getByRole('button', { name: 'Ajouter l’indisponibilité' }));

    expect(await screen.findByText('Indisponibilité ajoutée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      start_ts: '2026-10-09T00:00:00',
      end_ts: '2026-10-10T23:59:00',
      reason: 'Congé',
    });
  });

  it('retire une indisponibilité et refuse une date mal formée', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technician/calendar').reply(200, calendar);
    mock.onDelete(`/technician/exceptions/${FIRST_EXCEPTION.id}`).reply(200, exceptionDeleted);
    await renderWithProviders(<ExceptionsScreen />, { api, translations: [planningTranslations] });
    const user = userEvent.setup();

    const buttons = await screen.findAllByRole('button', { name: /^Retirer l’indisponibilité/ });
    await user.press(buttons[0]!);
    expect(await screen.findByText('Indisponibilité retirée.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Début (AAAA-MM-JJ)'), '09/10/2026');
    await fireEvent.changeText(screen.getByLabelText('Fin (AAAA-MM-JJ)'), '2026-10-10');
    await user.press(screen.getByRole('button', { name: 'Ajouter l’indisponibilité' }));
    expect(await screen.findByText('Indiquez une date au format AAAA-MM-JJ.')).toBeOnTheScreen();
  });
});
