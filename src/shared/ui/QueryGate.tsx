import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { normalizeError } from '@/core/errors';
import { useTheme } from '@/core/theme';

import { ErrorState } from './ErrorState';
import { Screen } from './Screen';

/** Sous-ensemble d'un résultat de requête TanStack utile à l'affichage. */
export interface GateQuery {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

export interface QueryGateProps {
  /** Requêtes dont dépend l'écran : la première en échec l'emporte. */
  queries: readonly GateQuery[];
  withTabBar?: boolean;
  children: () => ReactNode;
}

/**
 * Affiche le chargement puis l'erreur (selon sa catégorie, avec « Réessayer ») des requêtes
 * d'un écran ; rend l'écran dès que toutes ont abouti.
 */
export function QueryGate({ queries, withTabBar = false, children }: QueryGateProps) {
  const theme = useTheme();
  const failed = queries.find((query) => query.isError);
  if (failed) {
    return (
      <Screen withTabBar={withTabBar} testID="echec-chargement">
        <ErrorState
          kind={normalizeError(failed.error).kind}
          onRetry={() => queries.forEach((query) => query.isError && void query.refetch())}
        />
      </Screen>
    );
  }
  if (queries.some((query) => query.isPending)) {
    return (
      <Screen withTabBar={withTabBar} testID="chargement">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </Screen>
    );
  }
  return <>{children()}</>;
}
