import { router } from 'expo-router';

import { BlockAgendaContainer } from '@/features/planning';

export default function ExceptionsRoute() {
  return <BlockAgendaContainer onDone={() => router.back()} />;
}
