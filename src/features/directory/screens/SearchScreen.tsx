import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Avatar,
  Badge,
  Button,
  Card,
  ListItem,
  Screen,
  SearchField,
  SectionHeader,
  StateView,
  Text,
} from '@/shared/components';
import { formatRating } from '@/shared/format';

import { useTechnicianDirectory } from '../hooks/useDirectory';
import type { SearchHistory } from '../model/searchHistory';
import type { TechnicianCard } from '../schemas/directorySchemas';

export interface SearchScreenProps {
  /** Historique local des recherches, injecté pour rester testable. */
  history: SearchHistory;
  onBack?: () => void;
  /** Ouverture du profil public d'un technicien. */
  onOpen: (technicianId: string) => void;
}

/** Recherche de techniciens avec historique local, transposition de `SearchScreen`. */
export function SearchScreen({ history, onBack, onOpen }: SearchScreenProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState(() => history.read());
  const directory = useTechnicianDirectory({ search, coordinates: null });

  const run = (term: string) => {
    const trimmed = term.trim();
    if (trimmed === '') return;
    history.remember(trimmed);
    setRecent(history.read());
    setDraft(trimmed);
    setSearch(trimmed);
  };

  const renderTechnician = (technician: TechnicianCard) => (
    <Card
      key={technician.id}
      onPress={() => onOpen(technician.id)}
      accessibilityLabel={t('directory:search.open', { name: technician.name })}
    >
      <View style={styles.row}>
        <Avatar name={technician.name} uri={technician.avatar_url} size={40} />
        <View style={styles.identity}>
          <Text variant="subtitle" numberOfLines={1}>
            {technician.name}
          </Text>
          {technician.skills.length > 0 ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {technician.skills[0]?.name}
            </Text>
          ) : null}
        </View>
        {technician.rating != null ? (
          <Badge label={formatRating(technician.rating)} tone="success" icon="star" />
        ) : null}
      </View>
    </Card>
  );

  const renderResults = () => {
    if (search === '') return null;
    if (directory.isPending) return <StateView status="loading" />;
    if (directory.isError) {
      return (
        <StateView
          status="error"
          error={directory.error}
          onRetry={() => void directory.refetch()}
        />
      );
    }
    if (directory.data.technicians.length === 0) {
      return <StateView status="empty" message={t('directory:search.noResult', { search })} />;
    }
    return (
      <>
        <SectionHeader title={t('directory:search.results')} />
        {directory.data.technicians.map(renderTechnician)}
      </>
    );
  };

  return (
    <Screen title={t('directory:search.title')} onBack={onBack} scroll>
      <SearchField
        placeholder={t('directory:searchLabel')}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => run(draft)}
      />
      <Button label={t('directory:submit')} icon="search" size="sm" onPress={() => run(draft)} />
      {recent.length > 0 ? (
        <>
          <SectionHeader
            title={t('directory:search.recent')}
            actionLabel={t('directory:search.clear')}
            onAction={() => {
              history.clear();
              setRecent([]);
            }}
          />
          {recent.map((term) => (
            <ListItem key={term} label={term} icon="clock" onPress={() => run(term)} />
          ))}
        </>
      ) : (
        <Text tone="muted">{t('directory:search.noHistory')}</Text>
      )}
      {renderResults()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1, gap: 2 },
});
