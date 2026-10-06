import commentCreated from '@/test/fixtures/social/comment-created.json';
import comments from '@/test/fixtures/social/comments.json';
import explore from '@/test/fixtures/social/explore.json';
import feed from '@/test/fixtures/social/feed.json';
import likeToggled from '@/test/fixtures/social/like-toggled.json';
import postCreated from '@/test/fixtures/social/post-created.json';
import post from '@/test/fixtures/social/post.json';

import {
  commentCreatedResponseSchema,
  commentFormSchema,
  commentPageSchema,
  likeResponseSchema,
  postCreatedResponseSchema,
  postFormSchema,
  postPageSchema,
  postResponseSchema,
} from './socialSchemas';

describe('socialSchemas', () => {
  it('lit le fil personnel et le fil global', () => {
    const personal = postPageSchema.parse(feed);
    expect(personal.data).toHaveLength(feed.data.length);
    expect(personal.data[0]?.author?.name).toBe(feed.data[0]!.author.name);
    expect(personal.data[0]?.likes_count).toBe(0);
    expect(postPageSchema.parse(explore).data.length).toBeGreaterThan(0);
  });

  it('lit une publication, sa création, un like et des commentaires', () => {
    expect(postResponseSchema.parse(post).data.content).toBe(post.data.content);
    expect(postCreatedResponseSchema.parse(postCreated).data.id).toBe(postCreated.data.id);
    const like = likeResponseSchema.parse(likeToggled);
    expect(like.liked).toBe(true);
    expect(like.likes_count).toBe(likeToggled.likes_count);
    expect(commentPageSchema.parse(comments).data).toHaveLength(comments.data.length);
    expect(commentCreatedResponseSchema.parse(commentCreated).data.content).toBe(
      commentCreated.data.content,
    );
  });

  it('valide une publication et un commentaire', () => {
    expect(postFormSchema.safeParse({ content: 'Bonjour' }).success).toBe(true);
    expect(postFormSchema.safeParse({ content: '  ' }).error?.issues[0]?.message).toBe(
      'social:compose.errors.contentRequired',
    );
    expect(postFormSchema.safeParse({ content: 'x'.repeat(5001) }).error?.issues[0]?.message).toBe(
      'social:compose.errors.contentTooLong',
    );
    expect(commentFormSchema.safeParse({ content: 'Merci' }).success).toBe(true);
    expect(commentFormSchema.safeParse({ content: '' }).error?.issues[0]?.message).toBe(
      'social:comments.errors.contentRequired',
    );
  });
});
