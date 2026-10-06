import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { DirectoryRoute } from './DirectoryRoute';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockCapturedProps: { current?: { onOpen: (id: string) => void } } = {};

jest.mock('@/features/directory', () => ({
  TechnicianDirectoryScreen: (props: { onOpen: (id: string) => void }) => {
    mockCapturedProps.current = props;
    return null;
  },
}));

describe('DirectoryRoute', () => {
  it('ouvre le profil public du technicien choisi', async () => {
    await render(<DirectoryRoute />);

    mockCapturedProps.current?.onOpen('t1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/technicians/[id]',
      params: { id: 't1' },
    });
  });
});
