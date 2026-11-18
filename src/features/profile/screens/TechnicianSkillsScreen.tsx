import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { FormField } from '@/shared/forms';
import {
  Banner,
  Button,
  Card,
  ChoiceChip,
  ConfirmSheet,
  EmptyState,
  ListRow,
  QueryGate,
  Screen,
  Section,
  SectionLabel,
  Text,
  TopBar,
} from '@/shared/ui';
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

export interface TechnicianSkillsScreenProps {
  onBack?: () => void;
}

/** Compétences tarifées : liste des compétences déclarées, ajout depuis le catalogue, retrait. */
export function TechnicianSkillsScreen({ onBack }: TechnicianSkillsScreenProps = {}) {
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

  return (
    <Screen
      testID="competences"
      onRefresh={() => void mine.refetch()}
      refreshing={mine.isRefetching}
    >
      <TopBar title={t('profile:skills.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {notice ? <Banner tone="success" message={notice} /> : null}
        {error ? <Banner tone="danger" message={error} /> : null}
        <QueryGate queries={[mine]}>
          {() =>
            (mine.data ?? []).length === 0 ? (
              <EmptyState
                icon="wrench"
                title={t('profile:skills.title')}
                message={t('profile:skills.empty')}
              />
            ) : (
              <Card padding={0}>
                {mine.data!.map((skill, index) => (
                  <View key={skill.id}>
                    <ListRow
                      icon="wrench"
                      divider={index > 0}
                      title={skill.name}
                      detail={[
                        skill.category,
                        t('profile:skills.detail', {
                          level: skill.proficiency ?? 1,
                          rate: formatAmount(skill.hourly_rate ?? 0),
                          years: skill.experience_years ?? 0,
                        }),
                        t('profile:skills.travelFee', {
                          amount: formatAmount(skill.travel_fee ?? 0),
                        }),
                      ]
                        .filter(Boolean)
                        .join('\n')}
                    />
                    <View
                      style={{
                        alignSelf: 'stretch',
                        alignItems: 'flex-end',
                        paddingHorizontal: 16,
                        paddingBottom: 10,
                      }}
                    >
                      <Button
                        label={t('profile:skills.remove')}
                        accessibilityLabel={`${t('profile:skills.remove')} : ${skill.name}`}
                        variant="ghost"
                        size="sm"
                        onPress={() => setPendingRemoval(skill)}
                        disabled={removeSkill.isPending}
                      />
                    </View>
                  </View>
                ))}
              </Card>
            )
          }
        </QueryGate>
      </View>
      <Section title={t('profile:skills.add')}>
        <View style={{ paddingHorizontal: 20 }}>
          <AddSkillForm
            ownedIds={mine.data?.map((skill) => skill.id) ?? []}
            onAdded={() => {
              setError(null);
              setNotice(t('profile:skills.added'));
            }}
          />
        </View>
      </Section>
      <ConfirmSheet
        visible={pendingRemoval !== null}
        destructive
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
  const proficiency = useWatch({ control: form.control, name: 'proficiency' });

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
    <Card padding={16}>
      <View style={{ gap: 14 }}>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        {catalogue.isError ? (
          <Banner tone="danger" message={describeError(normalizeError(catalogue.error), t)} />
        ) : null}
        <Button
          label={selected?.name ?? t('profile:skills.chooseSkill')}
          accessibilityLabel={t('profile:skills.chooseSkill')}
          icon="search"
          variant="soft"
          full
          onPress={() => setPicking((open) => !open)}
          disabled={available.length === 0}
        />
        {available.length === 0 && catalogue.isSuccess ? (
          <Text variant="caption" tone="muted">
            {t('profile:skills.allDeclared')}
          </Text>
        ) : null}
        {picking
          ? groups.map((group) => (
              <View key={group.category} style={{ gap: 6 }}>
                <SectionLabel label={group.category} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {group.skills.map((skill) => (
                    <ChoiceChip
                      key={skill.id}
                      label={skill.name}
                      selected={selected?.id === skill.id}
                      onPress={() => choose(skill)}
                    />
                  ))}
                </View>
              </View>
            ))
          : null}
        <SectionLabel label={t('profile:skills.proficiency')} />
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {PROFICIENCY_LEVELS.map((level) => (
            <ChoiceChip
              key={level}
              label={t('profile:skills.level', { level })}
              selected={proficiency === level}
              onPress={() => form.setValue('proficiency', level, { shouldValidate: true })}
            />
          ))}
        </View>
        <FormField
          control={form.control}
          name="experienceYears"
          label={t('profile:skills.experience')}
          icon="clock"
          keyboardType="number-pad"
        />
        <FormField
          control={form.control}
          name="hourlyRate"
          label={t('profile:skills.hourlyRate')}
          icon="wallet"
          keyboardType="number-pad"
        />
        <FormField
          control={form.control}
          name="travelFee"
          label={t('profile:skills.travelFeeField')}
          icon="location"
          keyboardType="number-pad"
        />
        <Button
          label={t('profile:skills.submit')}
          full
          onPress={() => void onSubmit()}
          loading={addSkill.isPending}
        />
      </View>
    </Card>
  );
}
