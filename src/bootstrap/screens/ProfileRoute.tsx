import type { Href } from 'expo-router';

import type { ProfileDestination } from '@/features/profile';

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
  feed: '/feed',
  professional: '/professional',
  skills: '/skills',
  zone: '/zone',
  kyc: '/kyc',
  upgrade: '/upgrade',
  disputes: '/disputes',
  reputation: '/reputation',
  setup: '/setup',
  settings: '/settings',
  terms: { pathname: '/legal/[kind]', params: { kind: 'cgu' } },
  privacy: { pathname: '/legal/[kind]', params: { kind: 'confidentialite' } },
};
