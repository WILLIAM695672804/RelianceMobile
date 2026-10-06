import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  commentCreatedResponseSchema,
  commentPageSchema,
  likeResponseSchema,
  postCreatedResponseSchema,
  postPageSchema,
  postResponseSchema,
  type Comment,
  type LikeResult,
  type Post,
} from '../schemas/socialSchemas';

const segment = encodeURIComponent;

/** `GET /posts/feed` : publications des comptes suivis et les siennes. */
export async function fetchFeed(client: AxiosInstance): Promise<Post[]> {
  const { data } = await client.get('/posts/feed');
  return parseResponse(postPageSchema, data).data;
}

/** `GET /posts/explore` : fil global. */
export async function fetchExplore(client: AxiosInstance): Promise<Post[]> {
  const { data } = await client.get('/posts/explore');
  return parseResponse(postPageSchema, data).data;
}

/** `GET /posts/{id}` (route publique). */
export async function fetchPost(client: AxiosInstance, postId: string): Promise<Post> {
  const { data } = await client.get(`/posts/${segment(postId)}`);
  return parseResponse(postResponseSchema, data).data;
}

/** `POST /posts` : publication de texte. */
export async function createPost(client: AxiosInstance, content: string): Promise<Post> {
  const { data } = await client.post('/posts', { content });
  return parseResponse(postCreatedResponseSchema, data).data;
}

/** `POST /posts/{id}/like` : bascule la mention « j'aime ». */
export async function toggleLike(client: AxiosInstance, postId: string): Promise<LikeResult> {
  const { data } = await client.post(`/posts/${segment(postId)}/like`);
  return parseResponse(likeResponseSchema, data);
}

/** `GET /posts/{id}/comments`. */
export async function fetchComments(client: AxiosInstance, postId: string): Promise<Comment[]> {
  const { data } = await client.get(`/posts/${segment(postId)}/comments`);
  return parseResponse(commentPageSchema, data).data;
}

/** `POST /posts/{id}/comments`. */
export async function addComment(
  client: AxiosInstance,
  postId: string,
  content: string,
): Promise<Comment> {
  const { data } = await client.post(`/posts/${segment(postId)}/comments`, { content });
  return parseResponse(commentCreatedResponseSchema, data).data;
}
