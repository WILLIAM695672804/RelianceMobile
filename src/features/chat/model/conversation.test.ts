import { conversationTitle, otherMembers, sortedMessages } from './conversation';

const conversation = {
  id: 'c1',
  subject: null,
  members: [
    { user_id: 'u1', name: 'Moi', avatar_url: null, unread_count: 0 },
    { user_id: 'u2', name: 'Technicien Démo', avatar_url: null, unread_count: 2 },
  ],
  last_message: null,
  unread_count: 0,
  created_at: null,
};

describe('modèle des conversations', () => {
  it('écarte le membre courant', () => {
    expect(otherMembers(conversation, 'u1').map((member) => member.user_id)).toEqual(['u2']);
    expect(otherMembers(conversation, null)).toHaveLength(2);
  });

  it('nomme la conversation par son sujet, sinon par ses autres membres', () => {
    expect(
      conversationTitle({ ...conversation, subject: 'Intervention' }, 'u1', 'Discussion'),
    ).toBe('Intervention');
    expect(conversationTitle(conversation, 'u1', 'Discussion')).toBe('Technicien Démo');
    expect(conversationTitle({ ...conversation, members: [] }, 'u1', 'Discussion')).toBe(
      'Discussion',
    );
  });

  it('ordonne les messages du plus ancien au plus récent', () => {
    const ordered = sortedMessages([
      { id: 'm2', created_at: '2026-10-06T10:05:00Z' },
      { id: 'm1', created_at: '2026-10-06T10:00:00Z' },
      { id: 'm3', created_at: null },
    ]);

    expect(ordered.map((message) => message.id)).toEqual(['m1', 'm2', 'm3']);
  });
});
