import created from '@/test/fixtures/disputes/dispute-created.json';
import message from '@/test/fixtures/disputes/dispute-message.json';
import dispute from '@/test/fixtures/disputes/dispute.json';
import disputes from '@/test/fixtures/disputes/disputes.json';

import {
  disputeFormSchema,
  disputeMessageResponseSchema,
  disputePageResponseSchema,
  disputeResponseSchema,
  isDisputeClosed,
  messageFormSchema,
} from './disputeSchemas';

describe('disputeSchemas', () => {
  it('lit le détail capturé et son fil', () => {
    const parsed = disputeResponseSchema.parse(dispute).data;

    expect(parsed.status).toBe('open');
    expect(parsed.messages).toHaveLength(dispute.data.messages.length);
    expect(parsed.opener?.name).toBe(dispute.data.opener.name);
    expect(parsed.defendant?.name).toBe(dispute.data.defendant.name);
  });

  it('lit le litige créé', () => {
    expect(disputeResponseSchema.parse(created).data.reason).toBe(created.data.reason);
  });

  it('lit la page de litiges, paginateur à plat', () => {
    const page = disputePageResponseSchema.parse(disputes);

    expect(page.data).toHaveLength(disputes.data.length);
    expect(page.total).toBe(disputes.total);
  });

  it('lit un message ajouté', () => {
    expect(disputeMessageResponseSchema.parse(message).data.message).toBe(message.data.message);
  });

  it('exige un motif et une description', () => {
    const result = disputeFormSchema.safeParse({ reason: 'quality', description: '  ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('disputes:form.errors.descriptionRequired');
  });

  it('refuse un motif inconnu', () => {
    expect(disputeFormSchema.safeParse({ reason: 'autre', description: 'x' }).success).toBe(false);
  });

  it('exige un message non vide', () => {
    expect(messageFormSchema.safeParse({ message: '   ' }).success).toBe(false);
  });

  it('reconnaît un litige clos', () => {
    expect(isDisputeClosed('open')).toBe(false);
    expect(isDisputeClosed('in_review')).toBe(false);
    expect(isDisputeClosed('resolved')).toBe(true);
    expect(isDisputeClosed('closed')).toBe(true);
  });
});
