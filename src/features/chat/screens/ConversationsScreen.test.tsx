import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import conversations from '@/test/fixtures/chat/conversations.json';
import unreadCount from '@/test/fixtures/chat/unread-count.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { chatTranslations } from '../i18n';
import { ConversationsScreen } from './ConversationsScreen';

const FIRST = conversations.data[0]!;

async function setup(list: unknown = conversations) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/conversations').reply(200, list);
  mock.onGet('/conversations/unread-count').reply(200, unreadCount);
  const sessionStore = createSessionStore();
  sessionStore
    .getState()
    .setAuthenticated(buildSessionUser('client', { id: FIRST.members[1]!.user_id }));
  const onOpen = jest.fn();
  await renderWithProviders(<ConversationsScreen onOpen={onOpen} />, {
    api,
    sessionStore,
    translations: [chatTranslations],
  });
  return { mock, onOpen, user: userEvent.setup() };
}

describe('ConversationsScreen (E24)', () => {
  it('liste les conversations avec leur dernier message', async () => {
    const { onOpen, user } = await setup();

    expect(await screen.findByText(FIRST.subject)).toBeOnTheScreen();
    expect(
      screen.getByText(`${FIRST.last_message.sender.name} : ${FIRST.last_message.body}`),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: `Ouvrir : ${FIRST.subject}` }));
    expect(onOpen).toHaveBeenCalledWith(FIRST.id);
  });

  it('annonce une messagerie vide', async () => {
    await setup({ data: [] });

    expect(await screen.findByText('Aucune conversation.')).toBeOnTheScreen();
  });
});
