/**
 * Données d'exemple du prototype navigable, reprises des maquettes Clean Lavender
 * (`design/maquettes/`). Personnes et montants fictifs. Elles cèdent la place aux données du
 * serveur lors de la phase de reconnexion.
 */
import type { InvoiceDocument, QuoteDocument } from '@/features/billing';
import type { ChatItem, ConversationSummary } from '@/features/chat';
import type { DisputeReasonOption } from '@/features/disputes';
import type { TrackingPhase, WorkCheck } from '@/features/missions';
import type { DiagnosticReport, ActiveIntervention, ServiceCategory } from '@/features/requests';
import type { LineItem, TechSummary } from '@/shared/model';
import type { TechProfile, TechReview, TechWork } from '@/features/directory';

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

// ── Parcours d'intervention (lot L4) ─────────────────────────────────────────────

export const PHASES: readonly TrackingPhase[] = [
  { label: 'Acceptée', detail: 'Paul a accepté à 14 h 22', state: 'done' },
  { label: 'En route', detail: 'Arrivée prévue dans 8 min', state: 'active' },
  { label: 'Diagnostic', detail: 'Évaluation du problème', state: 'todo' },
  { label: 'Intervention', detail: 'Réparation', state: 'todo' },
  { label: 'Terminé', detail: 'Validation et paiement', state: 'todo' },
];

export const LINES: readonly LineItem[] = [
  { label: 'Joint torique 32 mm', detail: 'Pièce détachée', quantity: 1, unitPrice: 500 },
  { label: 'Main-d’œuvre (45 min)', detail: 'Forfait', quantity: 1, unitPrice: 6000 },
  { label: 'Déplacement', detail: 'Bastos < 5 km', quantity: 1, unitPrice: 1000 },
];

export const DIAGNOSTIC: DiagnosticReport = {
  reference: 'Mission #M-2847',
  phaseLabel: 'Phase 2/4',
  technician: { name: 'Paul Mvondo' },
  performedAt: 'Diagnostic réalisé · Bastos · 14 h 32',
  findings:
    'Fuite identifiée au niveau du joint du siphon. Joint vieilli, écrou desserré. Évier en bon état. Pas de dégât apparent au mobilier sous l’évier.',
  photos: ['siphon', 'joint', 'sous-évier'],
  recommendations: [
    'Remplacement du joint torique du siphon (réf. 32 mm)',
    'Resserrage de l’écrou et test d’étanchéité de 10 min',
    'Conseil : surveiller dans 6 mois',
  ],
  lines: LINES,
  diagnosticFee: 5000,
};

export const QUOTE: QuoteDocument = {
  reference: 'Devis #DV-2847',
  validUntil: '24 avril à 14 h 32',
  issuer: { name: 'Paul Mvondo', role: 'Plombier indépendant' },
  recipient: { name: 'Yves Kamga', place: 'Bastos · Yaoundé' },
  lines: LINES,
  feeRate: 0.05,
  conditions: [
    'Fonds bloqués en séquestre Reliance jusqu’à validation',
    'Garantie pièces et main-d’œuvre 30 jours',
    'Annulation libre plus de 2 h avant l’intervention',
    'Litige : médiation Reliance sous 48 h',
  ],
};

export const INVOICE: InvoiceDocument = {
  number: 'FAC-2026-0847',
  status: 'paid',
  issuedOn: '22 avril 2026',
  issuer: { name: 'Paul Mvondo', lines: ['Plombier indépendant', 'Bastos · Yaoundé'] },
  recipient: { name: 'Yves Kamga', lines: ['Particulier', 'Bastos · Yaoundé'] },
  lines: LINES.map(({ detail: _detail, ...line }) => line),
  feeRate: 0.05,
  footer: [
    'Paiement réglé via le séquestre Reliance · Réf. TX-2847-9482',
    'Reliance · Yaoundé, Cameroun',
  ],
};

export const CHECKS: readonly WorkCheck[] = [
  { key: 'done', label: 'Travaux conformes au devis', hint: 'Joint remplacé, écrou serré' },
  { key: 'clean', label: 'Espace propre et rangé', hint: 'Sous-évier nettoyé' },
  { key: 'working', label: 'Test d’étanchéité validé', hint: '10 min sans fuite' },
];

export const POSITIVE_TAGS = [
  'Ponctuel',
  'Travail soigné',
  'Bon prix',
  'Communication claire',
  'Courtois',
  'Je recommande',
];
export const NEGATIVE_TAGS = [
  'En retard',
  'Travail bâclé',
  'Trop cher',
  'Mauvaise communication',
  'Peu professionnel',
  'Outils manquants',
];

export const DISPUTE_REASONS: readonly DisputeReasonOption[] = [
  {
    key: 'work_not_done',
    icon: 'wrench',
    label: 'Travail non terminé',
    hint: 'Le problème persiste ou n’est pas résolu',
  },
  {
    key: 'quality',
    icon: 'info',
    label: 'Travail mal fait ou dégâts',
    hint: 'Malfaçon, casse ou détérioration pendant l’intervention',
  },
  {
    key: 'amount',
    icon: 'wallet',
    label: 'Facturation abusive',
    hint: 'Montant non conforme au devis',
  },
  {
    key: 'delay',
    icon: 'clock',
    label: 'Retard ou absence',
    hint: 'En retard ou absent au rendez-vous',
  },
  {
    key: 'behaviour',
    icon: 'user',
    label: 'Comportement inapproprié',
    hint: 'Attitude ou propos déplacés',
  },
  { key: 'other', icon: 'info', label: 'Autre motif', hint: 'Décrivez votre situation' },
];

export const CANCEL_REASONS = [
  { key: 'changemind', label: 'J’ai changé d’avis' },
  { key: 'found', label: 'J’ai trouvé une autre solution' },
  { key: 'tech', label: 'Le technicien ne convient pas' },
  { key: 'late', label: 'Le technicien est en retard' },
  { key: 'other', label: 'Autre raison' },
];

export const CHAT: readonly ChatItem[] = [
  { kind: 'day', id: 'j', label: 'Aujourd’hui · 14 h 22' },
  {
    kind: 'message',
    id: 'm1',
    mine: false,
    text: 'Bonjour Yves, j’ai bien reçu votre demande. Je suis en route, j’arrive dans 10 minutes.',
  },
  {
    kind: 'message',
    id: 'm2',
    mine: true,
    text: 'Parfait, merci ! L’eau est coupée, ça peut attendre.',
  },
  { kind: 'message', id: 'm3', mine: false, text: 'Pouvez-vous m’envoyer une photo du siphon ?' },
  {
    kind: 'message',
    id: 'm4',
    mine: false,
    text: 'C’est un siphon standard, j’ai la pièce. Ça devrait prendre 30 min sur place.',
  },
  { kind: 'quote', id: 'q1', title: 'Remplacement siphon cuisine', total: 7875, actionable: true },
];

export const CONVERSATIONS: readonly ConversationSummary[] = [
  {
    id: 'c1',
    name: 'Paul Mvondo',
    last: 'C’est un siphon standard, j’ai la pièce.',
    time: '14:24',
    unread: 2,
    online: true,
    archived: false,
  },
  {
    id: 'c2',
    name: 'Aïcha Nkoa',
    last: 'Devis accepté',
    time: '12:08',
    unread: 0,
    online: false,
    archived: false,
  },
  {
    id: 'c3',
    name: 'Reliance · Support',
    color: '#2b2a36',
    last: 'Votre vérification KYC est validée',
    time: 'Hier',
    unread: 0,
    online: false,
    archived: false,
  },
  {
    id: 'c4',
    name: 'Esther Atangana',
    color: '#006c49',
    last: 'Merci pour la mission, à bientôt !',
    time: 'Hier',
    unread: 0,
    online: false,
    archived: true,
  },
  {
    id: 'c5',
    name: 'Marc Eyenga',
    color: '#4918c8',
    last: 'Photo reçue, j’examine ça',
    time: '22 avr.',
    unread: 0,
    online: false,
    archived: false,
  },
];
