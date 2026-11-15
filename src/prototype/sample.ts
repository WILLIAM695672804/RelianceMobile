/**
 * Données d'exemple du prototype navigable, reprises des maquettes Clean Lavender
 * (`design/maquettes/`). Personnes et montants fictifs. Elles cèdent la place aux données du
 * serveur lors de la phase de reconnexion.
 */
import type { TechProfile, TechReview, TechWork } from '@/features/directory';
import type { ActiveIntervention, ServiceCategory } from '@/features/requests';
import type { TechSummary } from '@/shared/model';

export const CATEGORIES: readonly ServiceCategory[] = [
  { slug: 'plomberie', label: 'Plomberie', icon: 'wrench' },
  { slug: 'electricite', label: 'Électricité', icon: 'bolt' },
  { slug: 'securite', label: 'Sécurité', icon: 'video' },
  { slug: 'gps', label: 'GPS & suivi', icon: 'location', color: '#006c49' },
  { slug: 'informatique', label: 'Informatique', icon: 'laptop', color: '#4918c8' },
  { slug: 'maintenance', label: 'Maintenance', icon: 'cog', color: '#57556a' },
];

export const TECHS: readonly TechSummary[] = [
  {
    id: 't1',
    name: 'Paul Mvondo',
    skill: 'Plomberie',
    rating: 4.9,
    jobs: 312,
    distanceKm: 1.2,
    etaMin: 18,
    price: 8000,
    verified: true,
    mapPoint: { x: 65, y: 38 },
  },
  {
    id: 't2',
    name: 'Aïcha Nkoa',
    skill: 'Plomberie',
    rating: 4.8,
    jobs: 187,
    distanceKm: 2.4,
    etaMin: 25,
    price: 7500,
    verified: true,
    mapPoint: { x: 30, y: 55 },
  },
  {
    id: 't3',
    name: 'Jean-Claude Biya',
    skill: 'Plomberie',
    rating: 4.7,
    jobs: 95,
    distanceKm: 3.1,
    etaMin: 32,
    price: 6500,
    verified: false,
    mapPoint: { x: 78, y: 65 },
  },
  {
    id: 't4',
    name: 'Esther Atangana',
    skill: 'Plomberie',
    rating: 5,
    jobs: 421,
    distanceKm: 4,
    etaMin: 40,
    price: 9500,
    verified: true,
    color: '#006c49',
    mapPoint: { x: 22, y: 30 },
  },
  {
    id: 't5',
    name: 'Marc Eyenga',
    skill: 'Plomberie',
    rating: 4.6,
    jobs: 64,
    distanceKm: 4.8,
    etaMin: 45,
    price: 6000,
    verified: true,
    color: '#4918c8',
    mapPoint: { x: 50, y: 78 },
  },
];

export function techProfile(tech: TechSummary): TechProfile {
  return {
    ...tech,
    city: 'Yaoundé',
    bio: 'Plombier certifié avec 12 ans d’expérience. Spécialisé en réparation de fuites, installation de chauffe-eau et débouchage. Disponible 7 j/7 dans Yaoundé.',
    skills: ['Fuites', 'Chauffe-eau', 'Débouchage', 'Robinetterie', 'WC', 'Sanitaire'],
    successRate: '98 %',
    kycApproved: tech.verified,
    highlight: 'Top 10',
  };
}

export const WORKS: readonly TechWork[] = [1, 2, 3, 4].map((index) => ({
  id: `w${index}`,
  title: 'Chauffe-eau · Tsinga',
  likes: 34,
  comments: 8,
}));

export const REVIEWS: readonly TechReview[] = [
  {
    id: 'r1',
    author: 'Marie K.',
    rating: 5,
    text: 'Intervention rapide et propre. Paul a expliqué le problème en détail. Je recommande.',
    when: 'il y a 2 jours',
  },
  {
    id: 'r2',
    author: 'Joseph T.',
    rating: 5,
    text: 'Très bon professionnel. Réparation effectuée en 45 min, prix correct.',
    when: 'la semaine dernière',
  },
  {
    id: 'r3',
    author: 'Aïcha N.',
    rating: 4,
    text: 'Bon travail mais légère attente sur place.',
    when: 'il y a 2 semaines',
  },
];

export const ACTIVE: ActiveIntervention = {
  requestId: 'd1',
  technicianName: 'Paul Mvondo',
  title: 'Fuite cuisine',
  phase: 2,
  phaseCount: 4,
  phaseLabel: 'Diagnostic',
  statusLabel: 'En route · 8 min',
};

export const CLIENT = { firstName: 'Yves K.', fullName: 'Yves Kamga' };
