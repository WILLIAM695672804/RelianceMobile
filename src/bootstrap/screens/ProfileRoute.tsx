import { router, type Href } from 'expo-router';

import { ProfileScreen, type ProfileDestination } from '@/features/profile';

/** Routes du groupe `app/(profil)` (le nom du groupe n'apparaît pas dans l'URL). */
export const PROFILE_HREF: Record<ProfileDestination, Href> = {
  edit: '/edit',
  password: '/password',
  locations: '/locations',
  planning: '/planning',
  appointments: '/appointments',
  invoices: '/invoices',
  wallet: '/wallet',
  reviews: '/my-reviews',
  notifications: '/notifications',
  messages: '/conversations',
  professional: '/professional',
  skills: '/skills',
  zone: '/zone',
  kyc: '/kyc',
  upgrade: '/upgrade',
  settings: '/settings',
};

/** Onglet « Compte » des trois rôles : E08 relié à la navigation. */
export function ProfileRoute() {
  return <ProfileScreen onOpen={(destination) => router.push(PROFILE_HREF[destination])} />;
}
