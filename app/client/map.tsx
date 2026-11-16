import { router } from 'expo-router';

import { MapContainer } from '@/bootstrap/containers/MapContainer';

export default function ClientMapRoute() {
  return (
    <MapContainer
      onSearch={() => router.push('/search')}
      onViewProfile={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
