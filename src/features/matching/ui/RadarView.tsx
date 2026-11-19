import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  BackButton,
  Button,
  Card,
  GeoMap,
  Icon,
  Pill,
  Screen,
  Text,
  useReducedMotion,
  type GeoPoint,
} from '@/shared/ui';

export interface RadarProposal {
  id: string;
  title: string;
  category: string;
  place: string;
  price: number;
  /** Délai restant, déjà formulé (« 2 h 15 »). */
  expiresIn: string | null;
  coordinates: GeoPoint | null;
}

export interface RadarViewProps {
  /** Zone d'intervention du technicien : centre de la carte et cercle surveillé. */
  zone: { center: GeoPoint; radiusKm: number } | null;
  /** Propositions en attente, la plus récente d'abord. */
  proposals: readonly RadarProposal[];
  respondingId?: string | null;
  onAccept: (proposal: RadarProposal) => void;
  onRefuse: (proposal: RadarProposal) => void;
  onBack: () => void;
}

/** Onde de balayage centrée sur la carte ; figée si l'utilisateur limite les animations. */
function RadarPulse() {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, reduced]);

  const ring = (delay: number) => {
    const phase = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [delay, 1 + delay],
    });
    return {
      transform: [
        { scale: phase.interpolate({ inputRange: [0, 1, 2], outputRange: [0.2, 1.6, 0.2] }) },
      ],
      opacity: phase.interpolate({ inputRange: [0, 1, 1.01, 2], outputRange: [0.5, 0, 0, 0.5] }),
    };
  };

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
    >
      {[0, 0.5].map((delay) => (
        <Animated.View
          key={delay}
          style={[
            {
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: 110,
              borderWidth: 2,
              borderColor: theme.colors.primary,
              backgroundColor: `${theme.colors.primary}14`,
            },
            reduced ? { opacity: 0.25 } : ring(delay),
          ]}
        />
      ))}
    </View>
  );
}

/** Radar en direct du technicien : carte de sa zone et propositions reçues (sans maquette). */
export function RadarView(props: RadarViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const active = props.proposals[0] ?? null;
  const responding = active !== null && props.respondingId === active.id;

  return (
    <Screen scroll={false} bleedBottom testID="radar">
      <View style={StyleSheet.absoluteFill}>
        <GeoMap
          zoneCenter={props.zone?.center ?? null}
          radiusKm={props.zone?.radiusKm ?? null}
          you={props.zone?.center ?? null}
          pins={props.proposals
            .filter((proposal) => proposal.coordinates)
            .map((proposal) => ({
              id: proposal.id,
              label: proposal.title,
              color: theme.colors.warning,
              ...proposal.coordinates!,
            }))}
          focus={active?.coordinates ?? null}
          padding={{ top: 120 + insets.top, bottom: 340 }}
        />
        <RadarPulse />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        <BackButton onPress={props.onBack} />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: theme.colors.surface,
            boxShadow: '0px 4px 14px rgba(0,0,0,0.18)',
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.success,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="labelStrong" accessibilityRole="header">
              {t('matching:radar.title')}
            </Text>
            <Text variant="caption" tone="muted">
              {t('matching:radar.available', { count: props.proposals.length })}
            </Text>
          </View>
          {props.proposals.length > 0 ? (
            <Pill label={t('matching:radar.new')} tone="warning" size="sm" icon="bolt" />
          ) : null}
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16 + insets.bottom,
        }}
      >
        {active ? (
          <Card padding={18}>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pill label={t('matching:radar.match')} tone="primary" size="sm" icon="sparkle" />
                {active.expiresIn ? (
                  <Text variant="caption" tone="muted" style={{ marginLeft: 'auto' }}>
                    {t('matching:radar.expires', { delay: active.expiresIn })}
                  </Text>
                ) : null}
              </View>
              <Text variant="title" numberOfLines={2}>
                {active.title}
              </Text>
              <Text variant="label" tone="muted">
                {[active.category, active.place].filter(Boolean).join(' · ')}
              </Text>
              <Text
                variant="section"
                tone="primary"
                style={{ fontFamily: theme.fontFamily.display }}
              >
                {formatAmount(active.price)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Button
                  label={t('matching:radar.refuse')}
                  variant="ghost"
                  size="md"
                  disabled={responding}
                  onPress={() => props.onRefuse(active)}
                />
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('matching:radar.accept')}
                    size="md"
                    full
                    loading={responding}
                    onPress={() => props.onAccept(active)}
                  />
                </View>
              </View>
              {props.proposals.length > 1 ? (
                <Text variant="caption" tone="muted" align="center">
                  {t('matching:radar.queued', { count: props.proposals.length - 1 })}
                </Text>
              ) : null}
            </View>
          </Card>
        ) : (
          <Card padding={18}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: theme.tint.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="search" size={20} tone="primary" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="labelStrong">{t('matching:radar.waitingTitle')}</Text>
                <Text variant="caption" tone="muted">
                  {t('matching:radar.waitingBody')}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </Screen>
  );
}
