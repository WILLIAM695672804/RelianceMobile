/** Demande au format de l'API, sans donnée personnelle réelle. */
export function buildServiceRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    title: 'Fuite sous l’évier',
    description: 'De l’eau coule sous l’évier de la cuisine depuis ce matin.',
    status: 'new',
    category: { id: 'c1', name: 'Réparation de fuite', slug: 'reparation-fuite' },
    address: { id: 'a1', city: 'Douala', address: 'Rue de la démonstration' },
    photos: ['requests/photos/a.png'],
    diagnostic_fee: null,
    analysis: {
      estimated_difficulty: 'moderate',
      suggested_price: '15000.00',
      estimated_skills: ['reparation-fuite'],
    },
    proposals_count: 0,
    counterpart: null,
    created_at: '2026-09-16T12:00:00+00:00',
    updated_at: '2026-09-16T12:00:00+00:00',
    ...overrides,
  };
}

/** Page Laravel de demandes. */
export function buildRequestPage(requests: unknown[]) {
  return {
    data: requests,
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, last_page: 1, per_page: 15, total: requests.length },
  };
}
