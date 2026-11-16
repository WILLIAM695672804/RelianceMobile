import { useTranslation } from 'react-i18next';

import { QueryGate } from '@/shared/ui';

import { useAgencyMembers, useMyAgency } from '../hooks/useAgency';
import type { AgencyMember, AgencyMembership } from '../schemas/agencySchemas';
import { AgencyScreen } from '../screens/AgencyScreen';
import { AgencyDashboardView, TeamView, type TeamMember } from '../ui/AgencyViews';

export function memberOfAgency(member: AgencyMember, role: string): TeamMember {
  return {
    id: member.id,
    name: member.name,
    role,
    online: null,
    jobs: null,
    rating: null,
    today: null,
    kycPending: !member.verified,
  };
}

export function memberOfMembership(membership: AgencyMembership, role: string): TeamMember {
  return {
    id: membership.user?.id ?? membership.user_id,
    name: membership.user?.name ?? '',
    role,
    online: null,
    jobs: null,
    rating: null,
    today: null,
    kycPending: !membership.user?.verified,
  };
}

export interface AgencyHomeContainerProps {
  onTeam: () => void;
  onMember: (memberId: string) => void;
  /** Gestion de l'équipe d'une agence (création comprise) : ancien parcours. */
  onManage: (agencyId: string) => void;
}

/** Onglet « Agence » : tableau de bord de l'agence de l'utilisateur. */
export function AgencyHomeContainer({ onTeam, onMember, onManage }: AgencyHomeContainerProps) {
  const { t } = useTranslation();
  const agency = useMyAgency();
  return (
    <QueryGate queries={[agency]} withTabBar>
      {() => {
        // Aucune agence : le parcours de création existant prend le relais.
        if (!agency.data) return <AgencyScreen onOpenTeam={onManage} />;
        const members = agency.data.members;
        const verified = members.filter((member) => member.verified).length;
        const pending = members.length - verified;
        return (
          <AgencyDashboardView
            agencyName={agency.data.name}
            eyebrow={agency.data.address ?? t('agency:hub.eyebrow')}
            stats={[
              {
                label: t('agency:hub.members'),
                value: String(agency.data.members_count ?? members.length),
                detail: t('agency:hub.membersDetail'),
              },
              {
                label: t('agency:hub.verified'),
                value: String(verified),
                detail: t('agency:hub.verifiedDetail'),
              },
            ]}
            alerts={
              pending > 0
                ? [{ id: 'kyc', message: t('agency:hub.toVerify', { count: pending }) }]
                : []
            }
            jobs={[]}
            team={members.map((member) => memberOfAgency(member, t('agency:hub.technician')))}
            onTeam={onTeam}
            onMember={(member) => onMember(member.id)}
          />
        );
      }}
    </QueryGate>
  );
}

export interface TeamContainerProps {
  agencyId: string;
  onBack: () => void;
  onMember: (memberId: string) => void;
  onAdd?: () => void;
  withTabBar?: boolean;
}

/** Équipe de l'agence. */
export function TeamContainer(props: TeamContainerProps) {
  const { agencyId, onBack, onMember } = props;
  const { t } = useTranslation();
  const members = useAgencyMembers(agencyId);
  return (
    <QueryGate queries={[members]} withTabBar={props.withTabBar}>
      {() => (
        <TeamView
          members={(members.data ?? []).map((membership) =>
            memberOfMembership(
              membership,
              t(`agency:team.role.${membership.role}`, {
                defaultValue: t('agency:team.role.unknown'),
              }),
            ),
          )}
          onBack={onBack}
          onMember={(member) => onMember(member.id)}
          onAdd={props.onAdd}
          withTabBar={props.withTabBar}
        />
      )}
    </QueryGate>
  );
}

/** Onglet « Équipe » : équipe de l'agence de l'utilisateur. */
export function MyTeamContainer(props: Omit<TeamContainerProps, 'agencyId'>) {
  const agency = useMyAgency();
  return (
    <QueryGate queries={[agency]} withTabBar={props.withTabBar}>
      {() =>
        agency.data ? (
          <TeamContainer {...props} agencyId={agency.data.id} />
        ) : (
          <AgencyScreen onOpenTeam={() => undefined} />
        )
      }
    </QueryGate>
  );
}
