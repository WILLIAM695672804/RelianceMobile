import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useTechnicianDirectory } from '@/features/directory';
import { View } from 'react-native';

import {
  Avatar,
  Banner,
  Button,
  Card,
  ConfirmSheet,
  EmptyState,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  SearchBar,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';
import { formatDate } from '@/shared/format';

import { useAddAgencyMember, useAgencyMembers, useRemoveAgencyMember } from '../hooks/useAgency';
import type { AgencyMembership } from '../schemas/agencySchemas';

export interface AgencyTeamScreenProps {
  agencyId: string;
  onBack?: () => void;
}

/** Équipe de l'agence : rôles, retrait d'un membre, rattachement depuis l'annuaire. */
export function AgencyTeamScreen({ agencyId, onBack }: AgencyTeamScreenProps) {
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

  return (
    <Screen
      testID="equipe-agence"
      onRefresh={() => void members.refetch()}
      refreshing={members.isRefetching}
    >
      <TopBar title={t('agency:team.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        <QueryGate queries={[members]}>
          {() =>
            (members.data ?? []).length === 0 ? (
              <EmptyState
                icon="user"
                title={t('agency:team.title')}
                message={t('agency:team.empty')}
              />
            ) : (
              <Card padding={0}>
                {members.data!.map((membership, index) => {
                  const name = nameOf(membership);
                  return (
                    <View key={membership.id}>
                      <ListRow
                        divider={index > 0}
                        title={name}
                        detail={
                          membership.joined_at
                            ? t('agency:team.joinedAt', { date: formatDate(membership.joined_at) })
                            : undefined
                        }
                        trailing={
                          <Pill
                            size="sm"
                            label={t(`agency:team.role.${membership.role}`, {
                              defaultValue: t('agency:team.role.unknown'),
                            })}
                            tone={membership.role === 'admin' ? 'success' : 'neutral'}
                          />
                        }
                      />
                      <View
                        style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 10 }}
                      >
                        <Button
                          label={t('agency:team.remove', { name })}
                          accessibilityLabel={t('agency:team.remove', { name })}
                          variant="ghost"
                          size="sm"
                          onPress={() => setPending(membership)}
                          disabled={removeMember.isPending}
                        />
                      </View>
                    </View>
                  );
                })}
              </Card>
            )
          }
        </QueryGate>
      </View>
      <Section title={t('agency:team.add')}>
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <SearchBar
            label={t('agency:team.search')}
            placeholder={t('agency:team.search')}
            value={draft}
            onChangeText={setDraft}
            onSubmit={() => setSearch(draft)}
          />
          <Button
            label={t('agency:team.searchSubmit')}
            variant="soft"
            full
            onPress={() => setSearch(draft)}
          />
          <QueryGate queries={[directory]}>
            {() =>
              directory.data!.technicians.length === 0 ? (
                <Text variant="label" tone="muted">
                  {t('agency:team.noResult')}
                </Text>
              ) : (
                <Card padding={0}>
                  {directory.data!.technicians.map((technician, index) => (
                    <ListRow
                      key={technician.id}
                      divider={index > 0}
                      title={technician.name}
                      trailing={
                        <Avatar name={technician.name} uri={technician.avatar_url} size={28} />
                      }
                      accessibilityLabel={t('agency:team.choose', { name: technician.name })}
                      onPress={addMember.isPending ? undefined : () => void attach(technician.id)}
                    />
                  ))}
                </Card>
              )
            }
          </QueryGate>
        </View>
      </Section>
      <ConfirmSheet
        visible={pending !== null}
        destructive
        title={t('agency:team.removeTitle')}
        message={t('agency:team.removeMessage', { name: pending ? nameOf(pending) : '' })}
        onConfirm={() => void detach()}
        onCancel={() => setPending(null)}
      />
    </Screen>
  );
}
