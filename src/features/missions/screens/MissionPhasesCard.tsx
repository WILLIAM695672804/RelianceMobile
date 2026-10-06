import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, FormTextField, Text } from '@/shared/components';

import { useUpdateJobPhases } from '../hooks/useMissions';
import { nextPhaseStatus, PHASE_STATUSES, type PhaseStatus } from '../model/jobStatus';
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
    <Card>
      <Text variant="subtitle">{t('missions:phases.title')}</Text>
      <Text variant="caption" tone="muted">
        {t('missions:phases.hint')}
      </Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {draft.length === 0 ? (
        <Text tone="muted">{t('missions:phases.empty')}</Text>
      ) : (
        draft.map((phase, index) => (
          <View key={`${phase.title}-${index}`} style={styles.phase}>
            <Text>{phase.title}</Text>
            <Text tone="muted">
              {t(`missions:phases.statusLabel.${asPhaseStatus(phase.status)}`)}
            </Text>
            {phase.notes ? (
              <Text variant="caption" tone="muted">
                {phase.notes}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <Button
                label={t('missions:phases.advance')}
                accessibilityLabel={t('missions:phases.toggle', { title: phase.title })}
                onPress={() => togglePhase(index)}
                variant="secondary"
              />
              <Button
                label={t('missions:phases.remove', { title: phase.title })}
                accessibilityLabel={t('missions:phases.remove', { title: phase.title })}
                onPress={() => removePhase(index)}
                variant="ghost"
              />
            </View>
          </View>
        ))
      )}
      <FormTextField control={form.control} name="title" label={t('missions:phases.newTitle')} />
      <Button
        label={t('missions:phases.add')}
        onPress={() => void addPhase()}
        variant="secondary"
      />
      <Button
        label={t('missions:phases.save')}
        onPress={() => void save()}
        loading={savePhases.isPending}
        disabled={draft.length === 0}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  phase: { gap: 4 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
