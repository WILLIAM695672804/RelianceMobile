import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import calendarFixture from '@/test/fixtures/planning/calendar.json';
import exceptionCreated from '@/test/fixtures/planning/exception-created.json';
import slotDeleted from '@/test/fixtures/planning/slot-deleted.json';
import { renderWithProviders } from '@/test/render';

import { planningTranslations } from '../i18n';
import { calendarResponseSchema } from '../schemas/planningSchemas';
import {
  AvailabilityContainer,
  BlockAgendaContainer,
  mondayOf,
  toWeeklyHours,
  weekEvents,
} from './PlanningContainers';

const CALENDAR = calendarResponseSchema.parse(calendarFixture).data;
const translations = [planningTranslations];

describe('modèle de la semaine', () => {
  it('mondayOf recule au lundi', () => {
    expect(mondayOf(new Date(2026, 9, 8)).getDate()).toBe(5);
  });

  it('place créneaux, congé et rendez-vous dans la semaine', () => {
    const events = weekEvents(CALENDAR, new Date(2026, 9, 5), { open: 'Libre', leave: 'Congé' });
    const sundaySlot = events.find((event) => event.id.startsWith('slot-') && event.day === 6);
    expect(sundaySlot).toMatchObject({ start: 9, end: 14, kind: 'open' });
    // Congé du vendredi 9 au samedi 10 octobre.
    expect(events.filter((event) => event.kind === 'leave').map((event) => event.day)).toEqual([
      4, 5,
    ]);
    expect(events.find((event) => event.id.startsWith('appointment-'))).toMatchObject({
      day: 2,
      start: 8,
      kind: 'pending',
    });
  });

  it('toWeeklyHours retient le premier créneau de chaque jour', () => {
    const week = toWeeklyHours(CALENDAR);
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ open: true, start: '09:00', end: '14:00' });
  });
});

function api() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(client);
  mock.onGet('/technician/calendar').reply(200, calendarFixture);
  return { client, mock };
}

describe('BlockAgendaContainer', () => {
  it('enregistre l’indisponibilité avec son motif', async () => {
    const { client, mock } = api();
    mock.onPost('/technician/exceptions').reply(201, exceptionCreated);
    const onDone = jest.fn();
    await renderWithProviders(<BlockAgendaContainer onDone={onDone} />, {
      api: client,
      translations,
    });

    await userEvent.setup().press(await screen.findByRole('button', { name: /Bloquer 1 jour/ }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(JSON.parse(mock.history.post[0]!.data as string).reason).toBe('Congé');
  });
});

describe('AvailabilityContainer', () => {
  it('supprime les créneaux d’un jour fermé', async () => {
    const { client, mock } = api();
    mock.onDelete(/\/technician\/time-slots\/.+/).reply(200, slotDeleted);
    const onBack = jest.fn();
    await renderWithProviders(<AvailabilityContainer onBack={onBack} />, {
      api: client,
      translations,
    });
    const user = userEvent.setup();

    await user.press(await screen.findByRole('switch', { name: /Dimanche/ }));
    await user.press(screen.getAllByRole('button', { name: 'Enregistrer' }).at(-1)!);

    await waitFor(() => expect(onBack).toHaveBeenCalled());
    const sunday = CALENDAR.recurring_slots.find((slot) => slot.day_of_week === 0)!;
    expect(mock.history.delete.map((request) => request.url)).toEqual([
      `/technician/time-slots/${sunday.id}`,
    ]);
    expect(mock.history.post).toHaveLength(0);
  });
});
