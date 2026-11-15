import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme, type Theme } from '@/core/theme';
import { Icon, Screen, Text, TextAction, useReducedMotion, type IconName } from '@/shared/ui';

interface Slide {
  icon: IconName;
  accent: (theme: Theme) => string;
}

/** Diapositives de la maquette `OnboardingScreen` : icône de la carte flottante et accent. */
const SLIDES: readonly Slide[] = [
  { icon: 'flash', accent: (theme) => theme.colors.primary },
  { icon: 'shield', accent: (theme) => theme.colors.primary },
  { icon: 'clock', accent: (theme) => theme.colors.warning },
];

export interface OnboardingViewProps {
  /** Fin du fil, par le bouton de la dernière diapositive. */
  onFinish: () => void;
  /** Abandon du fil par « Passer ». */
  onSkip: () => void;
  /** Diapositive affichée d'emblée (catalogue, tests). */
  initialIndex?: number;
}

/** Fil d'accueil (maquette `OnboardingScreen`), présentation pure. */
export function OnboardingView({ onFinish, onSkip, initialIndex = 0 }: OnboardingViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(initialIndex);
  const [fade] = useState(() => new Animated.Value(1));
  const patternId = `trame${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const slide = SLIDES[index]!;
  const accent = slide.accent(theme);
  const dark = theme.scheme === 'dark';
  const last = index === SLIDES.length - 1;

  useEffect(() => {
    if (reduceMotion) return;
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [fade, index, reduceMotion]);

  const key = `auth:access.onboarding.slides.${index}`;

  return (
    <Screen scroll={false} bleedBottom testID="onboarding">
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <View
          style={{
            position: 'absolute',
            top: 80,
            right: -90,
            width: 360,
            height: 360,
            borderRadius: 180,
            backgroundColor: accent,
            opacity: dark ? 0.55 : 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 200,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: dark ? '#16161b' : '#2b2a36',
          }}
        />
        <Svg style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} width="100%" height="100%">
          <Defs>
            <Pattern id={patternId} patternUnits="userSpaceOnUse" width={14} height={14}>
              <Circle
                cx={7}
                cy={7}
                r={1}
                fill={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
              />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </Svg>
        <Animated.View
          style={{
            position: 'absolute',
            top: 240,
            left: 30,
            right: 30,
            opacity: fade,
            padding: 16,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.18)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={slide.icon} size={22} color="#ffffff" strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="labelStrong" numberOfLines={1}>
              {t(`${key}.cardTitle`)}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 11 }}>
              {t(`${key}.cardBody`)}
            </Text>
          </View>
          <Icon name="chevronR" size={16} tone="muted" />
        </Animated.View>
        <View style={{ position: 'absolute', top: 12, right: 20 }}>
          <TextAction label={t('auth:access.onboarding.skip')} onPress={onSkip} tone="muted" />
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 28,
          paddingTop: 28,
          paddingBottom: 36 + insets.bottom,
        }}
      >
        <Animated.View style={{ opacity: fade }}>
          <Text variant="eyebrow" tone="muted" style={{ marginBottom: 12 }}>
            {t('auth:access.onboarding.eyebrow', { number: index + 1 })}
          </Text>
          <Text variant="headline" accessibilityRole="header">
            {t(`${key}.title`)}
          </Text>
          <Text
            variant="body"
            tone="muted"
            style={{ fontSize: 14, lineHeight: 22, marginTop: 14, marginBottom: 24 }}
          >
            {t(`${key}.body`)}
          </Text>
        </Animated.View>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {SLIDES.map((_, dot) => (
              <Pressable
                key={dot}
                accessibilityRole="button"
                accessibilityLabel={t('auth:access.onboarding.goTo', { number: dot + 1 })}
                accessibilityState={{ selected: dot === index }}
                onPress={() => setIndex(dot)}
                hitSlop={{ top: 21, bottom: 21, left: 3, right: 3 }}
                testID={`point-${dot}`}
              >
                <View
                  style={{
                    width: dot === index ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: dot === index ? theme.colors.text : theme.colors.border,
                  }}
                />
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              last ? 'auth:access.onboarding.start' : 'auth:access.onboarding.next',
            )}
            onPress={() => (last ? onFinish() : setIndex((current) => current + 1))}
            style={({ pressed }) => ({
              width: 60,
              height: 60,
              minWidth: MIN_TOUCH_TARGET,
              borderRadius: 30,
              backgroundColor: theme.colors.text,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name="arrowR" size={22} strokeWidth={2.2} color={theme.colors.background} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
