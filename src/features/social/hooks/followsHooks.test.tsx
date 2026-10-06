import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import checkAfter from '@/test/fixtures/follows/check-after.json';
import counts from '@/test/fixtures/follows/counts.json';
import suggestions from '@/test/fixtures/follows/suggestions.json';
import unfollowed from '@/test/fixtures/follows/unfollowed.json';
import { createTestProviders } from '@/test/render';

import { socialKeys } from './socialKeys';
import {
  useFollowCounts,
  useFollowStatus,
  useFollowUser,
  useSuggestions,
  useUnfollowUser,
} from './useFollows';

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks du suivi', () => {
  it('complète les clés du fil', () => {
    expect(socialKeys.follow('u2')).toEqual(['social', 'follow', 'u2']);
    expect(socialKeys.followCounts('u2')).toEqual(['social', 'follow-counts', 'u2']);
    expect(socialKeys.suggestions()).toEqual(['social', 'suggestions']);
  });

  it('lit l’état, les compteurs et les suggestions', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/follows/u2/check').reply(200, checkAfter);
    mock.onGet('/users/u2/follow-counts').reply(200, counts);
    mock.onGet('/follows/suggestions').reply(200, suggestions);

    const hooks = [
      await renderHook(() => useFollowStatus('u2'), { wrapper }),
      await renderHook(() => useFollowCounts('u2'), { wrapper }),
      await renderHook(() => useSuggestions(), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les bascules rechargent le fil', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock
      .onPost('/follows/u2')
      .reply(201, { status: 'success', message: 'Suivi', following: true, followers_count: 1 });
    mock.onDelete('/follows/u2').reply(200, unfollowed);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const follow = await renderHook(() => useFollowUser(), { wrapper });
    const unfollow = await renderHook(() => useUnfollowUser(), { wrapper });

    await act(async () => {
      await follow.result.current.mutateAsync('u2');
      await unfollow.result.current.mutateAsync('u2');
    });
    await waitFor(() => expect(unfollow.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: socialKeys.all });
    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});
