import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatAmount, formatDistance, formatRating } from '@/shared/format';
import { locateDevice, openAppSettings, type Coordinates } from '@/shared/location';
import {
  Avatar,
  Banner,
  Button,
  Card,
  ChoiceChip,
  EmptyState,
  Icon,
  Pill,
  QueryGate,
  Screen,
  SearchBar,
  Text,
  TopBar,
} from '@/shared/ui';

import { useTechnicianDirectory } from '../hooks/useDirectory';
import type { TechnicianCard } from '../schemas/directorySchemas';

/** Rayon retenu par le filtre « autour de moi ». */
const NEARBY_RADIUS_KM = 50;
/** Compétences citées sur une carte. */
const LISTED_SKILLS = 3;

export interface TechnicianDirectoryScreenProps {
  /** Ouverture du profil public d'un technicien. */
  onOpen: (technicianId: string) => void;
  onBack?: () => void;
}

/** Annuaire des techniciens vérifiés : recherche par nom et filtre de proximité. */
export function TechnicianDirectoryScreen({ onOpen, onBack }: TechnicianDirectoryScreenProps) {
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

  return (
    <Screen
      testID="annuaire"
      onRefresh={() => void directory.refetch()}
      refreshing={directory.isRefetching}
    >
      <TopBar title={t('directory:title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <SearchBar
          label={t('directory:searchLabel')}
          placeholder={t('directory:searchLabel')}
          value={draft}
          onChangeText={setDraft}
          onSubmit={() => setSearch(draft)}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <ChoiceChip
            label={t('directory:nearby')}
            selected={coordinates !== null}
            onPress={() => void toggleNearby()}
          />
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            {locating
              ? t('common:states.loading')
              : t(coordinates ? 'directory:nearbyActive' : 'directory:nearbyOff')}
          </Text>
        </View>
        {locationError === 'denied' ? (
          <>
            <Banner tone="danger" message={t('directory:permissionDenied')} />
            <Button
              label={t('directory:openSettings')}
              variant="ghost"
              full
              onPress={() => void openAppSettings()}
            />
          </>
        ) : null}
        {locationError === 'unavailable' ? (
          <Banner tone="warning" message={t('directory:positionUnavailable')} />
        ) : null}
        <QueryGate queries={[directory]}>
          {() =>
            directory.data!.technicians.length === 0 ? (
              <EmptyState
                icon="search"
                title={t('directory:title')}
                message={t('directory:empty')}
              />
            ) : (
              <>
                <Text variant="eyebrow" tone="muted">
                  {t('directory:count', {
                    count: directory.data!.total ?? directory.data!.technicians.length,
                  })}
                </Text>
                {directory.data!.technicians.map((technician) => (
                  <TechnicianDirectoryCard
                    key={technician.id}
                    technician={technician}
                    onOpen={onOpen}
                  />
                ))}
              </>
            )
          }
        </QueryGate>
      </View>
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
  const place =
    technician.distance_km != null
      ? t('directory:distance', { distance: formatDistance(technician.distance_km) })
      : technician.location?.city
        ? t('directory:city', { city: technician.location.city })
        : null;
  const facts = [
    technician.rating != null
      ? t('directory:rating', {
          rating: formatRating(technician.rating),
          count: technician.num_reviews ?? 0,
        })
      : null,
    place,
  ].filter(Boolean);

  return (
    <Card
      padding={16}
      onPress={() => onOpen(technician.id)}
      accessibilityLabel={`${t('directory:open')} : ${technician.name}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={technician.name} uri={technician.avatar_url} size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {technician.name}
            </Text>
            {technician.verified ? (
              <Pill label={t('directory:verified')} tone="success" size="sm" icon="check" />
            ) : null}
          </View>
          {facts.length > 0 ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {facts.join(' · ')}
            </Text>
          ) : null}
        </View>
        <Icon name="chevronR" size={14} tone="muted" />
      </View>
      {technician.skills.length > 0 ? (
        <Text variant="label" style={{ marginTop: 10 }}>
          {t('directory:skills', {
            skills: technician.skills
              .slice(0, LISTED_SKILLS)
              .map((skill) => skill.name)
              .join(', '),
          })}
        </Text>
      ) : null}
      {lowestRate != null ? (
        <Text variant="labelStrong" tone="primary" style={{ marginTop: 4 }}>
          {t('directory:fromRate', { amount: formatAmount(lowestRate) })}
        </Text>
      ) : null}
    </Card>
  );
}
