import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import commentCreated from '@/test/fixtures/social/comment-created.json';
import comments from '@/test/fixtures/social/comments.json';
import explore from '@/test/fixtures/social/explore.json';
import feed from '@/test/fixtures/social/feed.json';
import likeToggled from '@/test/fixtures/social/like-toggled.json';
import postCreated from '@/test/fixtures/social/post-created.json';
import post from '@/test/fixtures/social/post.json';

import {
  addComment,
  createPost,
  fetchComments,
  fetchExplore,
  fetchFeed,
  fetchPost,
  toggleLike,
} from './socialApi';

const POST_ID = post.data.id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('socialApi', () => {
  it('lit les fils, une publication et ses commentaires', async () => {
    const { client, mock } = setup();
    mock.onGet('/posts/feed').reply(200, feed);
    mock.onGet('/posts/explore').reply(200, explore);
    mock.onGet(`/posts/${POST_ID}`).reply(200, post);
    mock.onGet(`/posts/${POST_ID}/comments`).reply(200, comments);

    await expect(fetchFeed(client)).resolves.toHaveLength(feed.data.length);
    await expect(fetchExplore(client)).resolves.toHaveLength(explore.data.length);
    await expect(fetchPost(client, POST_ID)).resolves.toMatchObject({ id: POST_ID });
    await expect(fetchComments(client, POST_ID)).resolves.toHaveLength(comments.data.length);
  });

  it('publie, aime et commente', async () => {
    const { client, mock } = setup();
    mock.onPost('/posts').reply(201, postCreated);
    mock.onPost(`/posts/${POST_ID}/like`).reply(200, likeToggled);
    mock.onPost(`/posts/${POST_ID}/comments`).reply(201, commentCreated);

    await expect(createPost(client, 'Bonjour')).resolves.toMatchObject({
      id: postCreated.data.id,
    });
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ content: 'Bonjour' });

    await expect(toggleLike(client, POST_ID)).resolves.toMatchObject({ liked: true });
    await expect(addComment(client, POST_ID, 'Merci')).resolves.toMatchObject({
      content: commentCreated.data.content,
    });
    expect(JSON.parse(mock.history.post[2]?.data as string)).toEqual({ content: 'Merci' });
  });
});
