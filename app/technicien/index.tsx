import { router } from 'expo-router';

import { TechHomeContainer } from '@/features/missions';

export default function TechHomeRoute() {
  return (
    <TechHomeContainer
      onNotifications={() => router.push('/notifications')}
      onOpenMission={() => router.push('/technicien/mission')}
      onPlanning={() => router.push('/planning')}
      onRadar={() => router.push('/technicien/radar')}
    />
  );
}
