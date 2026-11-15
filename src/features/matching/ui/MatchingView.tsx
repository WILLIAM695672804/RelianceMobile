import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, View } from 'react-native';

import type { AppErrorKind } from '@/core/errors';
import { useTheme } from '@/core/theme';
import { techFacts, type TechSummary } from '@/shared/model';
import { formatAmount, formatDistance, formatRating } from '@/shared/format';
import {
  Avatar,
  BackButton,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Screen,
  Text,
  useReducedMotion,
} from '@/shared/ui';

export interface MatchingViewProps {
  status: 'searching' | 'ready' | 'error';
  technicians: readonly TechSummary[];
  errorKind?: AppErrorKind;
  /** Proposition en cours d'envoi au technicien choisi. */
  choosingId?: string | null;
  onChoose: (tech: TechSummary) => void;
  onViewProfile: (tech: TechSummary) => void;
  onRetry: () => void;
  onClose: () => void;
}

/** Rapprochement : recherche animée puis techniciens proposés (maquette `MatchingScreen`). */
export function MatchingView(props: MatchingViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const format = { rating: formatRating, distance: formatDistance };

  return (
    <Screen testID="rapprochement" scroll={props.status === 'ready'}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <BackButton onPress={props.onClose} label={t('matching:live.close')} />
      </View>
      {props.status === 'searching' ? (
        <Searching />
      ) : props.status === 'error' ? (
        <ErrorState kind={props.errorKind ?? 'unknown'} onRetry={props.onRetry} />
      ) : props.technicians.length === 0 ? (
        <EmptyState
          icon="search"
          tone="neutral"
          title={t('matching:live.emptyTitle')}
          message={t('matching:live.emptyBody')}
          actionLabel={t('matching:live.retry')}
          onAction={props.onRetry}
        />
      ) : (
        <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 10 }}>
          <View style={{ marginBottom: 10 }}>
            <Text
              variant="headline"
              accessibilityRole="header"
              style={{ fontSize: 26, lineHeight: 30 }}
            >
              {t('matching:live.found', { count: props.technicians.length })}
            </Text>
            <Text
              variant="label"
              tone="muted"
              style={{ marginTop: 4, fontFamily: theme.fontFamily.body }}
            >
              {t('matching:live.sorted')}
            </Text>
          </View>
          {props.technicians.map((tech, index) => {
            const top = index === 0;
            return (
              <Card
                key={tech.id}
                padding={14}
                style={top ? { borderColor: theme.colors.primary, borderWidth: 1.5 } : undefined}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View>
                    <Avatar name={tech.name} color={tech.color} size={48} />
                    {top ? (
                      <View
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -6,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primary,
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.onPrimary,
                            fontSize: 9,
                            lineHeight: 12,
                            fontFamily: theme.fontFamily.bodyBold,
                            letterSpacing: 0.5,
                          }}
                        >
                          {t('matching:live.top')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {tech.name}
                      </Text>
                      {tech.verified ? (
                        <Icon name="check" size={12} strokeWidth={3} tone="primary" />
                      ) : null}
                    </View>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11, marginTop: 3 }}>
                      {techFacts(tech, format)}
                    </Text>
                  </View>
                  {tech.price != null ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        variant="bodyStrong"
                        style={{ fontFamily: theme.fontFamily.display, fontSize: 14 }}
                      >
                        {formatAmount(tech.price).replace(/\s?FCFA$/, '')}
                      </Text>
                      <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                        {t('matching:live.diagnostic')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={t('matching:live.viewProfile')}
                      variant="ghost"
                      size="sm"
                      full
                      onPress={() => props.onViewProfile(tech)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={t('matching:live.choose')}
                      size="sm"
                      full
                      loading={props.choosingId === tech.id}
                      disabled={props.choosingId != null && props.choosingId !== tech.id}
                      onPress={() => props.onChoose(tech)}
                      accessibilityLabel={`${t('matching:live.choose')} ${tech.name}`}
                    />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

/** Ondes pulsées autour du médaillon central pendant la recherche. */
function Searching() {
  const { t } = useTranslation();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [waves] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loops = waves.map((wave, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 600),
          Animated.timing(wave, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(wave, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [reduceMotion, waves]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}
    >
      <View
        style={{
          width: 240,
          height: 240,
          marginBottom: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {waves.map((wave, index) => (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: 120,
              borderWidth: 2,
              borderColor: theme.colors.primary,
              opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
              transform: [
                { scale: wave.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            }}
          />
        ))}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkle" size={36} strokeWidth={2} tone="onPrimary" />
        </View>
      </View>
      <Text variant="title" align="center" accessibilityRole="header">
        {t('matching:live.searching')}
      </Text>
      <Text
        variant="body"
        tone="muted"
        align="center"
        style={{ marginTop: 10, maxWidth: 280, fontSize: 14 }}
      >
        {t('matching:live.searchingHint')}
      </Text>
    </View>
  );
}
