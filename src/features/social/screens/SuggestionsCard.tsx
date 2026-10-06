import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, Card, StateView, Text } from '@/shared/components';
import { formatRating } from '@/shared/format';

import { useSuggestions } from '../hooks/useFollows';
import { FollowButton } from './FollowButton';

/** Comptes présentés à la suite. */
const LISTED_SUGGESTIONS = 5;

/** Suggestions de comptes à suivre, pour alimenter « Mon fil ». */
export function SuggestionsCard() {
  const { t } = useTranslation();
  const suggestions = useSuggestions();

  const renderSuggestions = () => {
    if (suggestions.isPending) return <StateView status="loading" />;
    if (suggestions.isError) {
      return (
        <StateView
          status="error"
          error={suggestions.error}
          onRetry={() => void suggestions.refetch()}
        />
      );
    }
    if (suggestions.data.length === 0) {
      return <Text tone="muted">{t('social:follow.suggestionsEmpty')}</Text>;
    }
    return suggestions.data.slice(0, LISTED_SUGGESTIONS).map((suggestion) => (
      <View key={suggestion.id} style={styles.suggestion}>
        <View style={styles.identity}>
          <Avatar name={suggestion.name} uri={suggestion.avatar_url} size={40} />
          <View style={styles.texts}>
            <Text>{suggestion.name}</Text>
            {suggestion.rating != null ? (
              <Text variant="caption" tone="muted">
                {t('social:follow.rating', { rating: formatRating(suggestion.rating) })}
              </Text>
            ) : null}
          </View>
        </View>
        <FollowButton userId={suggestion.id} name={suggestion.name} hideCount />
      </View>
    ));
  };

  return (
    <Card>
      <Text variant="subtitle">{t('social:follow.suggestionsTitle')}</Text>
      {renderSuggestions()}
    </Card>
  );
}

const styles = StyleSheet.create({
  suggestion: { gap: 8 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texts: { flex: 1, gap: 2 },
});
