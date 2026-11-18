import { useTranslation } from 'react-i18next';

import { formatAmount } from '@/shared/format';

import { useSession } from '@/core/session';
import { useTechnicianDirectory } from '@/features/directory';
import { useClientMission, type ClientMission } from '@/features/missions';
import { useUnreadNotificationCount } from '@/features/notifications';
import { groupSkillsByCategory, useSkillCatalog } from '@/features/profile';
import {
  ClientHomeView,
  iconForCategory,
  stageOf,
  type ActiveIntervention,
  type ServiceCategory,
} from '@/features/requests';
import { QueryGate } from '@/shared/ui';

import { toTechSummary } from './techSummary';

/** Étapes d'une demande, dans l'ordre affiché par la barre de phases. */
const STAGE_ORDER = ['toMatch', 'awaitingTechnician', 'assigned', 'closed'] as const;

export function toActiveIntervention(
  mission: ClientMission | null | undefined,
  stageLabel: (stage: string) => string,
): ActiveIntervention | null {
  if (!mission) return null;
  const stage = stageOf(mission.request.status);
  const index = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
  return {
    requestId: mission.request.id,
    technicianName: mission.technician?.name ?? '',
    title: mission.request.title,
    phase: index >= 0 ? index + 1 : 1,
    phaseCount: STAGE_ORDER.length,
    phaseLabel: stageLabel(stage),
    // Le statut figure déjà à gauche : la droite rappelle le montant convenu.
    statusLabel: mission.proposal?.price != null ? formatAmount(mission.proposal.price) : '',
  };
}

export interface ClientHomeContainerProps {
  onNotifications: () => void;
  onNewRequest: (category?: string) => void;
  onAllCategories: () => void;
  onMap: () => void;
  onTech: (technicianId: string) => void;
  onAllTechs: () => void;
  onOpenRequest: (requestId: string) => void;
  onChat: (requestId: string) => void;
}

/** Onglet « Accueil » du client. */
export function ClientHomeContainer(props: ClientHomeContainerProps) {
  const { t } = useTranslation();
  const name = useSession((state) => state.user?.name ?? '');
  const catalog = useSkillCatalog();
  const directory = useTechnicianDirectory({});
  const mission = useClientMission();
  const unread = useUnreadNotificationCount();

  return (
    <QueryGate queries={[mission]} withTabBar>
      {() => {
        const categories: ServiceCategory[] = groupSkillsByCategory(
          catalog.data ?? [],
          t('requests:form.otherCategory'),
        ).map((group) => ({
          slug: group.category,
          label: group.category,
          icon: iconForCategory(group.category),
        }));
        const technicians = directory.data?.technicians ?? [];
        const city = technicians.find((card) => card.location?.city)?.location?.city ?? '';
        return (
          <ClientHomeView
            firstName={name.split(' ')[0] ?? name}
            hasUnreadNotifications={(unread.data ?? 0) > 0}
            categories={categories}
            nearby={
              technicians.length > 0
                ? { count: directory.data?.total ?? technicians.length, area: city }
                : null
            }
            recommended={technicians.slice(0, 6).map(toTechSummary)}
            active={toActiveIntervention(mission.data, (stage) => t(`requests:stages.${stage}`))}
            onNotifications={props.onNotifications}
            onNewRequest={() => props.onNewRequest()}
            onCategory={(slug) => props.onNewRequest(slug)}
            onAllCategories={props.onAllCategories}
            onMap={props.onMap}
            onTech={(tech) => props.onTech(tech.id)}
            onAllTechs={props.onAllTechs}
            onOpenActive={props.onOpenRequest}
            onChatActive={props.onChat}
          />
        );
      }}
    </QueryGate>
  );
}
