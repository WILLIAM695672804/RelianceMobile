/**
 * Données d'exemple des lots L5 à L7 (technicien, finances, communauté, agence), reprises des
 * maquettes. Personnes et montants fictifs.
 */
import type { PendingJob, TeamMember } from '@/features/agency';
import type { AgendaSlot, IncomingRequest } from '@/features/missions';
import type { AgendaEvent, AvailabilityValues } from '@/features/planning';
import type { AccountGroup, OnboardingValues } from '@/features/profile';
import type { BadgeSummary, LeaderEntry, RankStep } from '@/features/reviews';
import type { FeedComment, FeedPost } from '@/features/social';
import type {
  PaymentSource,
  TransactionDetail,
  WalletHold,
  WalletMovement,
} from '@/features/wallet';

export const INCOMING: readonly IncomingRequest[] = [
  {
    id: 'r1',
    client: 'Marie Kouam',
    category: 'Fuite WC',
    when: 'Maintenant',
    distanceKm: 1.4,
    etaMin: 12,
    price: 8000,
  },
  {
    id: 'r2',
    client: 'Joseph Tchakounté',
    category: 'Chauffe-eau',
    when: 'Aujourd’hui',
    distanceKm: 3.2,
    etaMin: 25,
    price: 15000,
  },
];

export const AGENDA: readonly AgendaSlot[] = [
  { id: 'a1', time: '09:00', title: 'Tsinga · Marie K.', detail: 'Robinet cuisine', state: 'done' },
  { id: 'a2', time: '11:30', title: 'Bastos · Joseph T.', detail: 'Chauffe-eau', state: 'done' },
  { id: 'a3', time: '14:30', title: 'Bastos · Yves K.', detail: 'Fuite siphon', state: 'active' },
  { id: 'a4', time: '17:00', title: 'Mvog-Ada · Aïcha N.', detail: 'Diagnostic', state: 'todo' },
];

export function accountGroups(role: 'client' | 'technicien' | 'agence'): AccountGroup[] {
  return [
    {
      title: 'Compte',
      items: [
        { key: 'identity', label: 'Informations personnelles', icon: 'user' },
        {
          key: 'security',
          label: 'Sécurité et double authentification',
          icon: 'shield',
          badge: 'À activer',
        },
        ...(role === 'technicien'
          ? [{ key: 'kyc', label: 'Vérification KYC', icon: 'check' as const, done: true }]
          : []),
        { key: 'addresses', label: 'Adresses et zones', icon: 'pin' },
      ],
    },
    {
      title: 'Activité',
      items:
        role === 'technicien'
          ? [
              { key: 'planning', label: 'Planning', icon: 'calendar' },
              { key: 'reputation', label: 'Réputation et badges', icon: 'badge' },
              { key: 'setup', label: 'Profil professionnel', icon: 'wrench' },
            ]
          : [
              { key: 'feed', label: 'Communauté', icon: 'sparkle' },
              { key: 'invoice', label: 'Factures', icon: 'file' },
            ],
    },
    {
      title: 'Préférences',
      items: [
        { key: 'notifications', label: 'Notifications', icon: 'bell' },
        { key: 'states', label: 'États vides et erreurs (démonstration)', icon: 'info' },
        { key: 'toasts', label: 'Toasts et bannières (démonstration)', icon: 'sparkle' },
      ],
    },
  ];
}

export const ONBOARDING: OnboardingValues = {
  name: 'Paul Mvondo',
  phone: '+237 6 99 12 34 56',
  city: 'Yaoundé',
  bio: 'Plombier certifié, 12 ans d’expérience. Spécialisé fuites et chauffe-eau.',
  skills: { plomberie: 'expert', electricite: 'confirmed' },
  diagnosticFee: '5000',
  hourlyRate: '8000',
  radiusKm: 15,
};

export const SKILL_OPTIONS = [
  { slug: 'plomberie', label: 'Plomberie' },
  { slug: 'electricite', label: 'Électricité' },
  { slug: 'climatisation', label: 'Climatisation' },
  { slug: 'menuiserie', label: 'Menuiserie' },
  { slug: 'videosurveillance', label: 'Vidéosurveillance' },
  { slug: 'informatique', label: 'Informatique' },
];

export const EVENTS: readonly AgendaEvent[] = [
  { id: 'e1', day: 0, start: 9, end: 11, title: 'Mme Owono', detail: 'Plomberie', kind: 'mission' },
  {
    id: 'e2',
    day: 0,
    start: 14,
    end: 15.5,
    title: 'M. Kamga',
    detail: 'Diagnostic',
    kind: 'mission',
  },
  { id: 'e3', day: 1, start: 8, end: 12, title: 'Formation', kind: 'block' },
  { id: 'e4', day: 2, start: 10, end: 12, title: 'Mme Tchatchouang', kind: 'mission', live: true },
  { id: 'e5', day: 2, start: 15, end: 17, title: 'M. Bidoung', kind: 'mission' },
  { id: 'e6', day: 3, start: 9, end: 18, title: 'Congé', kind: 'leave' },
  { id: 'e7', day: 4, start: 8, end: 10, title: 'M. Etoa', kind: 'pending' },
  { id: 'e8', day: 5, start: 10, end: 13, title: 'Urgences', kind: 'open' },
];

export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const AVAILABILITY: AvailabilityValues = {
  available: true,
  week: DAY_NAMES.map((_, day) => ({
    day,
    open: day < 6,
    start: day === 5 ? '09:00' : '08:00',
    end: day === 5 ? '13:00' : '18:00',
  })),
  maxPerDay: 4,
  urgent: true,
};

export const SOURCES: readonly PaymentSource[] = [
  { method: 'momo', label: 'MTN Mobile Money', detail: '+237 6 99 ** ** 56', isDefault: true },
  { method: 'om', label: 'Orange Money', detail: '+237 6 95 ** ** 12' },
  { method: 'card', label: 'Carte Visa', detail: 'Visa ···· 4823' },
];

export const HOLDS: readonly WalletHold[] = [
  {
    id: 'h1',
    label: 'Mission Paul Mvondo',
    detail: 'Libéré à la validation',
    amount: 12500,
    progress: 0.4,
  },
];

export const MOVEMENTS: readonly WalletMovement[] = [
  { id: 'x1', label: 'Recharge MoMo', when: '24 avr.', amount: 25000 },
  { id: 'x2', label: 'Paul Mvondo · Plomberie', when: '22 avr.', amount: -12500 },
  { id: 'x3', label: 'Bonus de parrainage', when: '20 avr.', amount: 2000 },
  { id: 'x4', label: 'Aïcha Nkoa · Diagnostic', when: '15 avr.', amount: -5000 },
];

export const TRANSACTION: TransactionDetail = {
  id: 'TX-2847-9372',
  type: 'Paiement d’intervention',
  amount: -28500,
  status: 'Réussie',
  rows: [
    { label: 'Date', value: '23 mars 2026 · 14:32' },
    { label: 'Bénéficiaire', value: 'Paul Mvondo', detail: 'Plombier', person: true },
    { label: 'Méthode', value: 'Portefeuille Reliance' },
    { label: 'Référence', value: 'INT-2847' },
    { label: 'Identifiant', value: 'TX-2847-9372' },
  ],
  breakdown: [
    { label: 'Diagnostic', amount: 5000 },
    { label: 'Main-d’œuvre (2 h 15)', amount: 18000 },
    { label: 'Pièces (joints, flexible)', amount: 4500 },
    { label: 'Commission Reliance (5 %)', amount: 1000, muted: true },
  ],
  note: 'Réparation de fuite sur chauffe-eau · 2 h 15',
};

export const POSTS: readonly FeedPost[] = [
  {
    id: 'p1',
    author: 'Paul Mvondo',
    role: 'Plombier · Bastos',
    verified: true,
    when: '2 h',
    title: 'Avant / après — fuite de chauffe-eau',
    body: 'Encore une intervention propre ce matin. Joint torique hors service, remplacement complet du flexible. 1 h 30 sur place.',
    media: ['avant', 'après'],
    likes: 47,
    comments: 8,
    liked: false,
  },
  {
    id: 'p2',
    author: 'Reliance',
    role: 'Officiel',
    verified: true,
    official: true,
    when: '5 h',
    title: '500 techniciens vérifiés à Yaoundé',
    body: 'Cette semaine, nous franchissons la barre des 500 professionnels vérifiés à Yaoundé. Merci à toute la communauté.',
    media: [],
    likes: 212,
    comments: 31,
    liked: false,
  },
  {
    id: 'p3',
    author: 'Yves Kamga',
    role: 'Électricien · Mvog-Ada',
    verified: true,
    when: '1 j',
    title: 'Astuce du jour',
    body: 'Si votre disjoncteur saute toujours après réarmement, ne forcez pas : il protège d’un court-circuit ou d’une surcharge.',
    media: [],
    likes: 89,
    comments: 12,
    liked: false,
  },
];

export const COMMENTS: readonly FeedComment[] = [
  {
    id: 'k1',
    author: 'Marie Atangana',
    text: 'Travail impeccable, merci pour le partage !',
    when: '1 h',
  },
  {
    id: 'k2',
    author: 'Aïcha Nkoa',
    text: 'Quel modèle de flexible utilisez-vous ?',
    when: '45 min',
  },
];

export const RANKS: readonly RankStep[] = [
  { name: 'Bronze', min: 0 },
  { name: 'Argent', min: 500 },
  { name: 'Or', min: 1500 },
  { name: 'Platine', min: 3500 },
  { name: 'Reliance', min: 7500 },
];

export const BADGES: readonly BadgeSummary[] = [
  {
    id: 'kyc',
    name: 'Vérifié KYC',
    icon: 'shield',
    rarity: 'common',
    description: 'Identité confirmée par Reliance',
    earned: true,
    progress: 1,
    earnedOn: '3 janv. 2026',
  },
  {
    id: 'first',
    name: 'Première mission',
    icon: 'sparkle',
    rarity: 'common',
    description: 'Première intervention réalisée',
    earned: true,
    progress: 1,
  },
  {
    id: 'speed',
    name: 'Éclair',
    icon: 'bolt',
    rarity: 'rare',
    description: 'Arrivée moyenne de moins de 25 min sur 20 missions',
    earned: true,
    progress: 1,
  },
  {
    id: 'clean',
    name: 'Sans tache',
    icon: 'check',
    rarity: 'epic',
    description: '50 missions sans litige',
    earned: true,
    progress: 1,
    earnedOn: '12 déc. 2025',
  },
  {
    id: 'century',
    name: 'Centurion',
    icon: 'star',
    rarity: 'epic',
    description: '100 missions réalisées',
    earned: false,
    progress: 0.67,
  },
  {
    id: 'allstar',
    name: 'All-Star',
    icon: 'sparkle',
    rarity: 'legendary',
    description: 'Top 10 de Yaoundé sur 30 jours',
    earned: false,
    progress: 0.3,
  },
];

export const LEADERS: readonly LeaderEntry[] = [
  { id: 'l1', name: 'Esther Atangana', skill: 'Plomberie', rating: 5, reviews: 132 },
  { id: 'l2', name: 'Paul Mvondo', skill: 'Plomberie', rating: 4.93, reviews: 58, isMe: true },
  { id: 'l3', name: 'Yves Kamga', skill: 'Électricité', rating: 4.9, reviews: 77 },
  { id: 'l4', name: 'Aïcha Nkoa', skill: 'Plomberie', rating: 4.8, reviews: 41 },
];

export const TEAM: readonly TeamMember[] = [
  {
    id: 'm1',
    name: 'Paul Mvondo',
    role: 'Plombier',
    online: true,
    jobs: 47,
    rating: 4.9,
    today: 3,
  },
  {
    id: 'm2',
    name: 'Yves Kamga',
    role: 'Électricien',
    online: true,
    jobs: 89,
    rating: 4.95,
    today: 4,
  },
  {
    id: 'm3',
    name: 'Aurélien Eyene',
    role: 'Électricien · Sécurité',
    online: true,
    jobs: 64,
    rating: 4.85,
    today: 2,
  },
  {
    id: 'm4',
    name: 'Marie-Claire Ngo',
    role: 'Informatique',
    online: false,
    jobs: 22,
    rating: 4.7,
    today: 0,
  },
  {
    id: 'm5',
    name: 'Junior Bidoung',
    role: 'Plombier (apprenti)',
    online: true,
    jobs: 8,
    rating: 4.6,
    today: 1,
    kycPending: true,
  },
];

export const JOBS: readonly PendingJob[] = [
  {
    id: 'j1',
    client: 'M. Tchatchouang',
    service: 'Fuite de chauffe-eau',
    zone: 'Bastos',
    when: 'Maintenant',
    urgent: true,
    estimate: 18000,
  },
  {
    id: 'j2',
    client: 'Mme Owono',
    service: 'Disjoncteur principal',
    zone: 'Mvog-Ada',
    when: '14 h 00',
    urgent: false,
    estimate: 25000,
  },
  {
    id: 'j3',
    client: 'M. Bidoung',
    service: 'Câblage de caméra',
    zone: 'Tsinga',
    when: 'Demain 9 h',
    urgent: false,
    estimate: 45000,
  },
];
