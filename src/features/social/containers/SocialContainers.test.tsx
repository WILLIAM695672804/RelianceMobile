import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import commentCreated from '@/test/fixtures/social/comment-created.json';
import comments from '@/test/fixtures/social/comments.json';
import feed from '@/test/fixtures/social/feed.json';
import likeToggled from '@/test/fixtures/social/like-toggled.json';
import postCreated from '@/test/fixtures/social/post-created.json';
import post from '@/test/fixtures/social/post.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { socialTranslations } from '../i18n';
import {
  ComposeContainer,
  FeedContainer,
  PostContainer,
  toFeedPost,
  toPostContent,
} from './SocialContainers';

const translations = [socialTranslations];
const t = (key: string) => key;

describe('mise en forme', () => {
  it('tire titre et corps du texte de la publication', () => {
    const shown = toFeedPost(
      {
        id: 'p',
        content: 'Astuce · Joint\nChanger le joint.',
        likes_count: 2,
        comments_count: 0,
        is_liked: true,
      },
      t,
    );
    expect(shown).toMatchObject({
      title: 'Astuce · Joint',
      body: 'Changer le joint.',
      likes: 2,
      liked: true,
    });
  });

  it('compose le texte publié', () => {
    expect(
      toPostContent(
        { kind: 'tip', title: 'Joint', body: 'Changer le joint.', tags: ['plomberie'] },
        'Astuce',
      ),
    ).toBe('Astuce · Joint\n\nChanger le joint.\n\n#plomberie');
  });
});

function api() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('FeedContainer', () => {
  it('présente le fil et bascule la mention « j’aime »', async () => {
    const { client, mock } = api();
    mock.onGet('/posts/feed').reply(200, feed);
    mock.onGet('/posts/explore').reply(200, feed);
    mock.onPost(`/posts/${feed.data[0]!.id}/like`).reply(200, likeToggled);
    const onOpen = jest.fn();
    await renderWithProviders(<FeedContainer onOpen={onOpen} onCompose={jest.fn()} />, {
      api: client,
      translations,
    });
    const user = userEvent.setup();

    const likes = await screen.findAllByRole('button', { name: /J’aime|Aimer/i });
    await user.press(likes[0]!);
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
  });
});

describe('PostContainer', () => {
  it('ajoute un commentaire', async () => {
    const { client, mock } = api();
    const id = post.data.id;
    mock.onGet(`/posts/${id}`).reply(200, post);
    mock.onGet(`/posts/${id}/comments`).reply(200, comments);
    mock.onPost(`/posts/${id}/comments`).reply(201, commentCreated);
    await renderWithProviders(<PostContainer postId={id} onBack={jest.fn()} />, {
      api: client,
      translations,
    });
    const user = userEvent.setup();

    await fireEvent.changeText(await screen.findByLabelText('Commentaire'), 'Bravo');
    await user.press(screen.getByRole('button', { name: 'Publier le commentaire' }));
    await waitFor(() =>
      expect(JSON.parse(mock.history.post[0]!.data as string)).toEqual({ content: 'Bravo' }),
    );
  });
});

describe('ComposeContainer', () => {
  it('publie le texte composé, sans choix d’audience', async () => {
    const { client, mock } = api();
    mock.onPost('/posts').reply(201, postCreated);
    const store = createSessionStore();
    store.getState().setAuthenticated(buildSessionUser('technicien', { name: 'Paul' }));
    const onDone = jest.fn();
    await renderWithProviders(<ComposeContainer onDone={onDone} />, {
      api: client,
      sessionStore: store,
      translations,
    });

    expect(screen.queryByText('Pros uniquement')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Texte'), 'Bonne journée à tous');
    await userEvent.setup().press(screen.getByRole('button', { name: 'Publier' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(JSON.parse(mock.history.post[0]!.data as string).content).toContain(
      'Bonne journée à tous',
    );
  });
});
