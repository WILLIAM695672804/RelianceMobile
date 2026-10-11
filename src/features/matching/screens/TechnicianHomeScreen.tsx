import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Icon,
  Screen,
  SectionHeader,
  StateView,
  Text,
} from '@/shared/components';
import { formatAmount } from '@/shared/format';

import {
  useAcceptProposal,
  useActiveMission,
  useReceivedProposals,
  useRefuseProposal,
} from '../hooks/useProposals';
import { expiryState, isActionable } from '../model/proposalExpiry';
import type { ReceivedProposal } from '../schemas/matchingSchemas';
import { ActiveMissionCard } from './ActiveMissionCard';

type Decision = 'accept' | 'refuse';
type Feedback = { tone: 'primary' | 'danger'; text: string };

const HTTP_GONE = 410;
/** Fréquence de réévaluation des délais d'expiration. */
const CLOCK_INTERVAL_MS = 30 * 1000;

/** Instant courant, réévalué périodiquement (le rendu doit rester pur). */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** E06 — Accueil technicien : mission en cours et propositions reçues. */
export function TechnicianHomeScreen() {
  const { t } = useTranslation();
  const name = useSession((state) => state.user?.name ?? '');
  const avatarUrl = useSession((state) => state.user?.avatarUrl);
  const proposals = useReceivedProposals();
  const mission = useActiveMission();
  const accept = useAcceptProposal();
  const refuse = useRefuseProposal();
  const [pending, setPending] = useState<{ proposal: ReceivedProposal; decision: Decision } | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const now = useNow(CLOCK_INTERVAL_MS);
  const hasMission = mission.isSuccess && mission.data !== null;
  const deciding = accept.isPending || refuse.isPending;

  const decide = async () => {
    const target = pending;
    setPending(null);
    if (!target) return;
    setFeedback(null);
    const mutation = target.decision === 'accept' ? accept : refuse;
    try {
      const message = await mutation.mutateAsync(target.proposal.id);
      setFeedback({ tone: 'primary', text: message });
    } catch (error) {
      const appError = normalizeError(error);
      const text =
        appError.status === HTTP_GONE && appError.serverMessage
          ? appError.serverMessage
          : describeError(appError, t);
      setFeedback({ tone: 'danger', text });
    }
  };

  const refresh = () => {
    void proposals.refetch();
    void mission.refetch();
  };

  const renderMission = () => {
    if (mission.isPending) return <StateView status="loading" />;
    if (mission.isError) {
      return (
        <StateView status="error" error={mission.error} onRetry={() => void mission.refetch()} />
      );
    }
    if (mission.data === null) {
      return <Text tone="muted">{t('matching:technicianHome.noMission')}</Text>;
    }
    return <ActiveMissionCard mission={mission.data} />;
  };

  const renderProposal = (proposal: ReceivedProposal) => {
    const title = proposal.request?.title ?? '';
    const place = [proposal.request?.address?.address, proposal.request?.address?.city]
      .filter(Boolean)
      .join(', ');
    const expiry = expiryState(proposal.expires_at, now);
    const acceptLabel = t('matching:technicianHome.accept');
    const refuseLabel = t('matching:technicianHome.refuse');
    return (
      <Card key={proposal.id} elevated>
        <View style={styles.cardHeader}>
          <Icon name="inbox" size={22} tone="primary" />
          <Text variant="subtitle" style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {proposal.request?.category ? (
          <Text tone="muted">{proposal.request.category.name}</Text>
        ) : null}
        {proposal.request?.description ? <Text>{proposal.request.description}</Text> : null}
        {place ? (
          <View style={styles.meta}>
            <Icon name="pin" size={16} tone="muted" />
            <Text style={styles.metaText}>{t('matching:technicianHome.place', { place })}</Text>
          </View>
        ) : null}
        <Badge
          label={t('matching:technicianHome.proposedPrice', {
            amount: formatAmount(proposal.price),
          })}
          tone="primary"
          icon="wallet"
        />
        {proposal.message ? (
          <Text tone="muted">
            {t('matching:technicianHome.clientMessage', { message: proposal.message })}
          </Text>
        ) : null}
        {expiry?.status === 'active' ? (
          <View style={styles.meta}>
            <Icon name="clock" size={16} tone="muted" />
            <Text variant="caption" tone="muted" style={styles.metaText}>
              {t('matching:technicianHome.expiresIn', {
                hours: expiry.hours,
                minutes: expiry.minutes,
              })}
            </Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button
            label={acceptLabel}
            icon="check"
            accessibilityLabel={`${acceptLabel} : ${title}`}
            onPress={() => setPending({ proposal, decision: 'accept' })}
            disabled={hasMission || deciding}
          />
          <Button
            label={refuseLabel}
            icon="close"
            accessibilityLabel={`${refuseLabel} : ${title}`}
            onPress={() => setPending({ proposal, decision: 'refuse' })}
            disabled={deciding}
            variant="ghost"
          />
        </View>
      </Card>
    );
  };

  const renderProposals = () => {
    if (proposals.isPending) return <StateView status="loading" />;
    if (proposals.isError) {
      return (
        <StateView
          status="error"
          error={proposals.error}
          onRetry={() => void proposals.refetch()}
        />
      );
    }
    const actionable = proposals.data.filter((proposal) => isActionable(proposal, now));
    if (actionable.length === 0) {
      return <StateView status="empty" message={t('matching:technicianHome.noProposals')} />;
    }
    return (
      <>
        {hasMission ? (
          <Text tone="muted">{t('matching:technicianHome.missionInProgress')}</Text>
        ) : null}
        {actionable.map(renderProposal)}
      </>
    );
  };

  const decision = pending?.decision ?? 'accept';

  return (
    <Screen onRefresh={refresh} refreshing={proposals.isRefetching || mission.isRefetching}>
      <View style={styles.header}>
        <Avatar name={name} uri={avatarUrl} size={48} />
        <View style={styles.headerText}>
          <Text variant="title" accessibilityRole="header">
            {t('matching:technicianHome.greeting', { name })}
          </Text>
          <Badge
            label={t(
              hasMission
                ? 'matching:technicianHome.statusBusy'
                : 'matching:technicianHome.statusFree',
            )}
            tone={hasMission ? 'warning' : 'success'}
            icon={hasMission ? 'wrench' : 'check'}
          />
        </View>
      </View>
      {feedback ? (
        <View style={styles.feedback}>
          <Icon
            name={feedback.tone === 'danger' ? 'info' : 'check'}
            size={18}
            tone={feedback.tone}
          />
          <Text tone={feedback.tone} style={styles.feedbackText}>
            {feedback.text}
          </Text>
        </View>
      ) : null}
      <SectionHeader title={t('matching:technicianHome.mission')} />
      {renderMission()}
      <SectionHeader title={t('matching:technicianHome.proposals')} />
      {renderProposals()}
      <ConfirmDialog
        visible={pending !== null}
        title={t(`matching:technicianHome.${decision}Title`)}
        message={t(`matching:technicianHome.${decision}Message`, {
          title: pending?.proposal.request?.title ?? '',
        })}
        confirmLabel={t(`matching:technicianHome.${decision}`)}
        onConfirm={() => void decide()}
        onCancel={() => setPending(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, gap: 6 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  feedbackText: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitle: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
