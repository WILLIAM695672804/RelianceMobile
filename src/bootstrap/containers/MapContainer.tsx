import { useTranslation } from 'react-i18next';

import { MapView, useTechnicianDirectory } from '@/features/directory';
import { QueryGate } from '@/shared/ui';

import { withMapPoints } from './techSummary';

export interface MapContainerProps {
  onSearch: () => void;
  onViewProfile: (technicianId: string) => void;
}

/** Onglet « Carte » du client : techniciens de l'annuaire sur la carte illustrée. */
export function MapContainer({ onSearch, onViewProfile }: MapContainerProps) {
  const { t } = useTranslation();
  const directory = useTechnicianDirectory({});
  return (
    <QueryGate queries={[directory]} withTabBar>
      {() => (
        <MapView
          withTabBar
          technicians={withMapPoints(directory.data?.technicians ?? [])}
          searchLabel={t('directory:map.search')}
          onSearch={onSearch}
          onViewProfile={(tech) => onViewProfile(tech.id)}
        />
      )}
    </QueryGate>
  );
}
