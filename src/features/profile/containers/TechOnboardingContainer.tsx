import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { useSession } from '@/core/session';
import { locateDevice } from '@/shared/location';
import { QueryGate, useToast } from '@/shared/ui';

import { useUpdateProfile } from '../hooks/useProfileMutations';
import { useSkillCatalog } from '../hooks/useSkillCatalog';
import {
  useAddTechnicianSkill,
  useMyTechnicianSkills,
  useTechnicianIdentity,
  useUpdateServiceArea,
  useUpdateTechnicianProfile,
} from '../hooks/useTechnician';
import type { Skill } from '../schemas/skillSchemas';
import type { TechnicianIdentity, TechnicianSkill } from '../schemas/technicianSchemas';
import {
  TechOnboardingView,
  type OnboardingValues,
  type SkillLevel,
} from '../ui/TechOnboardingView';

/** Niveau déclaré vers l'échelle de maîtrise du serveur (1 à 5). */
export const LEVEL_PROFICIENCY: Record<SkillLevel, number> = { junior: 2, confirmed: 3, expert: 5 };

const levelOf = (proficiency: number | null | undefined): SkillLevel =>
  (proficiency ?? 3) >= 5 ? 'expert' : (proficiency ?? 3) <= 2 ? 'junior' : 'confirmed';

/** Valeurs initiales tirées du profil professionnel et des compétences déjà déclarées. */
export function onboardingInitial(
  name: string,
  identity: TechnicianIdentity | undefined,
  skills: readonly TechnicianSkill[],
): OnboardingValues {
  const first = skills[0];
  return {
    name: identity?.name ?? name,
    phone: identity?.phone ?? '',
    city: identity?.service_perimeter?.city ?? '',
    bio: identity?.bio ?? '',
    skills: Object.fromEntries(skills.map((skill) => [skill.slug, levelOf(skill.proficiency)])),
    diagnosticFee: first?.travel_fee != null ? String(first.travel_fee) : '',
    hourlyRate: first?.hourly_rate != null ? String(first.hourly_rate) : '',
    radiusKm: identity?.service_perimeter?.radius ?? 10,
  };
}

/** Compétences à ajouter : choisies, connues du catalogue, pas encore déclarées. */
export function skillsToAdd(
  values: OnboardingValues,
  catalog: readonly Skill[],
  declared: readonly TechnicianSkill[],
): { skillId: string; level: SkillLevel }[] {
  const owned = new Set(declared.map((skill) => skill.slug));
  return Object.entries(values.skills)
    .filter(([slug]) => !owned.has(slug))
    .flatMap(([slug, level]) => {
      const skill = catalog.find((item) => item.slug === slug);
      return skill ? [{ skillId: skill.id, level }] : [];
    });
}

export interface TechOnboardingContainerProps {
  onBack: () => void;
  onDone: () => void;
}

/**
 * Installation du technicien : identité, compétences, tarifs et zone, enregistrés auprès des
 * points d'accès existants. Le forfait de diagnostic est porté par les frais de déplacement,
 * seul forfait que le serveur connaisse par compétence.
 */
export function TechOnboardingContainer({ onBack, onDone }: TechOnboardingContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const sessionName = useSession((state) => state.user?.name ?? '');
  const identity = useTechnicianIdentity();
  const mySkills = useMyTechnicianSkills();
  const catalog = useSkillCatalog();
  const updateProfile = useUpdateProfile();
  const updateTechnician = useUpdateTechnicianProfile();
  const addSkill = useAddTechnicianSkill();
  const updateArea = useUpdateServiceArea();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values: OnboardingValues) => {
    setSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        name: values.name.trim(),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      });
      await updateTechnician.mutateAsync({
        bio: values.bio.trim(),
        competences: identity.data?.competences ?? [],
      });
      for (const { skillId, level } of skillsToAdd(
        values,
        catalog.data ?? [],
        mySkills.data ?? [],
      )) {
        await addSkill.mutateAsync({
          skillId,
          proficiency: LEVEL_PROFICIENCY[level],
          experienceYears: 0,
          hourlyRate: Number(values.hourlyRate) || 0,
          travelFee: Number(values.diagnosticFee) || 0,
        });
      }
      const located = await locateDevice();
      const perimeter = identity.data?.service_perimeter;
      const point =
        located.status === 'located'
          ? located.place
          : perimeter?.latitude != null && perimeter.longitude != null
            ? { latitude: perimeter.latitude, longitude: perimeter.longitude }
            : null;
      if (!point) {
        toast.show({ kind: 'warning', title: t('profile:onboardingSave.positionRequired') });
        return;
      }
      await updateArea.mutateAsync({
        latitude: point.latitude,
        longitude: point.longitude,
        address: null,
        city: values.city.trim() || null,
        radius: values.radiusKm,
        zones: perimeter?.zones ?? [],
      });
      toast.show({ kind: 'success', title: t('profile:onboardingSave.saved') });
      onDone();
    } catch (error) {
      toast.show({ kind: 'error', title: describeError(normalizeError(error), t) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <QueryGate queries={[identity, mySkills, catalog]}>
      {() => (
        <TechOnboardingView
          initial={onboardingInitial(sessionName, identity.data, mySkills.data ?? [])}
          skillOptions={(catalog.data ?? []).map((skill) => ({
            slug: skill.slug,
            label: skill.name,
          }))}
          submitting={submitting}
          onBack={onBack}
          onSubmit={(values) => void submit(values)}
        />
      )}
    </QueryGate>
  );
}
