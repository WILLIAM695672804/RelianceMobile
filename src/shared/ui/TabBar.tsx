import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { useReducedMotion } from './useReducedMotion';

export const TAB_BAR_HEIGHT = 72;
/** Distance entre la barre flottante et le bas de l'écran. */
export const TAB_BAR_OFFSET = 24;
/** Espace à réserver sous un contenu défilant pour qu'il ne passe pas sous la barre. */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_OFFSET + 16;

/** Marge entre la capsule active et le bord de son onglet. */
const DROP_INSET = 5;
/** Marge intérieure horizontale de la rangée d'onglets. */
const ROW_PADDING = 6;

export interface TabBarItem {
  key: string;
  label: string;
  icon: IconName;
}

export interface TabBarProps {
  items: readonly TabBarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  testID?: string;
}

/**
 * Barre de navigation flottante des maquettes, à la manière de Telegram : au repos, l'onglet
 * actif repose sur une capsule pleine ; pendant la transition seulement, la capsule se soulève
 * en goutte de verre, glisse en s'étirant vers l'onglet choisi, puis retombe et redevient pleine.
 */
export function TabBar({ items, activeKey, onSelect, testID }: TabBarProps) {
  const theme = useTheme();
  const { gutter, maxContentWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [rowWidth, setRowWidth] = useState(0);

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.key === activeKey),
  );
  // La mesure inclut la marge intérieure : un onglet occupe la largeur restante divisée par leur nombre.
  const slot = rowWidth > 0 ? (rowWidth - ROW_PADDING * 2) / items.length : 0;

  const position = useState(() => new Animated.Value(activeIndex))[0];
  /** 0 : capsule posée et pleine ; 1 : goutte de verre soulevée. */
  const lift = useState(() => new Animated.Value(0))[0];
  const previous = useRef(activeIndex);

  useEffect(() => {
    if (previous.current === activeIndex) return;
    const distance = Math.abs(activeIndex - previous.current);
    previous.current = activeIndex;
    position.stopAnimation();
    lift.stopAnimation();
    if (reduceMotion) {
      position.setValue(activeIndex);
      lift.setValue(0);
      return;
    }
    Animated.parallel([
      // Ressort lent : le trajet de la goutte reste perceptible (≈ 300 à 450 ms selon la distance).
      Animated.spring(position, {
        toValue: activeIndex,
        damping: 20,
        stiffness: 110,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.sequence([
        // La capsule se soulève en verre dès le départ…
        Animated.timing(lift, {
          toValue: 1,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // … reste en vol le temps du trajet, plus long vers un onglet éloigné…
        Animated.delay(90 + distance * 55),
        // … puis retombe en gélatine et redevient pleine.
        Animated.spring(lift, {
          toValue: 0,
          damping: 7,
          stiffness: 210,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeIndex, lift, position, reduceMotion]);

  const select = (key: string) => {
    if (key !== activeKey) {
      void Haptics.selectionAsync().catch(() => undefined);
    }
    onSelect(key);
  };

  const dark = theme.scheme === 'dark';
  const dropRadius = (TAB_BAR_HEIGHT - DROP_INSET * 2) / 2;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: TAB_BAR_OFFSET + insets.bottom,
        alignItems: 'center',
        paddingHorizontal: gutter,
      }}
    >
      <View
        testID={testID}
        accessibilityRole="tablist"
        onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
        style={[
          {
            width: '100%',
            maxWidth: maxContentWidth,
            height: TAB_BAR_HEIGHT,
            flexDirection: 'row',
            paddingHorizontal: ROW_PADDING,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
          theme.shadow.nav,
        ]}
      >
        {slot > 0 ? (
          <Animated.View
            pointerEvents="none"
            testID="goutte-active"
            style={{
              position: 'absolute',
              top: DROP_INSET,
              bottom: DROP_INSET,
              left: ROW_PADDING + DROP_INSET,
              width: slot - DROP_INSET * 2,
              transform: [
                { translateX: Animated.multiply(position, slot) },
                { scaleX: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) },
                { scaleY: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
              ],
            }}
          >
            {/* Au repos : capsule pleine, sans effet. */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: dropRadius,
                  backgroundColor: theme.colors.primaryFixed,
                  opacity: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                },
              ]}
            />
            {/* En transition : goutte de verre translucide, liseré et reflet lumineux. */}
            <Animated.View
              testID="goutte-verre"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: dropRadius,
                  backgroundColor: dark ? 'rgba(42, 35, 80, 0.55)' : 'rgba(228, 220, 255, 0.55)',
                  borderWidth: 1,
                  borderColor: dark ? 'rgba(205, 193, 255, 0.35)' : 'rgba(255, 255, 255, 0.95)',
                  boxShadow: dark
                    ? 'inset 0px 1px 2px rgba(255, 255, 255, 0.25), 0px 6px 18px rgba(0, 0, 0, 0.45)'
                    : 'inset 0px 1px 2px rgba(255, 255, 255, 1), inset 0px -2px 5px rgba(95, 58, 221, 0.16), 0px 8px 20px rgba(95, 58, 221, 0.28)',
                  opacity: lift,
                },
              ]}
            />
          </Animated.View>
        ) : null}
        {items.map((item) => (
          <TabButton
            key={item.key}
            item={item}
            active={item.key === activeKey}
            reduceMotion={reduceMotion}
            onPress={() => select(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

function TabButton({
  item,
  active,
  reduceMotion,
  onPress,
}: {
  item: TabBarItem;
  active: boolean;
  reduceMotion: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const focus = useState(() => new Animated.Value(active ? 1 : 0))[0];
  const press = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    if (reduceMotion) {
      focus.setValue(active ? 1 : 0);
      return;
    }
    Animated.timing(focus, {
      toValue: active ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, focus, reduceMotion]);

  const pressTo = (value: number) => {
    if (reduceMotion) return;
    Animated.spring(press, {
      toValue: value,
      damping: 12,
      stiffness: 320,
      useNativeDriver: true,
    }).start();
  };

  const scale = Animated.multiply(
    press,
    focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
  );

  const layer = (color: string, fontFamily: string) => (
    <>
      <Icon name={item.icon} size={22} color={color} />
      <Text
        variant="caption"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{ color, fontFamily }}
      >
        {item.label}
      </Text>
    </>
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onPressIn={() => pressTo(0.9)}
      onPressOut={() => pressTo(1)}
      testID={`onglet-${item.key}`}
      style={{ flex: 1, height: TAB_BAR_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          gap: 2,
          transform: [
            { scale },
            { translateY: focus.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
          ],
        }}
      >
        <Animated.View
          style={{
            alignItems: 'center',
            gap: 2,
            opacity: focus.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          }}
        >
          {layer(theme.colors.textMuted, theme.fontFamily.bodyMedium)}
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            alignItems: 'center',
            gap: 2,
            opacity: focus,
          }}
        >
          {layer(theme.colors.onPrimaryFixed, theme.fontFamily.bodyBold)}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
