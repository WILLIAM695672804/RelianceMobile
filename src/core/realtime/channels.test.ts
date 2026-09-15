import { CHANNEL_EVENTS, channelName, channels, isChannelEvent } from './channels';

describe('registre des canaux', () => {
  it('reflète routes/channels.php et les événements ShouldBroadcast du backend', () => {
    expect(CHANNEL_EVENTS).toEqual({
      user: ['KycStatusChanged', 'RoleUpgradeDecision'],
      notifications: ['NotificationCreated'],
      wallet: ['BalanceUpdated', 'HoldCaptured', 'HoldReleased', 'PaymentSettled'],
      quotes: ['QuoteSubmitted', 'InvoiceCreated'],
      proposals: ['ProposalCreated', 'ProposalAccepted', 'ProposalRefused'],
      jobs: ['JobStatusChanged', 'PhasesUpdated'],
      tracking: ['TechnicianPositionUpdated'],
      conversation: ['MessageSent', 'MessageRead'],
    });
  });

  it('construit le nom Laravel du canal privé', () => {
    expect(channelName(channels.user('u1'))).toBe('user.u1');
    expect(channelName(channels.conversation('c9'))).toBe('conversation.c9');
  });

  it('vérifie l’appartenance d’un événement à un canal', () => {
    expect(isChannelEvent('user', 'RoleUpgradeDecision')).toBe(true);
    expect(isChannelEvent('user', 'BalanceUpdated')).toBe(false);
  });
});
