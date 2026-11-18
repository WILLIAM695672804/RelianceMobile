import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { AgencyRoute } from './AgencyRoute';
import { FeedRoute } from './FeedRoute';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockAgencyProps: { current?: { onOpenTeam: (id: string) => void } } = {};
const mockFeedProps: { current?: { onOpen: (id: string) => void; onCompose: () => void } } = {};

jest.mock('@/features/agency', () => ({
  AgencyScreen: (props: { onOpenTeam: (id: string) => void }) => {
    mockAgencyProps.current = props;
    return null;
  },
}));

jest.mock('@/features/social', () => ({
  FeedContainer: (props: { onOpen: (id: string) => void; onCompose: () => void }) => {
    mockFeedProps.current = props;
    return null;
  },
}));

describe('routes de l’agence et du fil', () => {
  it('ouvre l’équipe depuis l’espace agence', async () => {
    await render(<AgencyRoute />);

    mockAgencyProps.current?.onOpenTeam('a1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/agency/team/[id]',
      params: { id: 'a1' },
    });
  });

  it('ouvre une publication depuis le fil', async () => {
    await render(<FeedRoute />);

    mockFeedProps.current?.onOpen('p1');
    mockFeedProps.current?.onCompose();

    expect(router.push).toHaveBeenCalledWith({ pathname: '/posts/[id]', params: { id: 'p1' } });
    expect(router.push).toHaveBeenCalledWith('/compose');
  });
});
