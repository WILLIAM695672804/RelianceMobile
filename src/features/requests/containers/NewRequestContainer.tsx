import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { UploadFile } from '@/core/api';
import { describeError, normalizeError } from '@/core/errors';
import { useSkillCatalog, type Skill } from '@/features/profile';
import { locateDevice, type Place } from '@/shared/location';
import { pickImage } from '@/shared/media';
import { QueryGate, useToast } from '@/shared/ui';

import { useCreateRequest } from '../hooks/useRequests';
import type { ServiceCategory } from '../model/categories';
import { iconForCategory } from '../model/categoryIcons';
import { mapRequestFieldErrors, toCreateRequestPayload } from '../schemas/requestSchemas';
import { NewRequestView, type NewRequestValues, type RequestPlace } from '../ui/NewRequestView';

/**
 * Tuiles du premier pas : le serveur attend une compétence (`category_slug` ∈ `skills.slug`).
 * Un domaine transmis par l'accueil restreint le choix à ses compétences ; un domaine inconnu
 * est ignoré.
 */
export function skillTiles(skills: readonly Skill[], domain?: string | null): ServiceCategory[] {
  const inDomain = domain ? skills.filter((skill) => skill.category === domain) : [];
  const shown = inDomain.length > 0 ? inDomain : skills;
  return shown.map((skill) => ({
    slug: skill.slug,
    label: skill.name,
    icon: iconForCategory(skill.category ?? ''),
  }));
}

/** Libellé d'une position : adresse connue, sinon repli ; ville ou coordonnées en détail. */
export function toRequestPlace(place: Place, unnamed: string): RequestPlace {
  return {
    label: place.label ?? unnamed,
    detail: place.city ?? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`,
    coordinates: { latitude: place.latitude, longitude: place.longitude },
  };
}

export interface NewRequestContainerProps {
  /** Domaine choisi sur l'accueil (nom de catégorie du catalogue). */
  domain?: string | null;
  onCreated: (requestId: string) => void;
  onBack: () => void;
}

/** Nouvelle demande : catalogue réel, position de l'appareil, photos, envoi multipart. */
export function NewRequestContainer({ domain, onCreated, onBack }: NewRequestContainerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const catalog = useSkillCatalog();
  const create = useCreateRequest();
  const [place, setPlace] = useState<Place | null>(null);
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const locate = async () => {
    setLocating(true);
    const result = await locateDevice();
    setLocating(false);
    if (result.status === 'located') {
      setPlace(result.place);
      return;
    }
    toast.show({
      kind: 'warning',
      title:
        result.status === 'denied'
          ? t('requests:form.permissionDenied.location')
          : t('requests:form.positionUnavailable'),
    });
  };

  const pickPhoto = async (): Promise<UploadFile | null> => {
    const picked = await pickImage('library', { quality: 0.7 });
    if (picked.status === 'denied') {
      toast.show({ kind: 'warning', title: t('requests:form.permissionDenied.library') });
    }
    return picked.status === 'picked' ? picked.file : null;
  };

  const submit = async (values: NewRequestValues) => {
    if (!place) return;
    setFormError(null);
    try {
      const created = await create.mutateAsync(toCreateRequestPayload({ ...values, place }));
      onCreated(created.id);
    } catch (error) {
      const appError = normalizeError(error);
      const fieldMessages = Object.values(mapRequestFieldErrors(appError.fieldErrors));
      setFormError(
        fieldMessages.length > 0
          ? fieldMessages.join('\n')
          : appError.kind === 'validation'
            ? describeError(appError, t)
            : t('requests:form.sendFailed'),
      );
    }
  };

  return (
    <QueryGate queries={[catalog]}>
      {() => {
        const categories = skillTiles(catalog.data ?? [], domain);
        return (
          <NewRequestView
            categories={categories}
            initialCategory={categories.length === 1 ? categories[0]!.slug : undefined}
            place={place ? toRequestPlace(place, t('requests:form.unnamedPlace')) : null}
            locating={locating}
            submitting={create.isPending}
            formError={formError}
            onLocate={() => void locate()}
            onPickPhoto={pickPhoto}
            onSubmit={(values) => void submit(values)}
            onBack={onBack}
          />
        );
      }}
    </QueryGate>
  );
}
