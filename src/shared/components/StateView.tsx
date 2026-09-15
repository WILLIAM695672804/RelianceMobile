import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import { useTheme } from '@/core/theme';

import { Button } from './Button';
import { Text } from './Text';

export type StateViewProps =
  | { status: 'loading' }
  | { status: 'error'; error: unknown; onRetry?: () => void }
  | { status: 'empty'; message?: string };

/** États non nominaux d'un écran : chargement, erreur, vide. */
export function StateView(props: StateViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {props.status === 'loading' ? (
        <ActivityIndicator
          accessibilityLabel={t('common:states.loading')}
          color={theme.colors.primary}
        />
      ) : null}
      {props.status === 'error' ? (
        <>
          <Text tone="danger">{describeError(normalizeError(props.error), t)}</Text>
          {props.onRetry ? (
            <Button label={t('common:actions.retry')} onPress={props.onRetry} variant="secondary" />
          ) : null}
        </>
      ) : null}
      {props.status === 'empty' ? (
        <Text tone="muted">{props.message ?? t('common:states.empty')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
});
