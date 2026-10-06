import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import commentCreated from '@/test/fixtures/social/comment-created.json';
import comments from '@/test/fixtures/social/comments.json';
import explore from '@/test/fixtures/social/explore.json';
import feed from '@/test/fixtures/social/feed.json';
import likeToggled from '@/test/fixtures/social/like-toggled.json';
import postCreated from '@/test/fixtures/social/post-created.json';
import post from '@/test/fixtures/social/post.json';
import { renderWithProviders } from '@/test/render';

import { socialTranslations } from '../i18n';
import { FeedScreen } from './FeedScreen';
import { PostDetailScreen } from './PostDetailScreen';

const FIRST = feed.data[0]!;
const POST_ID = post.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('FeedScreen', () => {
  it('présente le fil et ouvre une publication', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/posts/feed').reply(200, feed);
    mock.onGet('/posts/explore').reply(200, explore);
    const onOpen = jest.fn();
    await renderWithProviders(<FeedScreen onOpen={onOpen} />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    expect((await screen.findAllByText(FIRST.content)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('0 j’aime').length).toBeGreaterThan(0);

    await user.press(screen.getAllByRole('button', { name: /^Voir la publication de / })[0]!);
    expect(onOpen).toHaveBeenCalledWith(FIRST.id);
  });

  it('bascule vers le fil global', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/posts/feed').reply(200, { data: [] });
    mock.onGet('/posts/explore').reply(200, explore);
    await renderWithProviders(<FeedScreen onOpen={jest.fn()} />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    expect(
      await screen.findByText('Votre fil est vide : suivez des techniciens ou publiez.'),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Découvrir' }));

    expect((await screen.findAllByText(explore.data[0]!.content)).length).toBeGreaterThan(0);
  });

  it('publie un message et refuse un message vide', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/posts/feed').reply(200, feed);
    mock.onGet('/posts/explore').reply(200, explore);
    mock.onPost('/posts').reply(201, postCreated);
    await renderWithProviders(<FeedScreen onOpen={jest.fn()} />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Publier' }));
    expect(await screen.findByText('Saisissez un message.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Votre message'), 'Bonjour à tous.');
    await user.press(screen.getByRole('button', { name: 'Publier' }));

    expect(await screen.findByText('Publication enregistrée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      content: 'Bonjour à tous.',
    });
  });

  it('bascule la mention « j’aime »', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/posts/feed').reply(200, feed);
    mock.onGet('/posts/explore').reply(200, explore);
    mock.onPost(`/posts/${FIRST.id}/like`).reply(200, likeToggled);
    await renderWithProviders(<FeedScreen onOpen={jest.fn()} />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    await user.press(
      (await screen.findAllByRole('button', { name: /^J’aime la publication de / }))[0]!,
    );

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
  });
});

describe('PostDetailScreen', () => {
  it('présente la publication et ses commentaires, puis en ajoute un', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/posts/${POST_ID}`).reply(200, post);
    mock.onGet(`/posts/${POST_ID}/comments`).reply(200, comments);
    mock.onPost(`/posts/${POST_ID}/comments`).reply(201, commentCreated);
    await renderWithProviders(<PostDetailScreen postId={POST_ID} />, {
      api,
      translations: [socialTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText(post.data.content)).toBeOnTheScreen();
    expect(await screen.findByText(comments.data[0]!.content)).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Votre commentaire'), 'Très utile.');
    await user.press(screen.getByRole('button', { name: 'Commenter' }));

    expect(await screen.findByText('Commentaire ajouté.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ content: 'Très utile.' });
  });

  it('annonce l’absence de commentaire et propose de réessayer après un échec', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/posts/${POST_ID}`).reply(200, post);
    mock.onGet(`/posts/${POST_ID}/comments`).reply(200, { data: [] });
    await renderWithProviders(<PostDetailScreen postId={POST_ID} />, {
      api,
      translations: [socialTranslations],
    });

    expect(await screen.findByText('Aucun commentaire.')).toBeOnTheScreen();
  });
});
