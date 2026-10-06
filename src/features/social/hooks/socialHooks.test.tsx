import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import commentCreated from '@/test/fixtures/social/comment-created.json';
import comments from '@/test/fixtures/social/comments.json';
import explore from '@/test/fixtures/social/explore.json';
import feed from '@/test/fixtures/social/feed.json';
import likeToggled from '@/test/fixtures/social/like-toggled.json';
import postCreated from '@/test/fixtures/social/post-created.json';
import post from '@/test/fixtures/social/post.json';
import { createTestProviders } from '@/test/render';

import { socialKeys } from './socialKeys';
import {
  useAddComment,
  useComments,
  useCreatePost,
  useExplore,
  useFeed,
  usePost,
  useToggleLike,
} from './useSocial';

const POST_ID = post.data.id;

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks du fil social', () => {
  it('hiérarchise les clés sous « social »', () => {
    expect(socialKeys.feed()).toEqual(['social', 'feed']);
    expect(socialKeys.explore()).toEqual(['social', 'explore']);
    expect(socialKeys.post('p1')).toEqual(['social', 'posts', 'p1']);
    expect(socialKeys.comments('p1')).toEqual(['social', 'comments', 'p1']);
  });

  it('lit les fils, une publication et ses commentaires', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/posts/feed').reply(200, feed);
    mock.onGet('/posts/explore').reply(200, explore);
    mock.onGet(`/posts/${POST_ID}`).reply(200, post);
    mock.onGet(`/posts/${POST_ID}/comments`).reply(200, comments);

    const hooks = [
      await renderHook(() => useFeed(), { wrapper }),
      await renderHook(() => useExplore(), { wrapper }),
      await renderHook(() => usePost(POST_ID), { wrapper }),
      await renderHook(() => useComments(POST_ID), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent le fil', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/posts').reply(201, postCreated);
    mock.onPost(`/posts/${POST_ID}/like`).reply(200, likeToggled);
    mock.onPost(`/posts/${POST_ID}/comments`).reply(201, commentCreated);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const create = await renderHook(() => useCreatePost(), { wrapper });
    const like = await renderHook(() => useToggleLike(), { wrapper });
    const comment = await renderHook(() => useAddComment(POST_ID), { wrapper });

    await act(async () => {
      await create.result.current.mutateAsync('Bonjour');
      await like.result.current.mutateAsync(POST_ID);
      await comment.result.current.mutateAsync('Merci');
    });
    await waitFor(() => expect(comment.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: socialKeys.all });
    expect(invalidate).toHaveBeenCalledTimes(3);
  });
});
