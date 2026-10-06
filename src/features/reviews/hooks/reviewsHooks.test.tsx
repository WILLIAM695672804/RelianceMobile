import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import myReviews from '@/test/fixtures/reviews/my-reviews.json';
import reputation from '@/test/fixtures/reviews/reputation.json';
import reviewCreated from '@/test/fixtures/reviews/review-created.json';
import technicianReviews from '@/test/fixtures/reviews/technician-reviews.json';
import userBadges from '@/test/fixtures/reviews/user-badges.json';
import { createTestProviders } from '@/test/render';

import { reviewsKeys } from './reviewsKeys';
import {
  useMyReviews,
  useReputation,
  useSubmitReview,
  useTechnicianReviews,
  useUserBadges,
} from './useReviews';

const TECHNICIAN_ID = reviewCreated.data.target_id;
const REQUEST_ID = reviewCreated.data.request_id;

function setup() {
  const providers = createTestProviders();
  return { ...providers, mock: new MockAdapter(providers.api), wrapper: providers.TestProviders };
}

describe('hooks des avis', () => {
  it('hiérarchise les clés sous « reviews »', () => {
    expect(reviewsKeys.technician('t1')).toEqual(['reviews', 'technician', 't1']);
    expect(reviewsKeys.mine()).toEqual(['reviews', 'mine']);
    expect(reviewsKeys.badges('t1')).toEqual(['reviews', 'badges', 't1']);
    expect(reviewsKeys.reputation('t1')).toEqual(['reviews', 'reputation', 't1']);
  });

  it('lit les avis, les badges et la réputation', async () => {
    const { mock, wrapper } = setup();
    mock.onGet(`/reviews/technician/${TECHNICIAN_ID}`).reply(200, technicianReviews);
    mock.onGet('/reviews/mine').reply(200, myReviews);
    mock.onGet(`/badges/user/${TECHNICIAN_ID}`).reply(200, userBadges);
    mock.onGet(`/reputation/${TECHNICIAN_ID}`).reply(200, reputation);

    const hooks = [
      await renderHook(() => useTechnicianReviews(TECHNICIAN_ID), { wrapper }),
      await renderHook(() => useMyReviews(), { wrapper }),
      await renderHook(() => useUserBadges(TECHNICIAN_ID), { wrapper }),
      await renderHook(() => useReputation(TECHNICIAN_ID), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('le dépôt d’un avis recharge les avis', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/reviews').reply(201, reviewCreated);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useSubmitReview(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ requestId: REQUEST_ID, rating: 5, comment: null });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewsKeys.all });
  });
});
