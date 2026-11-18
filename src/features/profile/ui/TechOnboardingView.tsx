import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  BackButton,
  Button,
  Card,
  ChoiceChip,
  Field,
  Icon,
  DEFAULT_CENTER,
  GeoMap,
  type GeoPoint,
  PhaseBar,
  Screen,
  Text,
  TextAction,
  type IconName,
} from '@/shared/ui';

export type SkillLevel = 'junior' | 'confirmed' | 'expert';
const LEVELS: readonly SkillLevel[] = ['junior', 'confirmed', 'expert'];
const RADII = [5, 10, 15, 25] as const;

export interface OnboardingValues {
  name: string;
  phone: string;
  city: string;
  bio: string;
  skills: Record<string, SkillLevel>;
  diagnosticFee: string;
  hourlyRate: string;
  radiusKm: number;
}

export interface TechOnboardingViewProps {
  initial: OnboardingValues;
  /** Métiers proposés (catalogue du serveur). */
  skillOptions: readonly { slug: string; label: string }[];
  /** Centre de la zone d'intervention déjà déclarée, s'il est connu. */
  zoneCenter?: GeoPoint | null;
  submitting?: boolean;
  onBack: () => void;
  onSubmit: (values: OnboardingValues) => void;
}

const STEPS: readonly {
  key: 'profile' | 'skills' | 'rates' | 'zone' | 'review';
  icon: IconName;
}[] = [
  { key: 'profile', icon: 'user' },
  { key: 'skills', icon: 'wrench' },
  { key: 'rates', icon: 'wallet' },
  { key: 'zone', icon: 'map' },
  { key: 'review', icon: 'check' },
];

/** Installation du technicien en cinq étapes (maquette `TechOnboardingScreen`). */
export function TechOnboardingView({
  initial,
  skillOptions,
  zoneCenter,
  submitting = false,
  onBack,
  onSubmit,
}: TechOnboardingViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initial);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;
  const set = <K extends keyof OnboardingValues>(key: K, value: OnboardingValues[K]) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const canContinue =
    current.key === 'profile'
      ? values.name.trim().length > 0 && values.city.trim().length > 0
      : current.key === 'skills'
        ? Object.keys(values.skills).length > 0
        : true;

  const toggleSkill = (slug: string) => {
    const next = { ...values.skills };
    if (next[slug]) delete next[slug];
    else next[slug] = 'confirmed';
    set('skills', next);
  };

  const skillLabel = (slug: string) =>
    skillOptions.find((option) => option.slug === slug)?.label ?? slug;

  return (
    <Screen
      testID="installation-technicien"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {step > 0 ? (
            <View style={{ flex: 1 }}>
              <Button
                label={t('profile:onboarding.previous')}
                variant="ghost"
                size="lg"
                full
                onPress={() => setStep(step - 1)}
              />
            </View>
          ) : null}
          <View style={{ flex: 2 }}>
            <Button
              label={t(last ? 'profile:onboarding.submit' : 'profile:onboarding.continue')}
              iconRight={last ? undefined : 'arrowR'}
              size="lg"
              full
              disabled={!canContinue}
              loading={submitting}
              onPress={() => (last ? onSubmit(values) : setStep(step + 1))}
            />
          </View>
        </View>
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        <BackButton onPress={() => (step > 0 ? setStep(step - 1) : onBack())} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
            {t('profile:onboarding.step', { step: step + 1, count: STEPS.length })}
          </Text>
          <PhaseBar phase={step + 1} count={STEPS.length} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: theme.tint.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={current.icon} size={24} tone="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="title" accessibilityRole="header">
              {t(`profile:onboarding.steps.${current.key}.title`)}
            </Text>
            <Text variant="caption" tone="muted">
              {t(`profile:onboarding.steps.${current.key}.hint`)}
            </Text>
          </View>
        </View>

        {current.key === 'profile' ? (
          <>
            <Field
              label={t('profile:onboarding.name')}
              icon="user"
              value={values.name}
              onChangeText={(text) => set('name', text)}
            />
            <Field
              label={t('profile:onboarding.phone')}
              icon="phone"
              value={values.phone}
              onChangeText={(text) => set('phone', text)}
              keyboardType="phone-pad"
            />
            <Field
              label={t('profile:onboarding.city')}
              icon="pin"
              value={values.city}
              onChangeText={(text) => set('city', text)}
            />
            <Field
              label={t('profile:onboarding.bio')}
              value={values.bio}
              onChangeText={(text) => set('bio', text)}
              multiline
            />
          </>
        ) : null}

        {current.key === 'skills' ? (
          <View style={{ gap: 8 }}>
            {skillOptions.map((option) => {
              const level = values.skills[option.slug];
              return (
                <Card
                  key={option.slug}
                  padding={14}
                  style={level ? { borderColor: theme.colors.primary } : undefined}
                >
                  <ChoiceRowHeader
                    label={option.label}
                    selected={Boolean(level)}
                    onPress={() => toggleSkill(option.slug)}
                  />
                  {level ? (
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                      {LEVELS.map((item) => (
                        <ChoiceChip
                          key={item}
                          label={t(`profile:onboarding.levels.${item}`)}
                          selected={item === level}
                          onPress={() => set('skills', { ...values.skills, [option.slug]: item })}
                        />
                      ))}
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        ) : null}

        {current.key === 'rates' ? (
          <>
            <Field
              label={t('profile:onboarding.diagnosticFee')}
              icon="wallet"
              value={values.diagnosticFee}
              onChangeText={(text) => set('diagnosticFee', text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              hint={t('profile:onboarding.diagnosticHint')}
            />
            <Field
              label={t('profile:onboarding.hourlyRate')}
              icon="clock"
              value={values.hourlyRate}
              onChangeText={(text) => set('hourlyRate', text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              hint={t('profile:onboarding.hourlyHint')}
            />
          </>
        ) : null}

        {current.key === 'zone' ? (
          <>
            <View style={{ height: 180, borderRadius: 16, overflow: 'hidden' }}>
              <GeoMap
                compact
                // Le rayon choisi redessine le cercle : la clé recadre la carte à chaque choix.
                key={values.radiusKm}
                zoneCenter={zoneCenter ?? DEFAULT_CENTER}
                radiusKm={values.radiusKm}
                you={zoneCenter ?? null}
              />
            </View>
            <Text variant="caption" tone="muted">
              {t('profile:onboarding.radius')}
            </Text>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 6 }}>
              {RADII.map((radius) => (
                <ChoiceChip
                  key={radius}
                  label={`${radius} km`}
                  selected={values.radiusKm === radius}
                  onPress={() => set('radiusKm', radius)}
                />
              ))}
            </View>
          </>
        ) : null}

        {current.key === 'review' ? (
          <View style={{ gap: 10 }}>
            {[
              {
                key: 'profile',
                step: 0,
                items: [values.name, values.phone, values.city].filter(Boolean),
              },
              {
                key: 'skills',
                step: 1,
                items: Object.entries(values.skills).map(
                  ([slug, level]) =>
                    `${skillLabel(slug)} · ${t(`profile:onboarding.levels.${level}`)}`,
                ),
              },
              {
                key: 'rates',
                step: 2,
                items: [
                  values.diagnosticFee
                    ? t('profile:onboarding.reviewDiagnostic', {
                        amount: formatAmount(Number(values.diagnosticFee)),
                      })
                    : null,
                  values.hourlyRate
                    ? t('profile:onboarding.reviewHourly', {
                        amount: formatAmount(Number(values.hourlyRate)),
                      })
                    : null,
                ].filter((item): item is string => Boolean(item)),
              },
              {
                key: 'zone',
                step: 3,
                items: [
                  t('profile:onboarding.reviewZone', {
                    radius: values.radiusKm,
                    city: values.city,
                  }),
                ],
              },
            ].map((section) => (
              <Card key={section.key} padding={14}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="labelStrong">
                    {t(`profile:onboarding.steps.${section.key}.title`)}
                  </Text>
                  <TextAction
                    label={t('profile:onboarding.edit')}
                    onPress={() => setStep(section.step)}
                  />
                </View>
                {section.items.map((item) => (
                  <Text
                    key={item}
                    variant="caption"
                    tone="muted"
                    style={{ fontFamily: theme.fontFamily.body }}
                  >
                    {item}
                  </Text>
                ))}
              </Card>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function ChoiceRowHeader({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 32,
      }}
    >
      <Text variant="bodyStrong">{label}</Text>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
          backgroundColor: selected ? theme.colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? <Icon name="check" size={14} strokeWidth={3} tone="onPrimary" /> : null}
      </View>
    </Pressable>
  );
}
