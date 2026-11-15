import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import type { UploadFile } from '@/core/api';
import { useTheme, type Theme } from '@/core/theme';
import {
  BackButton,
  Banner,
  Button,
  Card,
  Field,
  Icon,
  IllustratedMap,
  PhaseBar,
  Pill,
  Screen,
  Text,
} from '@/shared/ui';

import type { ServiceCategory } from '../model/categories';
import {
  DESCRIPTION_MAX_LENGTH,
  MAX_PHOTOS,
  MIN_PHOTOS,
  requestFormSchema,
  TITLE_MAX_LENGTH,
} from '../schemas/requestSchemas';

export type Urgency = 'now' | 'today' | 'flex';
const URGENCIES: readonly Urgency[] = ['now', 'today', 'flex'];
const STEPS = 4;

export interface NewRequestValues {
  categorySlug: string;
  title: string;
  description: string;
  photos: UploadFile[];
  /** Saisi pour l'utilisateur ; le serveur ne le reçoit pas encore. */
  urgency: Urgency;
}

export interface RequestPlace {
  label: string;
  detail: string;
}

export interface NewRequestViewProps {
  categories: readonly ServiceCategory[];
  /** Domaine présélectionné (depuis une tuile de l'accueil). */
  initialCategory?: string;
  place: RequestPlace | null;
  locating?: boolean;
  /** Absente, la rubrique « Estimation » n'est pas affichée. */
  estimate?: { range: string; note: string } | null;
  submitting: boolean;
  formError?: string | null;
  onLocate: () => void;
  onEditPlace?: () => void;
  /** Ouvre la galerie ou l'appareil photo ; `null` si l'utilisateur renonce. */
  onPickPhoto: () => Promise<UploadFile | null>;
  onSubmit: (values: NewRequestValues) => void;
  onBack: () => void;
}

function urgencyColor(urgency: Urgency, theme: Theme): string {
  if (urgency === 'now') return theme.colors.danger;
  if (urgency === 'today') return theme.colors.warning;
  return theme.colors.success;
}

/** Nouvelle demande en quatre étapes (maquette `NewRequestScreen`), présentation pure. */
export function NewRequestView(props: NewRequestViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<NewRequestValues>({
    categorySlug: props.initialCategory ?? '',
    title: '',
    description: '',
    photos: [],
    urgency: 'today',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewRequestValues | 'place', string>>>(
    {},
  );

  const set = <K extends keyof NewRequestValues>(key: K, value: NewRequestValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /** Valide l'étape courante avec les règles du schéma de création (alignées sur le serveur). */
  const validate = (): boolean => {
    const fields =
      step === 1
        ? (['categorySlug'] as const)
        : step === 2
          ? (['title', 'description', 'photos'] as const)
          : step === 3
            ? (['place'] as const)
            : ([] as const);
    if (fields.length === 0) return true;
    const result = requestFormSchema.safeParse({
      ...values,
      place: props.place ? { latitude: 0, longitude: 0, label: null, city: null } : null,
    });
    if (result.success) return true;
    const found: typeof errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof typeof errors;
      if ((fields as readonly string[]).includes(field) && !found[field]) {
        found[field] = t(issue.message);
      }
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS) setStep(step + 1);
    else props.onSubmit(values);
  };

  const addPhoto = async () => {
    const file = await props.onPickPhoto();
    if (file) set('photos', [...values.photos, file].slice(0, MAX_PHOTOS));
  };

  const category = props.categories.find((item) => item.slug === values.categorySlug);

  return (
    <Screen
      testID="nouvelle-demande"
      footer={
        <Button
          label={t(step === STEPS ? 'requests:create.launch' : 'requests:create.continue')}
          iconRight="arrowR"
          size="lg"
          full
          loading={props.submitting}
          onPress={next}
        />
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
        <BackButton onPress={() => (step > 1 ? setStep(step - 1) : props.onBack())} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
            {t('requests:create.step', { step, count: STEPS })}
          </Text>
          <PhaseBar phase={step} count={STEPS} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 14 }}>
        {props.formError ? <Banner tone="danger" message={props.formError} /> : null}

        {step === 1 ? (
          <>
            <Title>{t('requests:create.categoryTitle')}</Title>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {props.categories.map((item) => {
                const selected = item.slug === values.categorySlug;
                const color = item.color ?? theme.colors.primary;
                return (
                  <Pressable
                    key={item.slug}
                    accessibilityRole="radio"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected }}
                    onPress={() => set('categorySlug', item.slug)}
                    style={{
                      width: '48%',
                      flexGrow: 1,
                      gap: 14,
                      padding: 18,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: selected ? theme.colors.text : theme.colors.border,
                      backgroundColor: selected ? theme.colors.text : theme.colors.surface,
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        backgroundColor: selected ? theme.colors.primary : `${color}1A`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={item.icon} size={20} color={selected ? '#ffffff' : color} />
                    </View>
                    <Text
                      variant="bodyStrong"
                      style={{
                        fontSize: 14,
                        color: selected ? theme.colors.background : theme.colors.text,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.categorySlug ? (
              <Text variant="caption" tone="danger">
                {errors.categorySlug}
              </Text>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Title>{t('requests:create.describeTitle')}</Title>
            <Field
              label={t('requests:create.titleLabel')}
              icon="edit"
              value={values.title}
              onChangeText={(text) => set('title', text)}
              placeholder={t('requests:create.titlePlaceholder')}
              maxLength={TITLE_MAX_LENGTH}
              error={errors.title}
            />
            <Field
              label={t('requests:create.descriptionLabel')}
              value={values.description}
              onChangeText={(text) => set('description', text)}
              multiline
              maxLength={DESCRIPTION_MAX_LENGTH}
              hint={t('requests:create.descriptionHint')}
              error={errors.description}
            />
            <View style={{ gap: 6 }}>
              <Text variant="caption" tone="muted">
                {t('requests:create.photosLabel', { min: MIN_PHOTOS, max: MAX_PHOTOS })}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {values.photos.map((photo, index) => (
                  <Pressable
                    key={`${photo.uri}-${index}`}
                    accessibilityRole="button"
                    accessibilityLabel={t('requests:create.removePhoto', { number: index + 1 })}
                    onPress={() =>
                      set(
                        'photos',
                        values.photos.filter((_, position) => position !== index),
                      )
                    }
                  >
                    <Image
                      source={{ uri: photo.uri }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        backgroundColor: theme.colors.surfaceHigh,
                      }}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: theme.colors.scrim,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="close" size={11} strokeWidth={2.5} color="#ffffff" />
                    </View>
                  </Pressable>
                ))}
                {values.photos.length < MAX_PHOTOS ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('requests:create.addPhoto')}
                    onPress={() => void addPhoto()}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderStyle: 'dashed',
                      borderColor: errors.photos ? theme.colors.danger : theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="camera" size={24} tone="primary" />
                  </Pressable>
                ) : null}
              </View>
              {errors.photos ? (
                <Text variant="caption" tone="danger">
                  {errors.photos}
                </Text>
              ) : null}
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Title>{t('requests:create.whereTitle')}</Title>
            <View style={{ height: 160, borderRadius: 16, overflow: 'hidden' }}>
              <IllustratedMap compact you={props.place ? { x: 50, y: 55 } : null} />
            </View>
            <Card padding={14}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="pin" size={18} tone="primary" />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                    {props.place?.label ?? t('requests:create.noPlace')}
                  </Text>
                  {props.place ? (
                    <Text
                      variant="caption"
                      tone="muted"
                      style={{ fontFamily: theme.fontFamily.body }}
                    >
                      {props.place.detail}
                    </Text>
                  ) : null}
                </View>
                <Button
                  label={t(props.place ? 'requests:create.editPlace' : 'requests:create.locate')}
                  variant="soft"
                  size="sm"
                  loading={props.locating}
                  onPress={props.place && props.onEditPlace ? props.onEditPlace : props.onLocate}
                />
              </View>
            </Card>
            {errors.place ? (
              <Text variant="caption" tone="danger">
                {errors.place}
              </Text>
            ) : null}
            <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
              {t('requests:create.urgency')}
            </Text>
            <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
              {URGENCIES.map((urgency) => {
                const selected = urgency === values.urgency;
                const color = urgencyColor(urgency, theme);
                return (
                  <Pressable
                    key={urgency}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t(`requests:create.urgencies.${urgency}.label`)}
                    onPress={() => set('urgency', urgency)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: selected ? color : theme.colors.border,
                      backgroundColor: selected ? theme.colors.surface : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: selected ? color : theme.colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected ? (
                        <View
                          style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }}
                        />
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                        {t(`requests:create.urgencies.${urgency}.label`)}
                      </Text>
                      <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                        {t(`requests:create.urgencies.${urgency}.hint`)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Title>{t('requests:create.recapTitle')}</Title>
            <Card padding={0}>
              <RecapRow label={t('requests:create.recapCategory')}>
                <Text variant="bodyStrong">{category?.label ?? '—'}</Text>
              </RecapRow>
              <RecapRow label={t('requests:create.recapProblem')}>
                <Text variant="bodyStrong" style={{ marginBottom: 4 }}>
                  {values.title}
                </Text>
                <Text
                  variant="caption"
                  tone="muted"
                  style={{ fontFamily: theme.fontFamily.body, lineHeight: 18 }}
                >
                  {values.description}
                </Text>
              </RecapRow>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 16,
                  borderBottomWidth: props.estimate ? 1 : 0,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <Icon name="pin" size={16} tone="primary" />
                <Text variant="label" style={{ fontFamily: theme.fontFamily.body, flex: 1 }}>
                  {props.place?.label ?? '—'}
                </Text>
                <Pill
                  label={t(`requests:create.urgencies.${values.urgency}.label`)}
                  size="sm"
                  tone={
                    values.urgency === 'now'
                      ? 'danger'
                      : values.urgency === 'today'
                        ? 'warning'
                        : 'success'
                  }
                />
              </View>
              {props.estimate ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                  }}
                >
                  <View>
                    <Text
                      variant="eyebrow"
                      tone="muted"
                      style={{ letterSpacing: 1, marginBottom: 4 }}
                    >
                      {t('requests:create.estimate')}
                    </Text>
                    <Text
                      variant="section"
                      style={{ fontFamily: theme.fontFamily.display, fontSize: 18 }}
                    >
                      {props.estimate.range}
                    </Text>
                  </View>
                  <Pill label={props.estimate.note} tone="success" icon="sparkle" />
                </View>
              ) : null}
            </Card>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function Title({ children }: { children: string }) {
  return (
    <Text
      variant="headline"
      accessibilityRole="header"
      style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.6, marginBottom: 4 }}
    >
      {children}
    </Text>
  );
}

function RecapRow({ label, children }: { label: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
