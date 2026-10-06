import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { JobsRoute } from './JobsRoute';
import { MissionRoute } from './MissionRoute';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockCockpitProps: {
  current?: {
    onOpenHistory: () => void;
    onOpenQuotes?: (requestId: string) => void;
    onContact?: (userId: string) => void;
  };
} = {};
const mockJobsProps: { current?: { onOpen: (id: string) => void } } = {};

jest.mock('@/features/missions', () => ({
  MissionCockpitScreen: (props: {
    onOpenHistory: () => void;
    onOpenQuotes?: (requestId: string) => void;
    onContact?: (userId: string) => void;
  }) => {
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

  it('ouvre les devis depuis le cockpit', async () => {
    await render(<MissionRoute />);

    mockCockpitProps.current?.onOpenQuotes?.('r1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/quotes/[requestId]',
      params: { requestId: 'r1' },
    });
  });

  it('ouvre une conversation depuis le cockpit', async () => {
    await render(<MissionRoute />);

    mockCockpitProps.current?.onContact?.('u2');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/conversations/new',
      params: { member: 'u2' },
    });
  });
});
