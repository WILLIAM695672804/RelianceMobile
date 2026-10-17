import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import {
  Badge,
  Button,
  Card,
  FormTextField,
  Screen,
  SectionHeader,
  Snackbar,
  StateView,
  Text,
} from '@/shared/components';
import { formatClockTime, formatDate } from '@/shared/format';

import { useDispute, usePostDisputeMessage } from '../hooks/useDisputes';
import { DISPUTE_TONES } from '../model/disputeTones';
import {
  isDisputeClosed,
  messageFormSchema,
  type Dispute,
  type MessageFormValues,
} from '../schemas/disputeSchemas';

export interface DisputeThreadScreenProps {
  disputeId: string;
  onBack?: () => void;
}

/** Fil d'un litige : exposé du motif, décision éventuelle et échanges avec la médiation. */
export function DisputeThreadScreen({ disputeId, onBack }: DisputeThreadScreenProps) {
  const { t } = useTranslation();
  const dispute = useDispute(disputeId);

  return (
    <Screen
      title={t('disputes:thread.title')}
      onBack={onBack}
      onRefresh={() => void dispute.refetch()}
      refreshing={dispute.isRefetching}
    >
      {dispute.isPending ? <StateView status="loading" /> : null}
      {dispute.isError ? (
        <StateView status="error" error={dispute.error} onRetry={() => void dispute.refetch()} />
      ) : null}
      {dispute.isSuccess ? (
        <>
          <DisputeHeader dispute={dispute.data} />
          <DisputeMessages dispute={dispute.data} />
          {isDisputeClosed(dispute.data.status) ? (
            <Snackbar message={t('disputes:thread.closed')} tone="info" />
          ) : (
            <MessageComposer disputeId={disputeId} />
          )}
        </>
      ) : null}
    </Screen>
  );
}

function DisputeHeader({ dispute }: { dispute: Dispute }) {
  const { t } = useTranslation();
  return (
    <Card>
      <View style={styles.header}>
        <Text variant="subtitle" style={styles.title}>
          {t(`disputes:reasons.${dispute.reason}`, { defaultValue: dispute.reason })}
        </Text>
        <Badge
          label={t(`disputes:statuses.${dispute.status}`)}
          tone={DISPUTE_TONES[dispute.status]}
        />
      </View>
      {dispute.created_at ? (
        <Text variant="caption" tone="muted">
          {t('disputes:list.openedAt', { date: formatDate(dispute.created_at) })}
        </Text>
      ) : null}
      {dispute.defendant ? (
        <Text tone="muted">{t('disputes:list.against', { name: dispute.defendant.name })}</Text>
      ) : null}
      {dispute.description ? <Text>{dispute.description}</Text> : null}
      {dispute.resolution ? (
        <Text tone="success">
          {t('disputes:thread.resolution', { resolution: dispute.resolution })}
        </Text>
      ) : null}
    </Card>
  );
}

function DisputeMessages({ dispute }: { dispute: Dispute }) {
  const { t } = useTranslation();
  const selfId = useSession((state) => state.user?.id ?? null);
  const messages = dispute.messages ?? [];

  if (messages.length === 0) {
    return <StateView status="empty" message={t('disputes:thread.empty')} />;
  }

  return (
    <>
      <SectionHeader title={t('disputes:thread.title')} />
      {messages.map((message) => {
        const mine = Boolean(message.sender_id && message.sender_id === selfId);
        return (
          <View key={message.id} style={[styles.row, mine ? styles.mineRow : styles.theirRow]}>
            <Card
              tone={mine ? 'primary' : 'muted'}
              padding={12}
              style={[styles.bubble, mine ? styles.mine : styles.their]}
            >
              <View style={styles.bubbleHeader}>
                <Text variant="caption" tone="primary">
                  {mine
                    ? t('disputes:thread.me')
                    : (message.sender?.name ?? t('disputes:thread.unknownSender'))}
                </Text>
                {message.created_at ? (
                  <Text variant="caption" tone="muted">
                    {t('disputes:thread.sentAt', { time: formatClockTime(message.created_at) })}
                  </Text>
                ) : null}
              </View>
              <Text>{message.message}</Text>
            </Card>
          </View>
        );
      })}
    </>
  );
}

function MessageComposer({ disputeId }: { disputeId: string }) {
  const { t } = useTranslation();
  const post = usePostDisputeMessage(disputeId);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { message: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setNotice(null);
    setError(null);
    try {
      await post.mutateAsync(values.message.trim());
      form.reset({ message: '' });
      setNotice(t('disputes:thread.sent'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  });

  return (
    <>
      <FormTextField
        control={form.control}
        name="message"
        label={t('disputes:thread.message')}
        multiline
      />
      {notice ? <Snackbar message={notice} tone="success" /> : null}
      {error ? <Snackbar message={error} tone="danger" /> : null}
      <Button
        label={t('disputes:thread.send')}
        icon="send"
        onPress={() => void submit()}
        loading={post.isPending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
  row: { flexDirection: 'row' },
  mineRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '88%' },
  mine: { borderBottomRightRadius: 4 },
  their: { borderBottomLeftRadius: 4 },
  bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
