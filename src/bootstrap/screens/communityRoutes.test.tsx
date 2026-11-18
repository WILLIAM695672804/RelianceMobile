import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { FeedRoute } from './FeedRoute';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockFeedProps: { current?: { onOpen: (id: string) => void; onCompose: () => void } } = {};

jest.mock('@/features/social', () => ({
  FeedContainer: (props: { onOpen: (id: string) => void; onCompose: () => void }) => {
    mockFeedProps.current = props;
    return null;
  },
}));

describe('routes du fil', () => {
  it('ouvre une publication depuis le fil', async () => {
    await render(<FeedRoute />);

    mockFeedProps.current?.onOpen('p1');
    mockFeedProps.current?.onCompose();

    expect(router.push).toHaveBeenCalledWith({ pathname: '/posts/[id]', params: { id: 'p1' } });
    expect(router.push).toHaveBeenCalledWith('/compose');
  });
});
