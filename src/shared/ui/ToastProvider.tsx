import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, Animated, PanResponder, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/core/responsive';

import { Toast, type ToastContent } from './Toast';
import { useReducedMotion } from './useReducedMotion';

/** Durée d'affichage par défaut, en millisecondes. */
export const TOAST_DURATION = 4000;
/** Déplacement horizontal au-delà duquel un glissement ferme le toast. */
const SWIPE_DISMISS = 80;

export interface ToastRequest extends ToastContent {
  /** Durée d'affichage ; 0 garde le toast jusqu'à sa fermeture. */
  duration?: number;
}

interface ToastApi {
  show: (toast: ToastRequest) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Affiche un toast par-dessus l'écran courant. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast exige un ToastProvider.');
  return api;
}

interface Entry extends ToastRequest {
  id: number;
}

/**
 * Hôte des toasts : un seul à la fois, les suivants en file. Le toast glisse depuis le haut,
 * se ferme seul, d'un glissement horizontal ou par sa croix, et s'annonce aux lecteurs d'écran.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Entry[]>([]);
  const nextId = useRef(0);
  const current = queue[0];

  const show = useCallback((toast: ToastRequest) => {
    nextId.current += 1;
    const id = nextId.current;
    setQueue((entries) => [...entries, { ...toast, id }]);
  }, []);
  const dismiss = useCallback(() => setQueue((entries) => entries.slice(1)), []);
  /** Retrait idempotent : sans effet si ce toast a déjà quitté la tête de file. */
  const remove = useCallback(
    (id: number) => setQueue((entries) => (entries[0]?.id === id ? entries.slice(1) : entries)),
    [],
  );
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {current ? <ToastSlot key={current.id} entry={current} onGone={remove} /> : null}
    </ToastContext.Provider>
  );
}

function ToastSlot({ entry, onGone }: { entry: Entry; onGone: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  const { gutter, maxContentWidth } = useResponsive();
  const reduceMotion = useReducedMotion();
  const [enter] = useState(() => new Animated.Value(0));
  const [dragX] = useState(() => new Animated.Value(0));

  const leave = useCallback(
    (toX = 0) => {
      if (reduceMotion) {
        onGone(entry.id);
        return;
      }
      Animated.parallel([
        Animated.timing(enter, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(dragX, { toValue: toX, duration: 180, useNativeDriver: true }),
      ]).start(() => onGone(entry.id));
    },
    [dragX, enter, entry.id, onGone, reduceMotion],
  );

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      [entry.title, entry.body].filter(Boolean).join('. '),
    );
    if (reduceMotion) enter.setValue(1);
    else
      Animated.spring(enter, {
        toValue: 1,
        damping: 16,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    const duration = entry.duration ?? TOAST_DURATION;
    if (duration <= 0) return undefined;
    const timer = setTimeout(() => leave(), duration);
    return () => clearTimeout(timer);
  }, [enter, entry, leave, reduceMotion]);

  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => dragX.setValue(gesture.dx),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_DISMISS) leave(gesture.dx > 0 ? 400 : -400);
        else Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: gutter,
      }}
    >
      <Animated.View
        {...pan.panHandlers}
        testID="toast-actif"
        style={{
          width: '100%',
          maxWidth: maxContentWidth,
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
            { translateX: dragX },
          ],
        }}
      >
        <Toast
          {...entry}
          onAction={
            entry.onAction
              ? () => {
                  entry.onAction?.();
                  leave();
                }
              : undefined
          }
          onClose={() => leave()}
        />
      </Animated.View>
    </View>
  );
}
