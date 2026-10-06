import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Button,
  Card,
  ConfirmDialog,
  FormTextField,
  ListItem,
  Screen,
  StateView,
  Text,
} from '@/shared/components';
import { formatAmount } from '@/shared/format';

import { useSkillCatalog } from '../hooks/useSkillCatalog';
import {
  useAddTechnicianSkill,
  useMyTechnicianSkills,
  useRemoveTechnicianSkill,
} from '../hooks/useTechnician';
import { groupSkillsByCategory } from '../model/skillGroups';
import type { Skill } from '../schemas/skillSchemas';
import {
  mapTechnicianSkillFieldErrors,
  PROFICIENCY_LEVELS,
  technicianSkillFormSchema,
  toTechnicianSkillPayload,
  type TechnicianSkill,
  type TechnicianSkillFormField,
} from '../schemas/technicianSchemas';

/** Compétences tarifées : liste des compétences déclarées, ajout depuis le catalogue, retrait. */
export function TechnicianSkillsScreen() {
  const { t } = useTranslation();
  const mine = useMyTechnicianSkills();
  const removeSkill = useRemoveTechnicianSkill();
  const [pendingRemoval, setPendingRemoval] = useState<TechnicianSkill | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmRemoval = async () => {
    const target = pendingRemoval;
    setPendingRemoval(null);
    if (!target) return;
    setNotice(null);
    setError(null);
    try {
      await removeSkill.mutateAsync(target.id);
      setNotice(t('profile:skills.removed'));
    } catch (cause) {
      setError(describeError(normalizeError(cause), t));
    }
  };

  const renderSkills = () => {
    if (mine.isPending) return <StateView status="loading" />;
    if (mine.isError) {
      return <StateView status="error" error={mine.error} onRetry={() => void mine.refetch()} />;
    }
    if (mine.data.length === 0) {
      return <StateView status="empty" message={t('profile:skills.empty')} />;
    }
    return mine.data.map((skill) => (
      <Card key={skill.id}>
        <Text variant="subtitle">{skill.name}</Text>
        {skill.category ? <Text tone="muted">{skill.category}</Text> : null}
        <Text>
          {t('profile:skills.detail', {
            level: skill.proficiency ?? 1,
            rate: formatAmount(skill.hourly_rate ?? 0),
            years: skill.experience_years ?? 0,
          })}
        </Text>
        <Text tone="muted">
          {t('profile:skills.travelFee', { amount: formatAmount(skill.travel_fee ?? 0) })}
        </Text>
        <Button
          label={t('profile:skills.remove')}
          accessibilityLabel={`${t('profile:skills.remove')} : ${skill.name}`}
          onPress={() => setPendingRemoval(skill)}
          disabled={removeSkill.isPending}
          variant="ghost"
        />
      </Card>
    ));
  };

  return (
    <Screen scroll onRefresh={() => void mine.refetch()} refreshing={mine.isRefetching}>
      <Text variant="title" accessibilityRole="header">
        {t('profile:skills.title')}
      </Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      {renderSkills()}
      <AddSkillForm
        ownedIds={mine.data?.map((skill) => skill.id) ?? []}
        onAdded={() => {
          setError(null);
          setNotice(t('profile:skills.added'));
        }}
      />
      <ConfirmDialog
        visible={pendingRemoval !== null}
        title={t('profile:skills.removeTitle')}
        message={t('profile:skills.removeMessage', { name: pendingRemoval?.name ?? '' })}
        confirmLabel={t('profile:skills.remove')}
        onConfirm={() => void confirmRemoval()}
        onCancel={() => setPendingRemoval(null)}
      />
    </Screen>
  );
}

/** Formulaire d'ajout : catalogue public moins les compétences déjà déclarées. */
function AddSkillForm({ ownedIds, onAdded }: { ownedIds: string[]; onAdded: () => void }) {
  const { t } = useTranslation();
  const catalogue = useSkillCatalog();
  const addSkill = useAddTechnicianSkill();
  const [formError, setFormError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<Skill | null>(null);
  const form = useForm({
    resolver: zodResolver(technicianSkillFormSchema),
    defaultValues: {
      skillId: '',
      proficiency: 3,
      experienceYears: '0',
      hourlyRate: '0',
      travelFee: '0',
    },
  });
  const proficiency = form.watch('proficiency');

  const available = (catalogue.data ?? []).filter((skill) => !ownedIds.includes(skill.id));
  const groups = groupSkillsByCategory(available, t('profile:skills.chooseSkill'));

  const choose = (skill: Skill) => {
    setSelected(skill);
    setPicking(false);
    form.setValue('skillId', skill.id, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await addSkill.mutateAsync(toTechnicianSkillPayload(values));
      setSelected(null);
      form.reset();
      onAdded();
    } catch (error) {
      const appError = normalizeError(error);
      const mapped = Object.entries(mapTechnicianSkillFieldErrors(appError.fieldErrors));
      for (const [field, messages] of mapped) {
        const message = messages[0];
        if (message) form.setError(field as TechnicianSkillFormField, { type: 'server', message });
      }
      if (mapped.length === 0) setFormError(describeError(appError, t));
    }
  });

  return (
    <Card>
      <Text variant="subtitle">{t('profile:skills.add')}</Text>
      {formError ? <Text tone="danger">{formError}</Text> : null}
      {catalogue.isError ? (
        <StateView
          status="error"
          error={catalogue.error}
          onRetry={() => void catalogue.refetch()}
        />
      ) : null}
      <Button
        label={selected?.name ?? t('profile:skills.chooseSkill')}
        accessibilityLabel={t('profile:skills.chooseSkill')}
        onPress={() => setPicking((open) => !open)}
        disabled={available.length === 0}
        variant="secondary"
      />
      {available.length === 0 && catalogue.isSuccess ? (
        <Text tone="muted">{t('profile:skills.allDeclared')}</Text>
      ) : null}
      {picking
        ? groups.map((group) => (
            <View key={group.category} style={styles.group}>
              <Text variant="caption" tone="muted">
                {group.category}
              </Text>
              {group.skills.map((skill) => (
                <ListItem key={skill.id} label={skill.name} onPress={() => choose(skill)} />
              ))}
            </View>
          ))
        : null}
      <Text variant="caption" tone="muted">
        {t('profile:skills.proficiency')}
      </Text>
      <View style={styles.levels}>
        {PROFICIENCY_LEVELS.map((level) => (
          <Button
            key={level}
            label={String(level)}
            accessibilityLabel={t('profile:skills.level', { level })}
            onPress={() => form.setValue('proficiency', level, { shouldValidate: true })}
            variant={proficiency === level ? 'primary' : 'ghost'}
          />
        ))}
      </View>
      <FormTextField
        control={form.control}
        name="experienceYears"
        label={t('profile:skills.experience')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={form.control}
        name="hourlyRate"
        label={t('profile:skills.hourlyRate')}
        keyboardType="number-pad"
      />
      <FormTextField
        control={form.control}
        name="travelFee"
        label={t('profile:skills.travelFeeField')}
        keyboardType="number-pad"
      />
      <Button
        label={t('profile:skills.submit')}
        onPress={() => void onSubmit()}
        loading={addSkill.isPending}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  group: { gap: 4 },
  levels: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
