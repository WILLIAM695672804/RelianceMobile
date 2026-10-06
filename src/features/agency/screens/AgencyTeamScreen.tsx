import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useTechnicianDirectory } from '@/features/directory';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Screen,
  StateView,
  Text,
  TextField,
} from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useAddAgencyMember, useAgencyMembers, useRemoveAgencyMember } from '../hooks/useAgency';
import type { AgencyMembership } from '../schemas/agencySchemas';

export interface AgencyTeamScreenProps {
  agencyId: string;
}

/** Équipe de l'agence : rôles, retrait d'un membre, rattachement depuis l'annuaire. */
export function AgencyTeamScreen({ agencyId }: AgencyTeamScreenProps) {
  const { t } = useTranslation();
  const members = useAgencyMembers(agencyId);
  const addMember = useAddAgencyMember(agencyId);
  const removeMember = useRemoveAgencyMember(agencyId);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const directory = useTechnicianDirectory({ search });
  const [pending, setPending] = useState<AgencyMembership | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setNotice(null);
    setError(null);
  };

  const attach = async (userId: string) => {
    reset();
    try {
      await addMember.mutateAsync({ userId, role: 'member' });
      setNotice(t('agency:team.added'));
    } catch (cause) {
      const appError = normalizeError(cause);
      setError(appError.serverMessage ?? describeError(appError, t));
    }
  };

  const detach = async () => {
    const target = pending;
    setPending(null);
    if (!target) return;
    reset();
    try {
      await removeMember.mutateAsync(target.user_id);
      setNotice(t('agency:team.removed'));
    } catch (cause) {
      const appError = normalizeError(cause);
      setError(appError.serverMessage ?? describeError(appError, t));
    }
  };

  const nameOf = (membership: AgencyMembership) =>
    membership.user?.name ?? t('agency:team.role.unknown');

  const renderMembers = () => {
    if (members.isPending) return <StateView status="loading" />;
    if (members.isError) {
      return (
        <StateView status="error" error={members.error} onRetry={() => void members.refetch()} />
      );
    }
    if (members.data.length === 0) {
      return <StateView status="empty" message={t('agency:team.empty')} />;
    }
    return members.data.map((membership) => (
      <Card key={membership.id}>
        <Text variant="subtitle">{nameOf(membership)}</Text>
        <Badge
          label={t(`agency:team.role.${membership.role}`, {
            defaultValue: t('agency:team.role.unknown'),
          })}
          tone={membership.role === 'admin' ? 'success' : 'neutral'}
        />
        {membership.joined_at ? (
          <Text variant="caption" tone="muted">
            {t('agency:team.joinedAt', { date: formatDate(membership.joined_at) })}
          </Text>
        ) : null}
        <Button
          label={t('agency:team.remove', { name: nameOf(membership) })}
          accessibilityLabel={t('agency:team.remove', { name: nameOf(membership) })}
          onPress={() => setPending(membership)}
          disabled={removeMember.isPending}
          variant="ghost"
        />
      </Card>
    ));
  };

  const renderCandidates = () => {
    if (directory.isPending) return <StateView status="loading" />;
    if (directory.isError) {
      return (
        <StateView
          status="error"
          error={directory.error}
          onRetry={() => void directory.refetch()}
        />
      );
    }
    if (directory.data.technicians.length === 0) {
      return <Text tone="muted">{t('agency:team.noResult')}</Text>;
    }
    return directory.data.technicians.map((technician) => (
      <Button
        key={technician.id}
        label={t('agency:team.choose', { name: technician.name })}
        accessibilityLabel={t('agency:team.choose', { name: technician.name })}
        onPress={() => void attach(technician.id)}
        disabled={addMember.isPending}
        variant="secondary"
      />
    ));
  };

  return (
    <Screen scroll onRefresh={() => void members.refetch()} refreshing={members.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('agency:team.title')}
      </Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {renderMembers()}
      <Card>
        <Text variant="subtitle">{t('agency:team.add')}</Text>
        <TextField label={t('agency:team.search')} value={draft} onChangeText={setDraft} />
        <Button
          label={t('agency:team.searchSubmit')}
          onPress={() => setSearch(draft)}
          variant="secondary"
        />
        {renderCandidates()}
      </Card>
      <ConfirmDialog
        visible={pending !== null}
        title={t('agency:team.removeTitle')}
        message={t('agency:team.removeMessage', { name: pending ? nameOf(pending) : '' })}
        onConfirm={() => void detach()}
        onCancel={() => setPending(null)}
      />
    </Screen>
  );
}
