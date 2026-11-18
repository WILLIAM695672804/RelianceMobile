import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme, type Theme } from '@/core/theme';
import {
  Banner,
  Button,
  Card,
  ChoiceChip,
  Field,
  Icon,
  RadioRow,
  Screen,
  SectionLabel,
  SwitchRow,
  Text,
  TextAction,
  TopBar,
  type IconName,
} from '@/shared/ui';

export type AgendaKind = 'mission' | 'pending' | 'block' | 'leave' | 'open';

export interface AgendaEvent {
  id: string;
  /** Jour de la semaine, 0 pour lundi. */
  day: number;
  /** Heures décimales (14,5 pour 14 h 30). */
  start: number;
  end: number;
  title: string;
  detail?: string;
  kind: AgendaKind;
  live?: boolean;
}

const FIRST_HOUR = 8;
const LAST_HOUR = 19;
const HOUR_HEIGHT = 44;

function kindColor(kind: AgendaKind, theme: Theme): string {
  switch (kind) {
    case 'pending':
      return theme.colors.warning;
    case 'block':
      return theme.colors.textMuted;
    case 'leave':
      return theme.colors.danger;
    case 'open':
      return theme.colors.success;
    default:
      return theme.colors.primary;
  }
}

export interface PlanningWeekViewProps {
  weekLabel: string;
  /** Initiales des jours, à partir du lundi. */
  dayLabels: readonly string[];
  todayIndex: number | null;
  stats: readonly { label: string; value: string; detail: string }[];
  events: readonly AgendaEvent[];
  onBack?: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onEvent?: (event: AgendaEvent) => void;
  onBlock: () => void;
  onAvailability: () => void;
}

/** Semaine en grille horaire (maquette `PlanningWeekScreen`), présentation pure. */
export function PlanningWeekView(props: PlanningWeekViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, index) => FIRST_HOUR + index);

  return (
    <Screen
      testID="planning-semaine"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={t('planning:week.block')}
              icon="calendar"
              variant="ghost"
              full
              onPress={props.onBlock}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={t('planning:week.availability')}
              icon="clock"
              full
              onPress={props.onAvailability}
            />
          </View>
        </View>
      }
    >
      <TopBar
        title={t('planning:week.title')}
        onBack={props.onBack}
        trailing={
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="chevronL"
              label={t('planning:week.previous')}
              onPress={props.onPreviousWeek}
            />
            <IconButton
              icon="chevronR"
              label={t('planning:week.next')}
              onPress={props.onNextWeek}
            />
          </View>
        }
      />
      <Text
        variant="caption"
        tone="muted"
        style={{ paddingHorizontal: 20, marginTop: -4, marginBottom: 12 }}
      >
        {props.weekLabel}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 }}>
        {props.stats.map((stat) => (
          <Card key={stat.label} padding={10} style={{ flex: 1 }}>
            <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
              {stat.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text variant="section" style={{ fontFamily: theme.fontFamily.display }}>
                {stat.value}
              </Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                {stat.detail}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={{ paddingHorizontal: 12 }}>
        <View style={{ flexDirection: 'row', marginLeft: 34, marginBottom: 6 }}>
          {props.dayLabels.map((label, index) => (
            <View key={`${label}-${index}`} style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    index === props.todayIndex ? theme.colors.primary : 'transparent',
                }}
              >
                <Text
                  variant="labelStrong"
                  style={{
                    color:
                      index === props.todayIndex ? theme.colors.onPrimary : theme.colors.textMuted,
                  }}
                >
                  {label}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 34 }}>
            {hours.map((hour) => (
              <Text
                key={hour}
                variant="caption"
                tone="muted"
                style={{ height: HOUR_HEIGHT, fontSize: 10 }}
              >
                {`${hour}h`}
              </Text>
            ))}
          </View>
          {props.dayLabels.map((label, day) => (
            <View
              key={`${label}-${day}`}
              style={{
                flex: 1,
                height: hours.length * HOUR_HEIGHT,
                borderLeftWidth: 1,
                borderLeftColor: theme.colors.divider,
                backgroundColor:
                  day === props.todayIndex ? `${theme.colors.primary}08` : 'transparent',
              }}
            >
              {props.events
                .filter((event) => event.day === day)
                .map((event) => {
                  const color = kindColor(event.kind, theme);
                  const height = Math.max(22, (event.end - event.start) * HOUR_HEIGHT - 2);
                  return (
                    <Pressable
                      key={event.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${props.dayLabels[day]} · ${event.title} · ${t(`planning:week.kinds.${event.kind}`)}`}
                      disabled={!props.onEvent}
                      onPress={() => props.onEvent?.(event)}
                      style={{
                        position: 'absolute',
                        top: (event.start - FIRST_HOUR) * HOUR_HEIGHT + 1,
                        left: 2,
                        right: 2,
                        height,
                        padding: 4,
                        borderRadius: 6,
                        borderLeftWidth: 3,
                        borderLeftColor: color,
                        backgroundColor: `${color}1F`,
                        overflow: 'hidden',
                      }}
                    >
                      <Text
                        variant="caption"
                        numberOfLines={2}
                        style={{
                          fontSize: 9,
                          lineHeight: 11,
                          color: theme.colors.text,
                          fontFamily: theme.fontFamily.bodySemiBold,
                        }}
                      >
                        {event.title}
                      </Text>
                      {event.live ? (
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.colors.danger,
                            marginTop: 2,
                          }}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
            </View>
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            paddingHorizontal: 8,
            paddingTop: 12,
          }}
        >
          {(['mission', 'pending', 'leave', 'open'] as const).map((kind) => (
            <View key={kind} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  backgroundColor: kindColor(kind, theme),
                }}
              />
              <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                {t(`planning:week.kinds.${kind}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={18} />
    </Pressable>
  );
}

export type BlockReason = 'vacation' | 'sick' | 'training' | 'other';
const BLOCK_REASONS: readonly { key: BlockReason; icon: IconName }[] = [
  { key: 'vacation', icon: 'sun' },
  { key: 'sick', icon: 'heart' },
  { key: 'training', icon: 'badge' },
  { key: 'other', icon: 'info' },
];

export interface BlockValues {
  reason: BlockReason;
  /** Dates au format AAAA-MM-JJ. */
  from: string;
  to: string;
  allDay: boolean;
  note: string;
}

export interface BlockAgendaViewProps {
  initial: BlockValues;
  submitting?: boolean;
  formError?: string | null;
  onCancel: () => void;
  onSubmit: (values: BlockValues) => void;
}

/** Blocage de l'agenda pour congé, maladie ou formation (maquette `LeaveRequestScreen`). */
export function BlockAgendaView({
  initial,
  submitting = false,
  formError,
  onCancel,
  onSubmit,
}: BlockAgendaViewProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initial);
  const set = <K extends keyof BlockValues>(key: K, value: BlockValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const days = daysBetween(values.from, values.to);
  const valid = days > 0;

  return (
    <Screen
      testID="bloquer-agenda"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={t('planning:block.cancel')}
              variant="ghost"
              size="lg"
              full
              onPress={onCancel}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              label={t('planning:block.submit', { count: Math.max(days, 0) })}
              size="lg"
              full
              disabled={!valid}
              loading={submitting}
              onPress={() => onSubmit(values)}
            />
          </View>
        </View>
      }
    >
      <TopBar title={t('planning:block.title')} align="center" onBack={onCancel} />
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 14 }}>
        {formError ? <Banner tone="danger" message={formError} /> : null}
        <SectionLabel label={t('planning:block.reason')} />
        <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
          {BLOCK_REASONS.map((reason) => (
            <RadioRow
              key={reason.key}
              label={t(`planning:block.reasons.${reason.key}`)}
              icon={reason.icon}
              selected={values.reason === reason.key}
              onPress={() => set('reason', reason.key)}
            />
          ))}
        </View>
        <SectionLabel label={t('planning:block.period')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field
              label={t('planning:block.from')}
              icon="calendar"
              value={values.from}
              onChangeText={(text) => set('from', text)}
              placeholder="2026-03-19"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label={t('planning:block.to')}
              icon="calendar"
              value={values.to}
              onChangeText={(text) => set('to', text)}
              placeholder="2026-03-21"
            />
          </View>
        </View>
        {!valid ? (
          <Text variant="caption" tone="danger">
            {t('planning:block.invalid')}
          </Text>
        ) : null}
        <SwitchRow
          label={t('planning:block.allDay')}
          value={values.allDay}
          onChange={(value) => set('allDay', value)}
        />
        <Field
          label={t('planning:block.note')}
          value={values.note}
          onChangeText={(text) => set('note', text)}
          multiline
        />
      </View>
    </Screen>
  );
}

/** Nombre de jours inclus entre deux dates AAAA-MM-JJ ; 0 si l'une est invalide ou inversée. */
export function daysBetween(from: string, to: string): number {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(from) || !pattern.test(to)) return 0;
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

export interface WeeklyHours {
  /** Jour de la semaine, 0 pour lundi. */
  day: number;
  open: boolean;
  start: string;
  end: string;
}

export interface AvailabilityValues {
  available: boolean;
  week: WeeklyHours[];
  maxPerDay: number;
  urgent: boolean;
}

export interface AvailabilityViewProps {
  dayNames: readonly string[];
  initial: AvailabilityValues;
  saving?: boolean;
  /** Seuls les horaires hebdomadaires sont proposés (ceux que le serveur conserve). */
  weeklyOnly?: boolean;
  onBack: () => void;
  onSave: (values: AvailabilityValues) => void;
}

/** Disponibilités hebdomadaires et capacité (maquette `AvailabilityScreen`). */
export function AvailabilityView({
  dayNames,
  initial,
  saving = false,
  weeklyOnly = false,
  onBack,
  onSave,
}: AvailabilityViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [values, setValues] = useState(initial);
  const setDay = (day: number, patch: Partial<WeeklyHours>) =>
    setValues((current) => ({
      ...current,
      week: current.week.map((item) => (item.day === day ? { ...item, ...patch } : item)),
    }));

  return (
    <Screen testID="disponibilites">
      <TopBar
        title={t('planning:availability.title')}
        onBack={onBack}
        trailing={
          <TextAction
            label={t('planning:availability.save')}
            onPress={() => onSave(values)}
            disabled={saving}
          />
        }
      />
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        {weeklyOnly ? null : (
          <Card
            padding={14}
            style={{
              backgroundColor: values.available ? theme.tint.success : theme.colors.surface,
            }}
          >
            <SwitchRow
              label={t(values.available ? 'planning:availability.on' : 'planning:availability.off')}
              hint={t(
                values.available ? 'planning:availability.onHint' : 'planning:availability.offHint',
              )}
              value={values.available}
              onChange={(available) => setValues((current) => ({ ...current, available }))}
            />
          </Card>
        )}

        <View>
          <SectionLabel label={t('planning:availability.weekly')} />
          <Card padding={0}>
            {values.week.map((item, index) => (
              <View
                key={item.day}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: theme.colors.divider,
                }}
              >
                <SwitchRow
                  label={dayNames[item.day] ?? String(item.day)}
                  hint={item.open ? `${item.start} – ${item.end}` : t('planning:availability.rest')}
                  value={item.open}
                  onChange={(open) => setDay(item.day, { open })}
                />
              </View>
            ))}
          </Card>
        </View>

        {weeklyOnly ? null : (
          <>
            <View>
              <SectionLabel label={t('planning:availability.capacity')} />
              <Card padding={14}>
                <Text variant="label" style={{ marginBottom: 8 }}>
                  {t('planning:availability.maxPerDay')}
                </Text>
                <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 6 }}>
                  {[2, 3, 4, 5, 6].map((count) => (
                    <ChoiceChip
                      key={count}
                      label={String(count)}
                      selected={values.maxPerDay === count}
                      onPress={() => setValues((current) => ({ ...current, maxPerDay: count }))}
                    />
                  ))}
                </View>
              </Card>
            </View>

            <SwitchRow
              icon="flash"
              label={t('planning:availability.urgent')}
              hint={t('planning:availability.urgentHint')}
              value={values.urgent}
              onChange={(urgent) => setValues((current) => ({ ...current, urgent }))}
            />
          </>
        )}
        <Button
          label={t('planning:availability.save')}
          size="lg"
          full
          loading={saving}
          onPress={() => onSave(values)}
        />
      </View>
    </Screen>
  );
}
