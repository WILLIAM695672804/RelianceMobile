import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { Badge, Button, Card, ConfirmDialog, Screen, StateView, Text } from '@/shared/components';

import { useDeleteLocation, useLocations, useSetDefaultLocation } from '../hooks/useLocations';
import type { Location } from '../schemas/profileSchemas';
import { LocationForm } from './LocationForm';

/** Adresses de l'utilisateur : consultation, ajout, adresse par défaut, suppression. */
export function LocationsScreen() {
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

  const renderList = () => {
    if (locations.isPending) return <StateView status="loading" />;
    if (locations.isError) {
      return (
        <StateView
          status="error"
          error={locations.error}
          onRetry={() => void locations.refetch()}
        />
      );
    }
    if (locations.data.length === 0) {
      return <StateView status="empty" message={t('profile:locations.empty')} />;
    }
    return locations.data.map((location) => {
      const label = labelOf(location);
      return (
        <Card key={location.id}>
          <Text variant="subtitle">{label}</Text>
          <Text tone="muted">{[location.address, location.city].filter(Boolean).join(', ')}</Text>
          {location.is_default ? (
            <Badge label={t('profile:locations.default')} tone="success" />
          ) : (
            <Button
              label={t('profile:locations.setAsDefault')}
              accessibilityLabel={`${t('profile:locations.setAsDefault')} : ${label}`}
              onPress={() => void run(() => setDefaultLocation.mutateAsync(location.id))}
              variant="ghost"
            />
          )}
          <Button
            label={t('profile:locations.delete')}
            accessibilityLabel={`${t('profile:locations.delete')} : ${label}`}
            onPress={() => setPendingDeletion(location)}
            variant="ghost"
          />
        </Card>
      );
    });
  };

  return (
    <Screen title={t('profile:locations.title')} scroll>
      {actionError ? <Text tone="danger">{actionError}</Text> : null}
      {renderList()}
      {adding ? (
        <LocationForm onClose={() => setAdding(false)} />
      ) : (
        <Button
          label={t('profile:locations.add')}
          onPress={() => setAdding(true)}
          variant="secondary"
        />
      )}
      <ConfirmDialog
        visible={pendingDeletion !== null}
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
