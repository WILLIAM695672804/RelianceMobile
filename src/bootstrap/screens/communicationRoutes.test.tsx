import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ConversationsRoute } from './ConversationsRoute';
import { NotificationsRoute } from './NotificationsRoute';
import { StartChatRoute } from './StartChatRoute';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ member: 'u2', subject: 'Intervention' }),
}));

const mockNotificationsProps: { current?: { onOpenSettings: () => void } } = {};
const mockConversationsProps: { current?: { onOpen: (id: string) => void } } = {};
const mockStartProps: {
  current?: { memberId: string; subject?: string; onOpened: (id: string) => void };
} = {};

jest.mock('@/features/notifications', () => ({
  NotificationsScreen: (props: { onOpenSettings: () => void }) => {
    mockNotificationsProps.current = props;
    return null;
  },
}));

jest.mock('@/features/chat', () => ({
  ConversationsScreen: (props: { onOpen: (id: string) => void }) => {
    mockConversationsProps.current = props;
    return null;
  },
  StartChatScreen: (props: {
    memberId: string;
    subject?: string;
    onOpened: (id: string) => void;
  }) => {
    mockStartProps.current = props;
    return null;
  },
}));

describe('routes de communication', () => {
  it('ouvre les préférences depuis le centre de notifications', async () => {
    await render(<NotificationsRoute />);

    mockNotificationsProps.current?.onOpenSettings();

    expect(router.push).toHaveBeenCalledWith('/notification-settings');
  });

  it('ouvre un fil depuis la liste des conversations', async () => {
    await render(<ConversationsRoute />);

    mockConversationsProps.current?.onOpen('c1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/conversations/[id]',
      params: { id: 'c1' },
    });
  });

  it('remplace l’écran d’ouverture par le fil créé', async () => {
    await render(<StartChatRoute />);

    expect(mockStartProps.current?.memberId).toBe('u2');
    expect(mockStartProps.current?.subject).toBe('Intervention');
    mockStartProps.current?.onOpened('c1');

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/conversations/[id]',
      params: { id: 'c1' },
    });
  });
});
