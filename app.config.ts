import type { ConfigContext, ExpoConfig } from 'expo/config';

const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Reliance',
  slug: 'reliance-mobile',
  version: '0.1.0',
  scheme: 'reliance',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    ...config.ios,
    bundleIdentifier: 'cm.reliance.mobile',
    supportsTablet: false,
    // HTTP en clair toléré hors production uniquement (backend local).
    infoPlist: isProduction ? {} : { NSAppTransportSecurity: { NSAllowsArbitraryLoads: true } },
  },
  android: {
    ...config.android,
    package: 'cm.reliance.mobile',
  },
  experiments: { typedRoutes: true },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-font',
    'expo-status-bar',
    ['expo-build-properties', { android: { usesCleartextTraffic: !isProduction } }],
  ],
});
