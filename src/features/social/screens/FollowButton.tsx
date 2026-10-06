import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/shared/components';

import {
  useFollowCounts,
  useFollowStatus,
  useFollowUser,
  useUnfollowUser,
} from '../hooks/useFollows';

export interface FollowButtonProps {
  userId: string;
  /** Nom du compte, repris dans l'étiquette d'accessibilité. */
  name: string;
  /** Masque le nombre d'abonnés lorsque l'écran l'affiche déjà. */
  hideCount?: boolean;
}

/** Bouton de suivi d'un compte, avec son nombre d'abonnés. */
export function FollowButton({ userId, name, hideCount }: FollowButtonProps) {
  const { t } = useTranslation();
  const status = useFollowStatus(userId);
  const counts = useFollowCounts(userId);
  const follow = useFollowUser();
  const unfollow = useUnfollowUser();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const following = status.data ?? false;
  const pending = follow.isPending || unfollow.isPending || status.isPending;

  const toggle = async () => {
    setNotice(null);
    setError(null);
    try {
      if (following) {
        await unfollow.mutateAsync(userId);
        setNotice(t('social:follow.unfollowed'));
      } else {
        await follow.mutateAsync(userId);
        setNotice(t('social:follow.followed'));
      }
    } catch {
      setError(t('social:follow.failed'));
    }
  };

  return (
    <View style={styles.container}>
      <Button
        label={t(following ? 'social:follow.unfollow' : 'social:follow.follow')}
        accessibilityLabel={t(
          following ? 'social:follow.unfollowNamed' : 'social:follow.followNamed',
          {
            name,
          },
        )}
        onPress={() => void toggle()}
        loading={pending}
        variant={following ? 'secondary' : 'primary'}
      />
      {!hideCount && counts.isSuccess ? (
        <Text variant="caption" tone="muted">
          {t('social:follow.followers', { count: counts.data.followers_count })}
        </Text>
      ) : null}
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
});
