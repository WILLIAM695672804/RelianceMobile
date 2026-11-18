import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme';

import { Button } from './Button';
import { Text } from './Text';

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Action irréversible : le bouton de confirmation est signalé. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation en feuille basse, dans le style Clean Lavender. */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel={cancelLabel ?? t('common:actions.cancel')}
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: 'rgba(16,14,34,0.45)' }}
      />
      <View
        accessibilityViewIsModal
        style={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 24 + insets.bottom,
          gap: 12,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.border,
            marginBottom: 8,
          }}
        />
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        <Text tone="muted">{message}</Text>
        <View style={{ gap: 8, marginTop: 8 }}>
          <Button
            label={confirmLabel ?? t('common:actions.confirm')}
            size="lg"
            full
            icon={destructive ? 'close' : undefined}
            onPress={onConfirm}
          />
          <Button
            label={cancelLabel ?? t('common:actions.cancel')}
            variant="ghost"
            size="lg"
            full
            onPress={onCancel}
          />
        </View>
      </View>
    </Modal>
  );
}
