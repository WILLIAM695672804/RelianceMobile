import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { NewAppointmentRoute } from './NewAppointmentRoute';
import { PlanningRoute } from './PlanningRoute';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ requestId: 'r1', technicianId: 't1' }),
}));

const mockPlanningProps: {
  current?: {
    onAvailability: () => void;
    onBlock: () => void;
    onAppointments: () => void;
  };
} = {};
const mockAppointmentProps: {
  current?: { requestId: string; technicianId: string; onCreated: () => void };
} = {};

jest.mock('@/features/planning', () => ({
  PlanningWeekContainer: (props: NonNullable<typeof mockPlanningProps.current>) => {
    mockPlanningProps.current = props;
    return null;
  },
  NewAppointmentScreen: (props: {
    requestId: string;
    technicianId: string;
    onCreated: () => void;
  }) => {
    mockAppointmentProps.current = props;
    return null;
  },
}));

describe('routes du planning', () => {
  it('ouvre les créneaux, les indisponibilités et les rendez-vous', async () => {
    await render(<PlanningRoute />);

    mockPlanningProps.current?.onAvailability();
    mockPlanningProps.current?.onBlock();
    mockPlanningProps.current?.onAppointments();

    expect(router.push).toHaveBeenCalledWith('/planning/time-slots');
    expect(router.push).toHaveBeenCalledWith('/planning/exceptions');
    expect(router.push).toHaveBeenCalledWith('/appointments');
  });

  it('revient en arrière après la planification d’un rendez-vous', async () => {
    await render(<NewAppointmentRoute />);

    expect(mockAppointmentProps.current?.requestId).toBe('r1');
    expect(mockAppointmentProps.current?.technicianId).toBe('t1');
    mockAppointmentProps.current?.onCreated();

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
