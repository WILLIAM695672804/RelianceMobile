import { z } from 'zod';

const asCount = (value: number | null | undefined): number => value ?? 0;

/** Auteur d'une publication ou d'un commentaire. */
const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
  is_verified: z.boolean().nullish(),
});

/** Publication (`PostResource`) ; les pièces jointes sont hors périmètre. */
export const postSchema = z.object({
  id: z.string(),
  author_id: z.string().nullish(),
  author: authorSchema.nullish(),
  content: z.string().nullish(),
  likes_count: z.number().nullish().transform(asCount),
  comments_count: z.number().nullish().transform(asCount),
  is_liked: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
  created_at: z.string().nullish(),
});
export type Post = z.infer<typeof postSchema>;

export const postResponseSchema = z.object({ data: postSchema });
export const postCreatedResponseSchema = z.object({ message: z.string(), data: postSchema });

export const postPageSchema = z.object({
  data: z.array(postSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

/** Commentaire (`CommentResource`). */
export const commentSchema = z.object({
  id: z.string(),
  post_id: z.string().nullish(),
  author: authorSchema.nullish(),
  content: z.string(),
  created_at: z.string().nullish(),
});
export type Comment = z.infer<typeof commentSchema>;

export const commentCreatedResponseSchema = z.object({
  message: z.string(),
  data: commentSchema,
});

export const commentPageSchema = z.object({
  data: z.array(commentSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

/** `POST /posts/{id}/like` : état et compteur après bascule. */
export const likeResponseSchema = z.object({
  liked: z.boolean(),
  likes_count: z.number().nullish().transform(asCount),
});
export type LikeResult = z.infer<typeof likeResponseSchema>;

export const POST_MAX_LENGTH = 5000;
export const COMMENT_MAX_LENGTH = 2000;

/** Formulaire de publication. */
export const postFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'social:compose.errors.contentRequired')
    .max(POST_MAX_LENGTH, 'social:compose.errors.contentTooLong'),
});
export type PostFormValues = z.infer<typeof postFormSchema>;

/** Formulaire de commentaire. */
export const commentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'social:comments.errors.contentRequired')
    .max(COMMENT_MAX_LENGTH, 'social:comments.errors.contentTooLong'),
});
export type CommentFormValues = z.infer<typeof commentFormSchema>;
