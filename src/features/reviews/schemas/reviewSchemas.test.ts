import myReviews from '@/test/fixtures/reviews/my-reviews.json';
import reputation from '@/test/fixtures/reviews/reputation.json';
import reviewCreated from '@/test/fixtures/reviews/review-created.json';
import technicianReviews from '@/test/fixtures/reviews/technician-reviews.json';
import userBadges from '@/test/fixtures/reviews/user-badges.json';

import {
  badgeListResponseSchema,
  reputationResponseSchema,
  reviewCreatedResponseSchema,
  reviewFormSchema,
  reviewPageResponseSchema,
  toReviewPayload,
} from './reviewSchemas';

describe('reviewSchemas', () => {
  it('lit l’avis créé sans conserver le technicien brut', () => {
    const parsed = reviewCreatedResponseSchema.parse(reviewCreated);

    expect(parsed.message).toBe(reviewCreated.message);
    expect(parsed.data.rating).toBe(5);
    expect(parsed.data).not.toHaveProperty('target');
    expect(parsed.new_badges).toEqual([]);
  });

  it('lit les avis d’un technicien et les avis reçus (pagination imbriquée)', () => {
    const page = reviewPageResponseSchema.parse(technicianReviews).data;
    expect(page.data).toHaveLength(technicianReviews.data.data.length);
    expect(page.data[0]?.reviewer?.name).toBe(technicianReviews.data.data[0]!.reviewer.name);

    const mine = reviewPageResponseSchema.parse(myReviews).data;
    expect(mine.data[0]?.request?.title).toBe(myReviews.data.data[0]!.request.title);
    expect(mine.total).toBe(myReviews.data.total);
  });

  it('lit les badges et la réputation', () => {
    expect(badgeListResponseSchema.parse(userBadges).data).toEqual([]);
    expect(
      badgeListResponseSchema.parse({
        data: [{ code: 'first_mission', title: 'Première mission', awarded_at: null }],
      }).data[0]?.title,
    ).toBe('Première mission');

    const parsed = reputationResponseSchema.parse(reputation);
    expect(parsed.total).toBe(reputation.total);
    expect(parsed.data.data[0]?.change).toBe(reputation.data.data[0]!.change);
  });

  it('valide le formulaire d’avis', () => {
    expect(reviewFormSchema.safeParse({ rating: 5, comment: '' }).success).toBe(true);
    expect(reviewFormSchema.safeParse({ rating: 0, comment: '' }).error?.issues[0]?.message).toBe(
      'reviews:form.errors.ratingRequired',
    );
    expect(
      reviewFormSchema.safeParse({ rating: 5, comment: 'x'.repeat(2001) }).error?.issues[0]
        ?.message,
    ).toBe('reviews:form.errors.commentTooLong');
    expect(toReviewPayload('r1', { rating: 4, comment: ' Parfait ' })).toEqual({
      requestId: 'r1',
      rating: 4,
      comment: 'Parfait',
    });
    expect(toReviewPayload('r1', { rating: 4, comment: '  ' }).comment).toBeNull();
  });
});
