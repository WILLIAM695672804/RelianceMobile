import { useTranslation } from 'react-i18next';

import { TechnicianProfileSummary, useTechnicianProfile } from '@/features/matching';
import { FollowButton } from '@/features/social';
import { Screen, StateView, Text } from '@/shared/components';

export interface TechnicianPublicProfileScreenProps {
  technicianId: string;
}

/** Profil public d'un technicien, consulté depuis l'annuaire. */
export function TechnicianPublicProfileScreen({
  technicianId,
}: TechnicianPublicProfileScreenProps) {
  const { t } = useTranslation();
  const profile = useTechnicianProfile(technicianId);

  const renderContent = () => {
    if (profile.isPending) return <StateView status="loading" />;
    if (profile.isError) {
      return (
        <StateView status="error" error={profile.error} onRetry={() => void profile.refetch()} />
      );
    }
    return (
      <>
        <TechnicianProfileSummary profile={profile.data} />
        <FollowButton userId={technicianId} name={profile.data.name} />
      </>
    );
  };

  return (
    <Screen scroll>
      <Text variant="caption" tone="muted">
        {t('directory:profileTitle')}
      </Text>
      {renderContent()}
    </Screen>
  );
}
