import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { TechProfileView, type TechProfile, type TechReview } from '@/features/directory';
import { useTechnicianProfile, type TechnicianProfile } from '@/features/matching';
import { useFollowStatus, useFollowUser, useUnfollowUser } from '@/features/social';
import { QueryGate, useToast } from '@/shared/ui';

/** Profil public du serveur au format de la fiche ; le tarif est celui de la première compétence. */
export function toTechProfile(profile: TechnicianProfile): TechProfile {
  const skill = profile.skills[0];
  const verified = Boolean(profile.verified);
  const perimeter = profile.service_perimeter;
  return {
    id: profile.id,
    name: profile.name,
    skill: skill?.category ?? skill?.name ?? '',
    rating: profile.rating ?? null,
    jobs: profile.num_reviews ?? null,
    distanceKm: null,
    etaMin: null,
    price: skill?.hourly_rate ?? null,
    verified,
    city: profile.service_perimeter?.city ?? null,
    bio: profile.bio ?? null,
    skills: profile.skills.map((item) => item.name),
    successRate: null,
    kycApproved: verified,
    highlight: null,
    zone:
      perimeter?.latitude != null && perimeter.longitude != null
        ? {
            center: { latitude: perimeter.latitude, longitude: perimeter.longitude },
            radiusKm: perimeter.radius ?? 10,
          }
        : null,
  };
}

export function toTechReviews(profile: TechnicianProfile, anonymous: string): TechReview[] {
  return profile.recent_reviews.map((review) => ({
    id: String(review.id),
    author: review.reviewer?.name ?? anonymous,
    rating: review.rating,
    text: review.comment ?? '',
    when: '',
  }));
}

export interface TechProfileContainerProps {
  technicianId: string;
  onBack: () => void;
  onMessage: (technicianId: string) => void;
  onBook: () => void;
}

/** Fiche publique d'un technicien : profil, avis récents, abonnement à ses publications. */
export function TechProfileContainer(props: TechProfileContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const profile = useTechnicianProfile(props.technicianId);
  const following = useFollowStatus(props.technicianId);
  const follow = useFollowUser();
  const unfollow = useUnfollowUser();

  const toggle = async () => {
    try {
      if (following.data) await unfollow.mutateAsync(props.technicianId);
      else await follow.mutateAsync(props.technicianId);
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    }
  };

  return (
    <QueryGate queries={[profile]}>
      {() => (
        <TechProfileView
          tech={toTechProfile(profile.data!)}
          works={[]}
          reviews={toTechReviews(profile.data!, t('directory:profile.anonymous'))}
          saved={Boolean(following.data)}
          onToggleSaved={following.isSuccess ? () => void toggle() : undefined}
          onBack={props.onBack}
          onMessage={() => props.onMessage(props.technicianId)}
          onBook={props.onBook}
        />
      )}
    </QueryGate>
  );
}
