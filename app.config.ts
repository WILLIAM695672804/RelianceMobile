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
    [
      'expo-image-picker',
      {
        photosPermission:
          'Reliance accède à vos photos pour votre avatar et vos justificatifs d’identité.',
        cameraPermission:
          'Reliance utilise l’appareil photo pour photographier vos justificatifs d’identité.',
        microphonePermission: false,
      },
    ],
    ['expo-build-properties', { android: { usesCleartextTraffic: !isProduction } }],
  ],
});
