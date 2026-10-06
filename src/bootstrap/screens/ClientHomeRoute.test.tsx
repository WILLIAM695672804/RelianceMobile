import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ClientHomeRoute } from './ClientHomeRoute';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockCapturedProps: {
  current?: {
    onNewRequest: () => void;
    onOpenRequest: (id: string) => void;
    onOpenAll?: () => void;
  };
} = {};

jest.mock('@/features/requests', () => ({
  ClientHomeScreen: (props: { onNewRequest: () => void; onOpenRequest: (id: string) => void }) => {
    mockCapturedProps.current = props;
    return null;
  },
}));

describe('ClientHomeRoute', () => {
  it('relie l’accueil client aux routes des demandes', async () => {
    await render(<ClientHomeRoute />);

    mockCapturedProps.current?.onNewRequest();
    mockCapturedProps.current?.onOpenRequest('r1');

    expect(router.push).toHaveBeenNthCalledWith(1, '/requests/new');
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: '/requests/[id]',
      params: { id: 'r1' },
    });
  });

  it('ouvre la liste complète des demandes', async () => {
    await render(<ClientHomeRoute />);

    mockCapturedProps.current?.onOpenAll?.();

    expect(router.push).toHaveBeenCalledWith('/requests');
  });
});
