import checkAfter from '@/test/fixtures/follows/check-after.json';
import counts from '@/test/fixtures/follows/counts.json';
import suggestions from '@/test/fixtures/follows/suggestions.json';
import unfollowed from '@/test/fixtures/follows/unfollowed.json';

import {
  followCheckSchema,
  followCountsSchema,
  followResultSchema,
  suggestionsResponseSchema,
} from './followSchemas';

describe('followSchemas', () => {
  it('lit l’état de suivi et les compteurs', () => {
    expect(followCheckSchema.parse(checkAfter).following).toBe(true);
    const parsed = followCountsSchema.parse(counts);
    expect(parsed.followers_count).toBe(counts.followers_count);
    expect(parsed.following_count).toBe(counts.following_count);
  });

  it('lit le résultat d’un désabonnement', () => {
    const parsed = followResultSchema.parse(unfollowed);

    expect(parsed.following).toBe(false);
    expect(parsed.followers_count).toBe(unfollowed.followers_count);
  });

  it('lit les suggestions et convertit les notes', () => {
    const list = suggestionsResponseSchema.parse(suggestions).data;

    expect(list).toHaveLength(suggestions.data.length);
    expect(typeof list[0]?.rating).toBe('number');
    expect(list[0]?.verified).toBe(true);
  });
});
