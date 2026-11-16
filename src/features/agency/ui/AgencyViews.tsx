import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount, formatRating } from '@/shared/format';
import {
  Avatar,
  Banner,
  Button,
  Card,
  ChoiceChip,
  DetailHeader,
  Icon,
  Pill,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** `null` : présence inconnue (le serveur ne l'expose pas). */
  online: boolean | null;
  jobs: number | null;
  rating: number | null;
  /** `null` : charge du jour inconnue. */
  today: number | null;
  kycPending?: boolean;
}

export interface PendingJob {
  id: string;
  client: string;
  service: string;
  zone: string;
  when: string;
  urgent: boolean;
  estimate: number | null;
}

export interface AgencyDashboardViewProps {
  agencyName: string;
  /** Surtitre (ville, statut) ; « Agence · Yaoundé » par défaut. */
  eyebrow?: string;
  stats: readonly { label: string; value: string; detail: string }[];
  alerts: readonly { id: string; message: string }[];
  jobs: readonly PendingJob[];
  team: readonly TeamMember[];
  onTeam: () => void;
  onAssign?: (job: PendingJob) => void;
  onMember: (member: TeamMember) => void;
}

/** Tableau de bord de l'agence (maquette `AgencyDashboardScreen`), présentation pure. */
export function AgencyDashboardView(props: AgencyDashboardViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen withTabBar testID="tableau-agence">
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
          {props.eyebrow ?? t('agency:board.eyebrow')}
        </Text>
        <Text variant="display" accessibilityRole="header" style={{ fontSize: 28, lineHeight: 32 }}>
          {props.agencyName}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        {props.stats.map((stat, index) => (
          <Card
            key={stat.label}
            padding={14}
            style={[
              { width: '47%', flexGrow: 1 },
              index === 0
                ? { backgroundColor: theme.colors.text, borderColor: theme.colors.text }
                : null,
            ]}
          >
            <Text
              variant="caption"
              style={{ color: index === 0 ? theme.colors.background : theme.colors.textMuted }}
            >
              {stat.label}
            </Text>
            <Text
              variant="title"
              style={{ color: index === 0 ? theme.colors.background : theme.colors.text }}
            >
              {stat.value}
            </Text>
            <Text
              variant="caption"
              style={{
                color: index === 0 ? theme.colors.background : theme.colors.success,
                fontSize: 11,
              }}
            >
              {stat.detail}
            </Text>
          </Card>
        ))}
      </View>
      {props.alerts.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}>
          {props.alerts.map((alert) => (
            <Banner key={alert.id} tone="warning" message={alert.message} />
          ))}
        </View>
      ) : null}
      {props.jobs.length > 0 ? (
        <Section title={t('agency:board.toAssign')}>
          <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {props.jobs.map((job) => (
              <Card
                key={job.id}
                padding={14}
                onPress={props.onAssign ? () => props.onAssign!(job) : undefined}
                accessibilityLabel={`${job.service} · ${job.client}`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text variant="labelStrong">{job.service}</Text>
                      {job.urgent ? (
                        <Pill label={t('agency:board.urgent')} tone="danger" size="sm" />
                      ) : null}
                    </View>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {job.client} · {job.zone} · {job.when}
                    </Text>
                  </View>
                  {job.estimate != null ? (
                    <Text variant="labelStrong" style={{ fontFamily: theme.fontFamily.display }}>
                      {formatAmount(job.estimate)}
                    </Text>
                  ) : null}
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}
      <Section
        title={t('agency:board.team')}
        action={
          <Pressable
            accessibilityRole="link"
            onPress={props.onTeam}
            style={{ minHeight: 48, justifyContent: 'center' }}
          >
            <Text variant="label" tone="primary">
              {t('agency:board.seeTeam')}
            </Text>
          </Pressable>
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {props.team.map((member) => (
            <Pressable
              key={member.id}
              accessibilityRole="button"
              accessibilityLabel={member.name}
              onPress={() => props.onMember(member)}
              style={{ width: 92, alignItems: 'center', gap: 6 }}
            >
              <View>
                <Avatar name={member.name} size={56} />
                {member.online == null ? null : (
                  <View
                    style={{
                      position: 'absolute',
                      right: 2,
                      bottom: 2,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      borderWidth: 2,
                      borderColor: theme.colors.background,
                      backgroundColor: member.online ? theme.colors.success : theme.colors.outline,
                    }}
                  />
                )}
              </View>
              <Text variant="caption" numberOfLines={1} style={{ color: theme.colors.text }}>
                {member.name.split(' ')[0]}
              </Text>
              {member.today != null ? (
                <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                  {t('agency:board.today', { count: member.today })}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </Section>
    </Screen>
  );
}

export interface TeamViewProps {
  members: readonly TeamMember[];
  onBack: () => void;
  onMember: (member: TeamMember) => void;
  onAdd?: () => void;
  /** Réserve la place de la barre d'onglets lorsque l'équipe est un onglet. */
  withTabBar?: boolean;
}

/** Annuaire de l'équipe (maquette `AgencyTeamScreen`), présentation pure. */
export function TeamView({ members, onBack, onMember, onAdd, withTabBar }: TeamViewProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'online' | 'kyc'>('all');
  const visible = members.filter((member) =>
    filter === 'online' ? member.online : filter === 'kyc' ? member.kycPending : true,
  );
  return (
    <Screen
      withTabBar={withTabBar}
      testID="equipe"
      footer={
        onAdd ? (
          <Button label={t('agency:crew.add')} icon="plus" size="lg" full onPress={onAdd} />
        ) : undefined
      }
    >
      <TopBar title={t('agency:crew.title')} onBack={onBack} />
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 12 }}>
        {(['all', 'online', 'kyc'] as const).map((key) => (
          <ChoiceChip
            key={key}
            label={t(`agency:crew.filters.${key}`)}
            selected={filter === key}
            onPress={() => setFilter(key)}
          />
        ))}
      </View>
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {visible.map((member) => (
          <Card
            key={member.id}
            padding={14}
            onPress={() => onMember(member)}
            accessibilityLabel={member.name}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={member.name} size={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="labelStrong" numberOfLines={1}>
                  {member.name}
                </Text>
                <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                  {[
                    member.role,
                    member.jobs != null ? t('agency:crew.jobs', { count: member.jobs }) : null,
                    member.rating != null ? `★ ${formatRating(member.rating)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
              {member.kycPending ? (
                <Pill label="KYC" tone="warning" size="sm" />
              ) : member.online == null ? null : (
                <Pill
                  label={t(member.online ? 'agency:crew.online' : 'agency:crew.offline')}
                  tone={member.online ? 'success' : 'neutral'}
                  size="sm"
                />
              )}
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

export interface AssignViewProps {
  job: PendingJob;
  members: readonly TeamMember[];
  assigning?: boolean;
  onBack: () => void;
  onAssign: (member: TeamMember) => void;
}

/** Affectation d'une mission à un membre (maquette `AssignJobScreen`), présentation pure. */
export function AssignView({ job, members, assigning = false, onBack, onAssign }: AssignViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = members.find((member) => member.id === selected);
  return (
    <Screen
      testID="affectation"
      footer={
        <Button
          label={t('agency:assign.submit')}
          size="lg"
          full
          disabled={!chosen}
          loading={assigning}
          onPress={() => chosen && onAssign(chosen)}
        />
      }
    >
      <DetailHeader title={t('agency:assign.title')} onBack={onBack} />
      <View style={{ padding: 20, gap: 14 }}>
        <Card padding={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {job.urgent ? <Pill label={t('agency:board.urgent')} tone="danger" size="sm" /> : null}
            <Text variant="caption" tone="muted">
              {job.when}
            </Text>
          </View>
          <Text variant="title">{job.service}</Text>
          <Text variant="label" tone="muted">
            {job.client} · {job.zone}
          </Text>
          {job.estimate != null ? (
            <Text variant="bodyStrong" style={{ marginTop: 8 }}>
              {t('agency:assign.estimate', { amount: formatAmount(job.estimate) })}
            </Text>
          ) : null}
        </Card>
        <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
          {t('agency:assign.available')}
        </Text>
        <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
          {members
            .filter((member) => member.online !== false)
            .map((member) => {
              const active = member.id === selected;
              return (
                <Pressable
                  key={member.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={member.name}
                  onPress={() => setSelected(member.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Avatar name={member.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text variant="labelStrong">{member.name}</Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {member.today != null
                        ? `${member.role} · ${t('agency:board.today', { count: member.today })}`
                        : member.role}
                    </Text>
                  </View>
                  {active ? <Icon name="check" size={18} strokeWidth={2.5} tone="primary" /> : null}
                </Pressable>
              );
            })}
        </View>
      </View>
    </Screen>
  );
}
