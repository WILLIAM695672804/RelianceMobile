import {
  appointmentToneOf,
  DAY_ORDER,
  groupSlotsByDay,
  nextAppointmentStatuses,
  normalizeTime,
} from './schedule';

describe('modèle du planning', () => {
  it('ordonne la semaine du lundi au dimanche', () => {
    expect(DAY_ORDER).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('normalise une heure du serveur', () => {
    expect(normalizeTime('09:00:00')).toBe('09:00');
    expect(normalizeTime('08:30')).toBe('08:30');
    expect(normalizeTime(null)).toBe('');
  });

  it('regroupe les créneaux par jour, dans l’ordre de la semaine', () => {
    const groups = groupSlotsByDay([
      { id: 's1', day_of_week: 0, start_time: '09:00', end_time: '14:00' },
      { id: 's2', day_of_week: 1, start_time: '07:00', end_time: '20:00' },
      { id: 's3', day_of_week: 1, start_time: '21:00', end_time: '22:00' },
    ]);

    expect(groups.map((group) => group.day)).toEqual([1, 0]);
    expect(groups[0]?.slots).toHaveLength(2);
  });

  it('donne un ton et les transitions possibles d’un rendez-vous', () => {
    expect(appointmentToneOf('scheduled')).toBe('warning');
    expect(appointmentToneOf('confirmed')).toBe('success');
    expect(appointmentToneOf('cancelled')).toBe('danger');
    expect(appointmentToneOf(null)).toBe('neutral');

    expect(nextAppointmentStatuses('scheduled')).toEqual(['confirmed', 'cancelled']);
    expect(nextAppointmentStatuses('confirmed')).toEqual(['in_progress', 'cancelled', 'no_show']);
    expect(nextAppointmentStatuses('in_progress')).toEqual(['completed', 'cancelled']);
    expect(nextAppointmentStatuses('completed')).toEqual([]);
    expect(nextAppointmentStatuses(null)).toEqual(['confirmed', 'cancelled']);
  });
});
