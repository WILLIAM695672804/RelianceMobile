import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSession } from '@/core/session';
import { groupSkillsByCategory, useSkillCatalog } from '@/features/profile';
import {
  AdaptiveGrid,
  Avatar,
  Badge,
  Button,
  Card,
  Icon,
  IconButton,
  IconTile,
  Screen,
  SearchField,
  SectionHeader,
  StateView,
  Text,
} from '@/shared/components';
import { formatDate } from '@/shared/format';

import { useRequests } from '../hooks/useRequests';
import { iconForCategory } from '../model/categoryIcons';
import { countOpenRequests, MAX_OPEN_REQUESTS, stageOf, STAGE_TONES } from '../model/requestStage';
import type { ServiceRequest } from '../schemas/requestSchemas';

/** Nombre de demandes affichées dans « Demandes récentes ». */
const RECENT_LIMIT = 5;

export interface ClientHomeScreenProps {
  /** Ouverture de la liste complète des demandes. */
  onOpenAll?: () => void;
  onNewRequest: () => void;
  onOpenRequest: (requestId: string) => void;
  /** Barre de recherche et action « Tout voir » des services : mène à l'annuaire. */
  onSearch?: () => void;
  /** Action de la cloche de l'en-tête. */
  onOpenNotifications?: () => void;
}

/** E05 — Accueil client : services, demandes en cours, demandes récentes, création d'une demande. */
export function ClientHomeScreen({
  onNewRequest,
  onOpenRequest,
  onOpenAll,
  onSearch,
  onOpenNotifications,
}: ClientHomeScreenProps) {
  const { t } = useTranslation();
  const user = useSession((state) => state.user);
  const requests = useRequests();
  const catalog = useSkillCatalog();
  const openCount = requests.data ? countOpenRequests(requests.data.data) : 0;
  const limitReached = openCount >= MAX_OPEN_REQUESTS;

  const renderRequest = (request: ServiceRequest) => {
    const stage = stageOf(request.status);
    const label = t(`requests:stages.${stage}`);
    const detail = [request.category?.name, formatDate(request.created_at)]
      .filter(Boolean)
      .join(' · ');
    return (
      <Card
        key={request.id}
        onPress={() => onOpenRequest(request.id)}
        accessibilityLabel={request.title}
      >
        <View style={styles.cardHeader}>
          <Text variant="label" style={styles.cardTitle} numberOfLines={2}>
            {request.title}
          </Text>
          <Badge label={label} tone={STAGE_TONES[stage]} />
        </View>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </Card>
    );
  };

  const renderRequests = () => {
    if (requests.isPending) return <StateView status="loading" />;
    if (requests.isError) {
      return (
        <View style={styles.error}>
          <Text tone="danger">{t('requests:home.loadError')}</Text>
          <Button
            label={t('common:actions.retry')}
            onPress={() => void requests.refetch()}
            variant="secondary"
          />
        </View>
      );
    }
    if (requests.data.data.length === 0) {
      return <StateView status="empty" message={t('requests:home.empty')} />;
    }
    return (
      <>
        <SectionHeader
          title={t('requests:home.recent')}
          actionLabel={onOpenAll ? t('requests:home.openAll') : undefined}
          onAction={onOpenAll}
        />
        {requests.data.data.slice(0, RECENT_LIMIT).map(renderRequest)}
      </>
    );
  };

  const renderServices = () => {
    if (!catalog.isSuccess) return null;
    // Tous les domaines du catalogue sont présentés : la grille s'adapte à la largeur
    // disponible, aucune troncature arbitraire n'est donc nécessaire.
    const groups = groupSkillsByCategory(catalog.data, t('requests:form.otherCategory'));
    if (groups.length === 0) return null;
    return (
      <>
        <SectionHeader
          title={t('requests:home.services')}
          actionLabel={onSearch ? t('requests:home.seeAll') : undefined}
          onAction={onSearch}
        />
        <AdaptiveGrid minTileWidth={96}>
          {groups.map((group) => (
            <IconTile
              key={group.category}
              icon={iconForCategory(group.category)}
              label={group.category}
              onPress={onNewRequest}
              testID={`service-${group.category}`}
            />
          ))}
        </AdaptiveGrid>
      </>
    );
  };

  return (
    <Screen onRefresh={() => void requests.refetch()} refreshing={requests.isRefetching}>
      <View style={styles.header}>
        <Avatar name={user?.name ?? ''} uri={user?.avatarUrl} size={48} />
        <View style={styles.headerText}>
          <Text variant="title" accessibilityRole="header">
            {t('requests:home.greeting', { name: user?.name ?? '' })}
          </Text>
          {requests.isSuccess ? (
            <Text tone="muted">{t('requests:home.openCount', { count: openCount })}</Text>
          ) : null}
        </View>
        {onOpenNotifications ? (
          <IconButton
            icon="bell"
            filled
            accessibilityLabel={t('requests:home.notifications')}
            onPress={onOpenNotifications}
            testID="home-notifications"
          />
        ) : null}
      </View>
      {onSearch ? (
        <SearchField
          placeholder={t('requests:home.searchPlaceholder')}
          onPress={onSearch}
          testID="home-search"
        />
      ) : null}
      <Button
        label={t('requests:home.newRequest')}
        icon="plus"
        size="lg"
        fullWidth
        onPress={onNewRequest}
        disabled={limitReached}
      />
      {limitReached ? (
        <View style={styles.notice}>
          <Icon name="info" size={16} tone="muted" />
          <Text tone="muted" style={styles.noticeText}>
            {t('requests:home.limitReached', { max: MAX_OPEN_REQUESTS })}
          </Text>
        </View>
      ) : null}
      {renderServices()}
      {renderRequests()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { flex: 1 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noticeText: { flex: 1 },
  error: { alignItems: 'center', gap: 12, padding: 24 },
});
