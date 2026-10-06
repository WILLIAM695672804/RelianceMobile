import { router } from 'expo-router';

import { MissionTrackingScreen } from '@/features/missions';

export default function SuiviRoute() {
  return (
    <MissionTrackingScreen
      onOpenQuotes={(requestId) =>
        router.push({ pathname: '/quotes/[requestId]', params: { requestId } })
      }
      onContact={(userId) =>
        router.push({ pathname: '/conversations/new', params: { member: userId } })
      }
    />
  );
}
