import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Button } from './Button';
import { Text } from './Text';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          style={[
            styles.dialog,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg },
          ]}
        >
          <Text variant="subtitle" accessibilityRole="header">
            {title}
          </Text>
          <Text tone="muted">{message}</Text>
          <Button label={confirmLabel ?? t('common:actions.confirm')} onPress={onConfirm} />
          <Button
            label={cancelLabel ?? t('common:actions.cancel')}
            onPress={onCancel}
            variant="ghost"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(11,18,32,0.5)',
  },
  dialog: { padding: 20, gap: 12 },
});
