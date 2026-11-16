import type { AppEnv } from '@/core/config/env';

export const testEnv: AppEnv = {
  env: 'development',
  apiUrl: 'http://api.test',
  wsHost: 'api.test',
  wsPort: 6001,
  wsKey: 'reliance-key',
  statefulOrigin: 'http://mobile.reliance.local',
  webUrl: 'http://web.test',
};
