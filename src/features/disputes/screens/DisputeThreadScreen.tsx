import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { useTheme } from '@/core/theme';
import { FormField } from '@/shared/forms';
import {
  Banner,
  Button,
  Card,
  EmptyState,
  Pill,
  QueryGate,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';
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
      testID="fil-litige"
      onRefresh={() => void dispute.refetch()}
      refreshing={dispute.isRefetching}
    >
      <TopBar title={t('disputes:thread.title')} onBack={onBack} />
      <QueryGate queries={[dispute]}>
        {() => (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <DisputeHeader dispute={dispute.data!} />
            <DisputeMessages dispute={dispute.data!} />
            {isDisputeClosed(dispute.data!.status) ? (
              <Banner tone="warning" message={t('disputes:thread.closed')} />
            ) : (
              <MessageComposer disputeId={disputeId} />
            )}
          </View>
        )}
      </QueryGate>
    </Screen>
  );
}

function DisputeHeader({ dispute }: { dispute: Dispute }) {
  const { t } = useTranslation();
  return (
    <Card padding={16}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="section" style={{ flex: 1 }}>
            {t(`disputes:reasons.${dispute.reason}`, { defaultValue: dispute.reason })}
          </Text>
          <Pill
            size="sm"
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
          <Text variant="label" tone="muted">
            {t('disputes:list.against', { name: dispute.defendant.name })}
          </Text>
        ) : null}
        {dispute.description ? <Text>{dispute.description}</Text> : null}
        {dispute.resolution ? (
          <Banner
            tone="success"
            message={t('disputes:thread.resolution', { resolution: dispute.resolution })}
          />
        ) : null}
      </View>
    </Card>
  );
}

function DisputeMessages({ dispute }: { dispute: Dispute }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const selfId = useSession((state) => state.user?.id ?? null);
  const messages = dispute.messages ?? [];
  if (messages.length === 0) {
    return (
      <EmptyState
        icon="chat"
        title={t('disputes:thread.title')}
        message={t('disputes:thread.empty')}
      />
    );
  }
  return (
    <Section title={t('disputes:thread.title')}>
      <View style={{ gap: 8 }}>
        {messages.map((message) => {
          const mine = Boolean(message.sender_id && message.sender_id === selfId);
          return (
            <View
              key={message.id}
              style={{ flexDirection: 'row', justifyContent: mine ? 'flex-end' : 'flex-start' }}
            >
              <View
                style={{
                  maxWidth: '85%',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 18,
                  borderBottomRightRadius: mine ? 6 : 18,
                  borderBottomLeftRadius: mine ? 18 : 6,
                  backgroundColor: mine ? theme.colors.primary : theme.colors.surfaceHigh,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text variant="caption" tone={mine ? 'onPrimary' : 'primary'}>
                    {mine
                      ? t('disputes:thread.me')
                      : (message.sender?.name ?? t('disputes:thread.unknownSender'))}
                  </Text>
                  {message.created_at ? (
                    <Text variant="caption" tone={mine ? 'onPrimary' : 'muted'}>
                      {t('disputes:thread.sentAt', { time: formatClockTime(message.created_at) })}
                    </Text>
                  ) : null}
                </View>
                <Text tone={mine ? 'onPrimary' : 'default'}>{message.message}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Section>
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
    <View style={{ gap: 10 }}>
      <FormField
        control={form.control}
        name="message"
        label={t('disputes:thread.message')}
        multiline
      />
      {notice ? <Banner tone="success" message={notice} /> : null}
      {error ? <Banner tone="danger" message={error} /> : null}
      <Button
        label={t('disputes:thread.send')}
        icon="send"
        full
        onPress={() => void submit()}
        loading={post.isPending}
      />
    </View>
  );
}
