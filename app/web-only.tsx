import { WebOnlyScreen } from '@/bootstrap/screens/WebOnlyScreen';
import { appEnv } from '@/core/config';

export default function WebOnlyRoute() {
  return <WebOnlyScreen webUrl={appEnv.webUrl} />;
}
