import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Screen,
  SearchField,
  StateView,
  Text,
} from '@/shared/components';
import { formatAmount, formatDistance, formatRating } from '@/shared/format';
import { locateDevice, openAppSettings, type Coordinates } from '@/shared/location';

import { useTechnicianDirectory } from '../hooks/useDirectory';
import type { TechnicianCard } from '../schemas/directorySchemas';

/** Rayon retenu par le filtre « autour de moi ». */
const NEARBY_RADIUS_KM = 50;
/** Compétences citées sur une carte. */
const LISTED_SKILLS = 3;

export interface TechnicianDirectoryScreenProps {
  /** Ouverture du profil public d'un technicien. */
  onOpen: (technicianId: string) => void;
}

/** Annuaire des techniciens vérifiés : recherche par nom et filtre de proximité. */
export function TechnicianDirectoryScreen({ onOpen }: TechnicianDirectoryScreenProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<'denied' | 'unavailable' | null>(null);
  const directory = useTechnicianDirectory({
    search,
    coordinates,
    radiusKm: NEARBY_RADIUS_KM,
  });

  const toggleNearby = async () => {
    setLocationError(null);
    if (coordinates) {
      setCoordinates(null);
      return;
    }
    setLocating(true);
    const result = await locateDevice();
    setLocating(false);
    if (result.status === 'located') {
      setCoordinates({ latitude: result.place.latitude, longitude: result.place.longitude });
    } else setLocationError(result.status);
  };

  const renderResults = () => {
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
      return <StateView status="empty" message={t('directory:empty')} />;
    }
    return (
      <>
        <Text tone="muted">
          {t('directory:count', {
            count: directory.data.total ?? directory.data.technicians.length,
          })}
        </Text>
        {directory.data.technicians.map((technician) => (
          <TechnicianDirectoryCard key={technician.id} technician={technician} onOpen={onOpen} />
        ))}
      </>
    );
  };

  return (
    <Screen
      title={t('directory:title')}
      onRefresh={() => void directory.refetch()}
      refreshing={directory.isRefetching}
    >
      <SearchField
        placeholder={t('directory:searchLabel')}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => setSearch(draft)}
      />
      <View style={styles.filters}>
        <Button
          label={t('directory:submit')}
          icon="search"
          size="sm"
          onPress={() => setSearch(draft)}
        />
        <Button
          label={t('directory:nearby')}
          icon="location"
          size="sm"
          onPress={() => void toggleNearby()}
          loading={locating}
          variant={coordinates ? 'primary' : 'secondary'}
        />
      </View>
      <Text variant="caption" tone="muted">
        {t(coordinates ? 'directory:nearbyActive' : 'directory:nearbyOff')}
      </Text>
      {locationError === 'denied' ? (
        <View style={styles.notice}>
          <Text tone="danger">{t('directory:permissionDenied')}</Text>
          <Button
            label={t('directory:openSettings')}
            onPress={() => void openAppSettings()}
            variant="ghost"
          />
        </View>
      ) : null}
      {locationError === 'unavailable' ? (
        <Text tone="danger">{t('directory:positionUnavailable')}</Text>
      ) : null}
      {renderResults()}
    </Screen>
  );
}

function TechnicianDirectoryCard({
  technician,
  onOpen,
}: {
  technician: TechnicianCard;
  onOpen: (technicianId: string) => void;
}) {
  const { t } = useTranslation();
  const rates = technician.skills
    .map((skill) => skill.hourly_rate)
    .filter((rate): rate is number => rate != null);
  const lowestRate = rates.length > 0 ? Math.min(...rates) : null;

  return (
    <Card>
      <View style={styles.header}>
        <Avatar name={technician.name} uri={technician.avatar_url} size={48} />
        <View style={styles.identity}>
          <Text variant="subtitle">{technician.name}</Text>
          {technician.verified ? <Badge label={t('directory:verified')} tone="success" /> : null}
        </View>
      </View>
      {technician.rating != null ? (
        <Text tone="muted">
          {t('directory:rating', {
            rating: formatRating(technician.rating),
            count: technician.num_reviews ?? 0,
          })}
        </Text>
      ) : null}
      {technician.distance_km != null ? (
        <Text tone="muted">
          {t('directory:distance', { distance: formatDistance(technician.distance_km) })}
        </Text>
      ) : technician.location?.city ? (
        <Text tone="muted">{t('directory:city', { city: technician.location.city })}</Text>
      ) : null}
      {technician.skills.length > 0 ? (
        <Text>
          {t('directory:skills', {
            skills: technician.skills
              .slice(0, LISTED_SKILLS)
              .map((skill) => skill.name)
              .join(', '),
          })}
        </Text>
      ) : null}
      {lowestRate != null ? (
        <Text>{t('directory:fromRate', { amount: formatAmount(lowestRate) })}</Text>
      ) : null}
      <Button
        label={t('directory:open')}
        onPress={() => onOpen(technician.id)}
        variant="secondary"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identity: { flex: 1, gap: 4 },
  notice: { gap: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
});
