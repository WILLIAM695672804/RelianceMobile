import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { describeError, normalizeError } from '@/core/errors';
import {
  Banner,
  Button,
  Card,
  ConfirmSheet,
  EmptyState,
  ListRow,
  Pill,
  QueryGate,
  Screen,
  TopBar,
} from '@/shared/ui';

import { useDeleteLocation, useLocations, useSetDefaultLocation } from '../hooks/useLocations';
import type { Location } from '../schemas/profileSchemas';
import { LocationForm } from './LocationForm';

export interface LocationsScreenProps {
  onBack?: () => void;
}

/** Adresses de l'utilisateur : consultation, ajout, adresse par défaut, suppression. */
export function LocationsScreen({ onBack }: LocationsScreenProps = {}) {
  const { t } = useTranslation();
  const locations = useLocations();
  const deleteLocation = useDeleteLocation();
  const setDefaultLocation = useSetDefaultLocation();
  const [adding, setAdding] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<Location | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const labelOf = (location: Location) => location.label ?? t('profile:locations.untitled');

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(describeError(normalizeError(error), t));
    }
  };

  const confirmDeletion = () => {
    const target = pendingDeletion;
    setPendingDeletion(null);
    if (target) void run(() => deleteLocation.mutateAsync(target.id));
  };

  return (
    <Screen
      testID="adresses"
      onRefresh={() => void locations.refetch()}
      refreshing={locations.isRefetching}
    >
      <TopBar title={t('profile:locations.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {actionError ? <Banner tone="danger" message={actionError} /> : null}
        <QueryGate queries={[locations]}>
          {() =>
            (locations.data ?? []).length === 0 ? (
              <EmptyState
                icon="pin"
                title={t('profile:locations.title')}
                message={t('profile:locations.empty')}
              />
            ) : (
              <>
                {locations.data!.map((location) => {
                  const label = labelOf(location);
                  return (
                    <Card key={location.id} padding={0}>
                      <ListRow
                        icon="pin"
                        title={label}
                        detail={[location.address, location.city].filter(Boolean).join(', ')}
                        trailing={
                          location.is_default ? (
                            <Pill label={t('profile:locations.default')} tone="success" size="sm" />
                          ) : (
                            <View />
                          )
                        }
                      />
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          gap: 16,
                          paddingHorizontal: 16,
                          paddingBottom: 12,
                        }}
                      >
                        {location.is_default ? null : (
                          <Button
                            label={t('profile:locations.setAsDefault')}
                            accessibilityLabel={`${t('profile:locations.setAsDefault')} : ${label}`}
                            variant="soft"
                            size="sm"
                            onPress={() =>
                              void run(() => setDefaultLocation.mutateAsync(location.id))
                            }
                          />
                        )}
                        <Button
                          label={t('profile:locations.delete')}
                          accessibilityLabel={`${t('profile:locations.delete')} : ${label}`}
                          variant="ghost"
                          size="sm"
                          onPress={() => setPendingDeletion(location)}
                        />
                      </View>
                    </Card>
                  );
                })}
              </>
            )
          }
        </QueryGate>
        {adding ? (
          <LocationForm onClose={() => setAdding(false)} />
        ) : (
          <Button
            label={t('profile:locations.add')}
            icon="plus"
            variant="soft"
            full
            onPress={() => setAdding(true)}
          />
        )}
      </View>
      <ConfirmSheet
        visible={pendingDeletion !== null}
        destructive
        title={t('profile:locations.deleteTitle')}
        message={t('profile:locations.deleteMessage', {
          label: pendingDeletion ? labelOf(pendingDeletion) : '',
        })}
        confirmLabel={t('profile:locations.delete')}
        onConfirm={confirmDeletion}
        onCancel={() => setPendingDeletion(null)}
      />
    </Screen>
  );
}
