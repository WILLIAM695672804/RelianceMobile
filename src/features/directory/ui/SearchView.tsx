import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import type { AppErrorKind } from '@/core/errors';
import { MIN_TOUCH_TARGET } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import {
  Avatar,
  Card,
  ChoiceChip,
  EmptyState,
  ErrorState,
  Icon,
  Pill,
  Screen,
  SearchBar,
  Text,
} from '@/shared/ui';

import { highlight, type SearchResult } from '../model/searchResults';

export interface SearchFilter {
  key: string;
  label: string;
  selected: boolean;
}

export interface TrendingTopic {
  key: string;
  label: string;
  detail: string;
}

export interface SearchViewProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  /** Filtres proposés ; « Tous » est ajouté par la vue et les désélectionne tous. */
  filters: readonly SearchFilter[];
  onToggleFilter: (key: string) => void;
  onClearFilters: () => void;
  recent: readonly string[];
  onPickRecent: (term: string) => void;
  onClearRecent: () => void;
  /** Absentes, la rubrique « Tendances » n'est pas affichée. */
  trending?: readonly TrendingTopic[];
  onPickTrending?: (key: string) => void;
  status: 'idle' | 'loading' | 'error' | 'ready';
  results: readonly SearchResult[];
  errorKind?: AppErrorKind;
  errorMessage?: string;
  onRetry: () => void;
  onOpenResult: (result: SearchResult) => void;
  onBrowseCategories?: () => void;
  onBack: () => void;
}

/** Recherche universelle et filtres (maquette `SearchScreen`), présentation pure. */
export function SearchView(props: SearchViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { query, filters, onToggleFilter, onClearFilters, onBack } = props;
  const anySelected = filters.some((filter) => filter.selected);
  const showingResults = query.trim().length > 0;

  return (
    <Screen testID="recherche">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('directory:find.back')}
          onPress={onBack}
          style={{
            width: MIN_TOUCH_TARGET,
            height: MIN_TOUCH_TARGET,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevronL" size={20} />
        </Pressable>
        <SearchBar
          value={query}
          onChangeText={props.onQueryChange}
          onSubmit={props.onSubmit}
          placeholder={t('directory:find.placeholder')}
          label={t('directory:find.label')}
          testID="champ-recherche"
        />
      </View>

      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10, gap: 6 }}
        >
          <ChoiceChip
            label={t('common:filters.all')}
            selected={!anySelected}
            onPress={onClearFilters}
          />
          {filters.map((filter) => (
            <ChoiceChip
              key={filter.key}
              label={filter.label}
              selected={filter.selected}
              onPress={() => onToggleFilter(filter.key)}
            />
          ))}
        </ScrollView>
      </View>

      {showingResults ? (
        <Results {...props} anySelected={anySelected} />
      ) : (
        <Suggestions {...props} />
      )}
    </Screen>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1 }}>
      {children}
    </Text>
  );
}

function Results({
  query,
  filters,
  onToggleFilter,
  status,
  results,
  errorKind,
  errorMessage,
  onRetry,
  onOpenResult,
  onBrowseCategories,
  anySelected,
}: SearchViewProps & { anySelected: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const activeFilters = anySelected ? (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
      }}
    >
      <Text variant="caption" tone="muted" style={{ fontFamily: theme.fontFamily.bodySemiBold }}>
        {t('directory:find.filters')}
      </Text>
      {filters
        .filter((filter) => filter.selected)
        .map((filter) => (
          <ChoiceChip
            key={filter.key}
            variant="removable"
            label={filter.label}
            selected
            onPress={() => onToggleFilter(filter.key)}
          />
        ))}
    </View>
  ) : null;

  if (status === 'loading' || status === 'idle') {
    return (
      <>
        {activeFilters}
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator accessibilityLabel={t('common:states.loading')} />
        </View>
      </>
    );
  }
  if (status === 'error') {
    return <ErrorState kind={errorKind ?? 'unknown'} message={errorMessage} onRetry={onRetry} />;
  }
  if (results.length === 0) {
    return (
      <>
        {activeFilters}
        <EmptyState
          icon="search"
          tone="neutral"
          title={t('directory:find.emptyTitle')}
          message={t('directory:find.emptyBody', { query: query.trim() })}
          actionLabel={onBrowseCategories ? t('directory:find.browse') : undefined}
          onAction={onBrowseCategories}
        />
      </>
    );
  }

  return (
    <>
      {activeFilters}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
        <Eyebrow>
          {t('directory:find.results', { count: results.length, query: query.trim() })}
        </Eyebrow>
      </View>
      {results.map((result) => (
        <Pressable
          key={`${result.kind}-${result.id}`}
          accessibilityRole="button"
          accessibilityLabel={result.title}
          accessibilityHint={result.subtitle}
          onPress={() => onOpenResult(result)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
          })}
        >
          <Avatar name={result.title} size={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              variant="labelStrong"
              numberOfLines={1}
              style={{ fontFamily: theme.fontFamily.bodyBold }}
            >
              {highlight(result.title, query).map((part, index) =>
                part.match ? (
                  <Text
                    key={index}
                    variant="labelStrong"
                    style={{
                      fontFamily: theme.fontFamily.bodyBold,
                      backgroundColor: `${theme.colors.primary}33`,
                    }}
                  >
                    {part.text}
                  </Text>
                ) : (
                  part.text
                ),
              )}
            </Text>
            {result.subtitle ? (
              <Text variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 11 }}>
                {result.subtitle}
              </Text>
            ) : null}
          </View>
          <Pill label={t(`directory:find.kinds.${result.kind}`)} tone="primary" size="sm" />
        </Pressable>
      ))}
    </>
  );
}

function Suggestions({
  recent,
  onPickRecent,
  onClearRecent,
  trending,
  onPickTrending,
}: SearchViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      {recent.length > 0 ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 16,
              paddingRight: 8,
              paddingTop: 4,
            }}
          >
            <Eyebrow>{t('directory:find.recent')}</Eyebrow>
            <Pressable
              accessibilityRole="button"
              onPress={onClearRecent}
              style={{
                minHeight: MIN_TOUCH_TARGET,
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}
            >
              <Text variant="caption" tone="muted">
                {t('directory:find.clear')}
              </Text>
            </Pressable>
          </View>
          {recent.map((term) => (
            <Pressable
              key={term}
              accessibilityRole="button"
              accessibilityLabel={term}
              onPress={() => onPickRecent(term)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 16,
                minHeight: MIN_TOUCH_TARGET,
                backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
              })}
            >
              <Icon name="clock" size={15} tone="muted" />
              <Text variant="label" style={{ flex: 1, fontFamily: theme.fontFamily.body }}>
                {term}
              </Text>
              <Icon name="chevronR" size={14} tone="muted" />
            </Pressable>
          ))}
        </>
      ) : null}

      {trending && trending.length > 0 ? (
        <>
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
            <Eyebrow>{t('directory:find.trending')}</Eyebrow>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 6 }}>
            {trending.map((topic) => (
              <Card
                key={topic.key}
                padding={12}
                onPress={onPickTrending ? () => onPickTrending(topic.key) : undefined}
                accessibilityLabel={topic.label}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: theme.tint.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="bolt" size={14} tone="primary" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="labelStrong">{topic.label}</Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {topic.detail}
                    </Text>
                  </View>
                  <Icon name="chevronR" size={14} tone="muted" />
                </View>
              </Card>
            ))}
          </View>
        </>
      ) : null}
    </>
  );
}
