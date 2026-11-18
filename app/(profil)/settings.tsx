import { router } from 'expo-router';

import { languagePreference } from '@/bootstrap/instance';
import { SettingsScreen } from '@/features/profile';

export default function SettingsRoute() {
  return <SettingsScreen onLanguageChange={languagePreference.save} onBack={() => router.back()} />;
}
