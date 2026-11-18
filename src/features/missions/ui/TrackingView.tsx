import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  Avatar,
  BackButton,
  Button,
  Card,
  Icon,
  GeoMap,
  type GeoPoint,
  Screen,
  Section,
  Text,
  type IconName,
} from '@/shared/ui';

export interface TrackingPhase {
  label: string;
  detail: string;
  state: 'done' | 'active' | 'todo';
}

export interface TrackingViewProps {
  technician: { name: string; skill: string; color?: string };
  reference: string;
  phases: readonly TrackingPhase[];
  /** Arrivée estimée ; absente une fois le technicien sur place. */
  eta: { minutes: number; detail: string } | null;
  /** Séquestre : montant gelé et part déjà engagée (0 à 1). */
  escrow: { amount: number; progress: number; spent: string; remaining: string } | null;
  /** Dernière position connue du technicien. */
  technicianAt?: GeoPoint | null;
  /** Lieu de l'intervention. */
  destination?: GeoPoint | null;
  /** Prochaine étape proposée au client (« Voir le diagnostic »). */
  primaryAction?: { label: string; onPress: () => void } | null;
  onBack: () => void;
  onChat: () => void;
  onCall?: () => void;
}

/** Suivi d'une intervention (maquette `InterventionScreen`), présentation pure. */
export function TrackingView(props: TrackingViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { technician } = props;

  const action = (icon: IconName, label: string, primary: boolean, onPress?: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={!onPress}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        borderWidth: primary ? 0 : 1,
        borderColor: theme.colors.border,
        backgroundColor: primary ? theme.colors.primary : theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: onPress ? 1 : 0.5,
      }}
    >
      <Icon name={icon} size={18} tone={primary ? 'onPrimary' : 'default'} />
    </Pressable>
  );

  return (
    <Screen
      testID="suivi-intervention"
      footer={
        props.primaryAction ? (
          <Button
            label={props.primaryAction.label}
            iconRight="arrowR"
            size="lg"
            full
            onPress={props.primaryAction.onPress}
          />
        ) : undefined
      }
    >
      <View style={{ height: 280, marginTop: -insets.top }}>
        <GeoMap
          pins={
            props.technicianAt
              ? [
                  {
                    id: 'tech',
                    label: technician.name,
                    ...props.technicianAt,
                    color: technician.color,
                  },
                ]
              : []
          }
          you={props.destination ?? null}
          padding={{ top: 60 + insets.top, bottom: 50 }}
        />
        <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 8 }}>
          <BackButton onPress={props.onBack} />
        </View>
      </View>

      <View
        style={{
          marginTop: -28,
          paddingTop: 20,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: theme.colors.background,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
        >
          <Avatar name={technician.name} color={technician.color} size={52} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              variant="bodyStrong"
              style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: 16 }}
              numberOfLines={1}
            >
              {technician.name}
            </Text>
            <Text variant="caption" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
              {technician.skill} · {props.reference}
            </Text>
          </View>
          {action('chat', t('missions:track.chat', { name: technician.name }), true, props.onChat)}
          {action(
            'phone',
            t('missions:track.call', { name: technician.name }),
            false,
            props.onCall,
          )}
        </View>

        {props.eta ? (
          <View
            accessible
            accessibilityLabel={t('missions:track.etaLabel', { minutes: props.eta.minutes })}
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: theme.colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="title" style={{ color: theme.colors.onPrimary }}>
                {String(props.eta.minutes)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                variant="eyebrow"
                style={{ color: theme.colors.onPrimary, opacity: 0.9, letterSpacing: 1 }}
              >
                {t('missions:track.eta')}
              </Text>
              <Text
                variant="section"
                style={{ color: theme.colors.onPrimary, fontFamily: theme.fontFamily.display }}
              >
                {t('missions:track.inMinutes', { count: props.eta.minutes })}
              </Text>
              <Text
                variant="caption"
                style={{ color: theme.colors.onPrimary, opacity: 0.85, fontSize: 11 }}
              >
                {props.eta.detail}
              </Text>
            </View>
          </View>
        ) : null}

        <Section title={t('missions:track.timeline')}>
          <View style={{ paddingHorizontal: 24 }}>
            {props.phases.map((phase, index) => {
              const last = index === props.phases.length - 1;
              const reached = phase.state !== 'todo';
              return (
                <View
                  key={phase.label}
                  accessible
                  accessibilityLabel={`${phase.label}. ${phase.detail}. ${t(`missions:track.states.${phase.state}`)}`}
                  style={{ flexDirection: 'row', gap: 14, paddingBottom: last ? 0 : 18 }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: reached ? theme.colors.primary : theme.colors.border,
                        backgroundColor:
                          phase.state === 'done' ? theme.colors.primary : theme.colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                          phase.state === 'active'
                            ? `0px 0px 0px 6px ${theme.colors.primary}33`
                            : undefined,
                      }}
                    >
                      {phase.state === 'done' ? (
                        <Icon name="check" size={14} strokeWidth={3} tone="onPrimary" />
                      ) : (
                        <Text
                          variant="caption"
                          tone="primary"
                          style={{ fontFamily: theme.fontFamily.bodyBold, fontSize: 11 }}
                        >
                          {String(index + 1)}
                        </Text>
                      )}
                    </View>
                    {last ? null : (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          marginTop: 4,
                          backgroundColor:
                            phase.state === 'done' ? theme.colors.primary : theme.colors.border,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingTop: 2 }}>
                    <Text
                      variant="bodyStrong"
                      tone={reached ? 'default' : 'muted'}
                      style={{ fontSize: 14 }}
                    >
                      {phase.label}
                    </Text>
                    <Text
                      variant="caption"
                      tone="muted"
                      style={{ marginTop: 2, fontFamily: theme.fontFamily.body }}
                    >
                      {phase.detail}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Section>

        {props.escrow ? (
          <Section title={t('missions:track.escrow')}>
            <View style={{ paddingHorizontal: 20 }}>
              <Card padding={16}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
                >
                  <Icon name="shield" size={18} tone="success" />
                  <Text variant="labelStrong">
                    {t('missions:track.frozen', { amount: formatAmount(props.escrow.amount) })}
                  </Text>
                </View>
                <View
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: 100,
                    now: Math.round(props.escrow.progress * 100),
                  }}
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.round(props.escrow.progress * 100)}%`,
                      height: '100%',
                      borderRadius: 3,
                      backgroundColor: theme.colors.success,
                    }}
                  />
                </View>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}
                >
                  <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                    {props.escrow.spent}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                    {props.escrow.remaining}
                  </Text>
                </View>
              </Card>
            </View>
          </Section>
        ) : null}
      </View>
    </Screen>
  );
}
