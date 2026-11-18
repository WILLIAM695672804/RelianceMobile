import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FormField } from '@/shared/forms';
import { Banner, Button, Card, Pill, Text } from '@/shared/ui';

import { useUpdateJobPhases } from '../hooks/useMissions';
import { nextPhaseStatus, PHASE_STATUSES, PHASE_TONES, type PhaseStatus } from '../model/jobStatus';
import { phaseFormSchema, toPhasePayload, type JobPhase } from '../schemas/missionSchemas';

export interface MissionPhasesCardProps {
  jobId: string;
  /**
   * Phases enregistrées côté serveur ; elles amorcent le brouillon local.
   * L'appelant remonte le composant (prop `key`) lorsque le serveur renvoie d'autres phases.
   */
  phases: JobPhase[];
}

const asPhaseStatus = (status: string): PhaseStatus =>
  (PHASE_STATUSES as readonly string[]).includes(status) ? (status as PhaseStatus) : 'pending';

/** E18 — Phases de travail : ajout, cycle de statut, retrait, puis enregistrement explicite. */
export function MissionPhasesCard({ jobId, phases }: MissionPhasesCardProps) {
  const { t } = useTranslation();
  const savePhases = useUpdateJobPhases(jobId);
  const [draft, setDraft] = useState<JobPhase[]>(phases);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ resolver: zodResolver(phaseFormSchema), defaultValues: { title: '' } });

  const addPhase = form.handleSubmit((values) => {
    setNotice(null);
    setError(null);
    setDraft((current) => [...current, toPhasePayload(values)]);
    form.reset();
  });

  const togglePhase = (index: number) => {
    setDraft((current) =>
      current.map((phase, position) =>
        position === index
          ? { ...phase, status: nextPhaseStatus(asPhaseStatus(phase.status)) }
          : phase,
      ),
    );
  };

  const removePhase = (index: number) => {
    setDraft((current) => current.filter((_, position) => position !== index));
  };

  const save = async () => {
    setNotice(null);
    setError(null);
    try {
      await savePhases.mutateAsync(draft);
      setNotice(t('missions:phases.saved'));
    } catch {
      setError(t('missions:phases.saveFailed'));
    }
  };

  return (
    <Card padding={16}>
      <View style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Text variant="section">{t('missions:phases.title')}</Text>
          <Text variant="caption" tone="muted">
            {t('missions:phases.hint')}
          </Text>
        </View>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        {draft.length === 0 ? (
          <Text variant="label" tone="muted">
            {t('missions:phases.empty')}
          </Text>
        ) : (
          draft.map((phase, index) => (
            <View key={`${phase.title}-${index}`} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="labelStrong" style={{ flex: 1 }}>
                  {phase.title}
                </Text>
                <Pill
                  size="sm"
                  label={t(`missions:phases.statusLabel.${asPhaseStatus(phase.status)}`)}
                  tone={PHASE_TONES[asPhaseStatus(phase.status)]}
                />
              </View>
              {phase.notes ? (
                <Text variant="caption" tone="muted">
                  {phase.notes}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  label={t('missions:phases.advance')}
                  icon="arrowR"
                  size="sm"
                  variant="soft"
                  accessibilityLabel={t('missions:phases.toggle', { title: phase.title })}
                  onPress={() => togglePhase(index)}
                />
                <Button
                  label={t('missions:phases.remove', { title: phase.title })}
                  icon="close"
                  size="sm"
                  variant="ghost"
                  accessibilityLabel={t('missions:phases.remove', { title: phase.title })}
                  onPress={() => removePhase(index)}
                />
              </View>
            </View>
          ))
        )}
        <FormField control={form.control} name="title" label={t('missions:phases.newTitle')} />
        <Button
          label={t('missions:phases.add')}
          icon="plus"
          variant="soft"
          full
          onPress={() => void addPhase()}
        />
        <Button
          label={t('missions:phases.save')}
          icon="check"
          full
          onPress={() => void save()}
          loading={savePhases.isPending}
          disabled={draft.length === 0}
        />
      </View>
    </Card>
  );
}
