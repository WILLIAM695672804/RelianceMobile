import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from './Screen';
import { Text } from './Text';

export interface PlaceholderScreenProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Écran squelette dans l'attente de l'interface finale. */
export function PlaceholderScreen({ title, description, children }: PlaceholderScreenProps) {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      <Text tone="muted">{description ?? t('common:placeholder.upcoming')}</Text>
      {children}
    </Screen>
  );
}
