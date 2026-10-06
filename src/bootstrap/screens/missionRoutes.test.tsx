import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { JobsRoute } from './JobsRoute';
import { MissionRoute } from './MissionRoute';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockCockpitProps: { current?: { onOpenHistory: () => void } } = {};
const mockJobsProps: { current?: { onOpen: (id: string) => void } } = {};

jest.mock('@/features/missions', () => ({
  MissionCockpitScreen: (props: { onOpenHistory: () => void }) => {
    mockCockpitProps.current = props;
    return null;
  },
  TechnicianJobsScreen: (props: { onOpen: (id: string) => void }) => {
    mockJobsProps.current = props;
    return null;
  },
}));

describe('routes du suivi d’intervention', () => {
  it('ouvre l’historique depuis le cockpit', async () => {
    await render(<MissionRoute />);

    mockCockpitProps.current?.onOpenHistory();

    expect(router.push).toHaveBeenCalledWith('/jobs');
  });

  it('ouvre le détail d’une mission depuis l’historique', async () => {
    await render(<JobsRoute />);

    mockJobsProps.current?.onOpen('j1');

    expect(router.push).toHaveBeenCalledWith({ pathname: '/jobs/[id]', params: { id: 'j1' } });
  });
});
