# Plan 14 — Achèvement de la transposition des maquettes et des jointures

> **Pour les agents exécutants :** sous-compétence requise — `superpowers:executing-plans`.
> Les étapes emploient la syntaxe à cases (`- [ ]`).

**But :** transposer les maquettes restées sans correspondance et relier les écrans selon le
graphe de navigation des maquettes (`design/maquettes/app.jsx`), afin que chaque parcours soit
parcourable de bout en bout sur l'appareil.

**Architecture :** deux tranches de fonctionnalité nouvelles (`interventions`, `disputes`), des
écrans ajoutés aux tranches existantes (`wallet`, `missions`, `reviews`, `directory`, `auth`,
`profile`), un composant partagé `Snackbar`, et une couche de routes `app/` + `src/bootstrap/screens`
qui matérialise les jointures. Aucun écran n'écrit de dimension en dur : le socle adaptatif du
plan 13 reste la seule source des gouttières, colonnes et échelles.

**Pile technique :** Expo SDK 57, expo-router 57, TanStack Query 5, Zod 4, react-hook-form,
i18next, jest-expo + RNTL 14, axios-mock-adapter.

---

## Contexte : le graphe des maquettes

`design/maquettes/app.jsx` définit les arêtes attendues. Celles qui manquent dans l'application :

| Arête de la maquette                                            | État avant ce plan                                     |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| `onboarding → role-select → login`                              | aucun fil d'accueil                                    |
| `client-home → search`                                          | mène directement à l'annuaire, sans écran de recherche |
| `intervention → diagnostic-report` (client)                     | aucun rapport                                          |
| `tech-home → diagnostic-report-tech`                            | aucun rapport                                          |
| `intervention → validation → escrow-release → rating → invoice` | aucun contrôle qualité, aucun séquestre                |
| `intervention → dispute`                                        | aucun litige                                           |
| `intervention → cancel`                                         | aucune annulation                                      |
| `wallet → tx-detail`                                            | aucun détail de transaction                            |
| `wallet-topup → wallet-otp`                                     | aucune confirmation de paiement                        |
| `profile → reputation → badge-detail`                           | aucun écran de réputation                              |
| `reputation → leaderboard`                                      | aucun classement                                       |
| `kyc-pending → tech-onboarding`                                 | les cinq étapes existent, dispersées, sans parcours    |
| `toasts`                                                        | aucun bandeau éphémère                                 |

Deux arêtes restent hors d'atteinte, et le plan les documente au lieu de les feindre :
`client-home → map` (aucune bibliothèque de cartographie, et une clé Google Maps est requise) et
`agency-dashboard → assign-job` (seul `POST /admin/requests/{id}/assign`, réservé à
l'administration, existe côté serveur).

## Décisions de transposition

| Maquette                  | Point d'API réel                                               | Décision                                                                                                                    |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `DiagnosticReportScreen`  | `GET/POST /interventions`, `POST /interventions/{id}/complete` | deux modes : rédaction par le technicien, lecture par le client                                                             |
| `ValidationScreen`        | `GET /holds`, `POST /holds/{id}/capture`                       | « contrôle qualité » : rapport + photos, puis libération du séquestre                                                       |
| `EscrowReleaseScreen`     | retour de `capture`                                            | état de réussite du contrôle qualité, menant à l'avis                                                                       |
| `CancelScreen`            | `PATCH /jobs/{id}/status` (technicien seul)                    | annulation côté technicien ; l'annulation par le client exige un point d'API absent                                         |
| `WalletOTPScreen`         | `GET /payments/{id}`, `POST /payments/{id}/confirm`            | confirmation du paiement en attente ; le code de l'opérateur n'est pas vérifié par l'API, aucun champ de saisie ne le feint |
| `LeaderboardScreen`       | `GET /technicians`                                             | classement par note et nombre d'avis ; aucun point d'API ne renvoie un palmarès de réputation                               |
| `TransactionDetailScreen` | `GET /wallet/transactions`                                     | détail lu dans la liste déjà en cache, aucun point d'API unitaire n'existant                                                |
| `SearchScreen`            | `GET /technicians`                                             | recherche avec historique local (MMKV), résultats dans l'annuaire                                                           |
| `TechOnboardingScreen`    | écrans existants                                               | parcours d'installation : liste des cinq étapes et de leur état, sans assistant imposé                                      |
| `ToastsScreen`            | —                                                              | composant `Snackbar`, employé par les parcours ajoutés                                                                      |

## Structure des fichiers

**Tranche `interventions`** (nouvelle)

- `src/features/interventions/schemas/interventionSchemas.ts` — `intervention`, formulaire de rapport.
- `src/features/interventions/api/interventionsApi.ts` — quatre appels.
- `src/features/interventions/hooks/interventionsKeys.ts`, `useInterventions.ts`.
- `src/features/interventions/screens/InterventionReportScreen.tsx` — deux modes.
- `src/features/interventions/i18n.ts`, `index.ts`, `README.md`.

**Tranche `disputes`** (nouvelle)

- `src/features/disputes/schemas/disputeSchemas.ts`, `api/disputesApi.ts`,
  `hooks/disputesKeys.ts`, `hooks/useDisputes.ts`.
- `src/features/disputes/screens/DisputesScreen.tsx`, `DisputeFormScreen.tsx`,
  `DisputeThreadScreen.tsx`.
- `src/features/disputes/i18n.ts`, `index.ts`, `README.md`.

**Tranches existantes**

- `src/shared/components/Snackbar.tsx` (+ export dans `index.ts`).
- `src/features/auth/screens/OnboardingScreen.tsx` + `model/onboardingSeen.ts`.
- `src/features/wallet/schemas/holdSchemas.ts`, `api/holdsApi.ts`, `hooks/useHolds.ts`,
  `screens/TransactionDetailScreen.tsx`, `screens/PaymentConfirmationScreen.tsx`.
- `src/features/missions/screens/QualityControlScreen.tsx`, `screens/CancelMissionScreen.tsx`.
- `src/features/reviews/screens/ReputationScreen.tsx`, `screens/BadgeDetailScreen.tsx`,
  `model/reputationTiers.ts`.
- `src/features/directory/screens/LeaderboardScreen.tsx`, `screens/SearchScreen.tsx`,
  `model/searchHistory.ts`.
- `src/features/profile/screens/TechnicianSetupScreen.tsx`.

**Routes**

- `app/(auth)/onboarding.tsx`, `app/(annuaire)/search.tsx`, `app/(annuaire)/leaderboard.tsx`,
  `app/(missions)/interventions/[id].tsx`, `app/(missions)/quality/[requestId].tsx`,
  `app/(missions)/cancel/[jobId].tsx`, `app/(litiges)/_layout.tsx`,
  `app/(litiges)/disputes/index.tsx`, `app/(litiges)/disputes/new.tsx`,
  `app/(litiges)/disputes/[id].tsx`, `app/(portefeuille)/wallet/transactions/[id].tsx`,
  `app/(portefeuille)/wallet/payments/[id].tsx`, `app/(avis)/reputation.tsx`,
  `app/(avis)/badges/[code].tsx`, `app/(profil)/setup.tsx`.
- Enveloppes correspondantes dans `src/bootstrap/screens/`.

**Fixtures**

- `scripts/capture-governance-fixtures.sh` — litiges, séquestre, interventions, badges, paiement.
- `src/test/fixtures/{disputes,interventions,wallet,reviews}/*.json`.

---

## Task 1 : fixtures des nouveaux points d'API

**Files:**

- Create: `scripts/capture-governance-fixtures.sh`
- Create: `src/test/fixtures/disputes/{disputes,dispute,dispute-created,dispute-message}.json`
- Create: `src/test/fixtures/interventions/{interventions,intervention,intervention-completed}.json`
- Create: `src/test/fixtures/wallet/{holds,hold-created,hold-captured,payment,payment-confirmed}.json`
- Create: `src/test/fixtures/reviews/{badges,user-badges-rich}.json`
- Modify: `scripts/anonymize-fixtures.py` (nouveaux dossiers)

- [ ] **Step 1 : écrire le script de capture**

Le script suit `scripts/capture-finance-fixtures.sh` : session Sanctum par cookies, `call`
vérifiant le code HTTP attendu, sortie dans `src/test/fixtures`. Séquence :

1. Client : `POST /auth/login`, `GET /requests` → retenir une demande clôturée et son technicien.
2. Client : `POST /disputes` (201), `GET /disputes` (200), `POST /disputes/{id}/message` (200),
   `GET /disputes/{id}` (200).
3. Client : `POST /wallet/recharge` avec `method=bank_transfer` (200, aucune passerelle externe),
   `POST /payments/{id}/confirm` (200), `GET /payments/{id}` (200), `GET /wallet/transactions` (200).
4. Client : `POST /holds` (200), `GET /holds` (200), `POST /holds/{id}/capture` (200).
5. Technicien : `POST /interventions` (201), `POST /interventions/{id}/start` (200),
   `POST /interventions/{id}/complete` (200), `GET /interventions` (200), `GET /interventions/{id}` (200).
6. Badges : trois badges et deux attributions insérés par `php artisan tinker --execute`, puis
   `GET /badges` (200) et `GET /badges/user/{id}` (200).

- [ ] **Step 2 : exécuter le script**

Run: `cd RelianceMobile && ./scripts/capture-governance-fixtures.sh`
Expected: une ligne `capturé : …` par appel, puis `fixtures écrites`.

- [ ] **Step 3 : anonymiser**

Run: `python3 -I scripts/anonymize-fixtures.py`
Expected: aucune adresse électronique réelle, aucun jeton, aucun numéro de téléphone réel.
Vérifier : `grep -rniE "[a-z0-9._%+-]+@(gmail|yahoo|hotmail|reliance)\.[a-z]{2,}" src/test/fixtures | grep -v example.test` ne renvoie rien.

- [ ] **Step 4 : commit**

```bash
git add scripts src/test/fixtures
git commit -m "test(fixtures): capture les litiges, le séquestre et les interventions"
```

---

## Task 2 : composant `Snackbar`

**Files:**

- Create: `src/shared/components/Snackbar.tsx`
- Test: `src/shared/components/Snackbar.test.tsx`
- Modify: `src/shared/components/index.ts`

- [ ] **Step 1 : écrire le test qui échoue**

```tsx
import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  it('affiche le message et son icône de ton', async () => {
    await renderWithProviders(<Snackbar message="Paiement libéré" tone="success" />);

    expect(screen.getByText('Paiement libéré')).toBeOnTheScreen();
    expect(screen.getByTestId('snackbar-icon')).toBeOnTheScreen();
  });

  it('déclenche son action', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Snackbar message="Litige ouvert" tone="info" actionLabel="Voir" onAction={onPress} />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Voir' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('expose le rôle d’alerte pour les lecteurs d’écran', async () => {
    await renderWithProviders(<Snackbar message="Échec du paiement" tone="danger" />);

    expect(screen.getByRole('alert')).toBeOnTheScreen();
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/shared/components/Snackbar.test.tsx`
Expected: FAIL — `Cannot find module './Snackbar'`.

- [ ] **Step 3 : implémenter**

```tsx
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type SnackbarTone = 'info' | 'success' | 'danger';

/** Les maquettes (`ToastsScreen`) n'emploient que ces trois tons. */
const ICONS: Record<SnackbarTone, IconName> = {
  info: 'info',
  success: 'check',
  danger: 'close',
};

export interface SnackbarProps {
  message: string;
  tone?: SnackbarTone;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/** Bandeau éphémère : transposition du catalogue `ToastsScreen` des maquettes. */
export function Snackbar({
  message,
  tone = 'info',
  actionLabel,
  onAction,
  testID = 'snackbar',
}: SnackbarProps) {
  const theme = useTheme();
  const palette = {
    info: theme.colors.primary,
    success: theme.colors.success,
    danger: theme.colors.danger,
  }[tone];

  return (
    <View
      accessibilityRole="alert"
      testID={testID}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: palette,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Icon name={ICONS[tone]} size={18} color={palette} testID={`${testID}-icon`} />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction}>
          <Text variant="label" tone="primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  message: { flex: 1 },
});
```

`src/shared/components` n'expose pas de `Pressable` : employer celui de `react-native` avec
`android_ripple={{ color: theme.colors.border }}` et `hitSlop={8}`. Le relief de la maquette
(`boxShadow`) est rendu par `theme.elevation.medium`, l'ombre CSS n'existant pas en natif.

- [ ] **Step 4 : vérifier le succès**

Run: `npm test -- src/shared/components/Snackbar.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5 : commit**

```bash
git add src/shared/components
git commit -m "feat(ui): ajoute le bandeau éphémère des maquettes"
```

---

## Task 3 : fil d'accueil (`OnboardingScreen`)

**Files:**

- Create: `src/features/auth/model/onboardingSeen.ts`
- Create: `src/features/auth/screens/OnboardingScreen.tsx`
- Create: `app/(auth)/onboarding.tsx`
- Create: `src/bootstrap/screens/OnboardingRoute.tsx`
- Test: `src/features/auth/screens/OnboardingScreen.test.tsx`, `src/features/auth/model/onboardingSeen.test.ts`
- Modify: `src/features/auth/i18n.ts`, `src/features/auth/index.ts`, `src/bootstrap/screens/LaunchScreen.tsx`

Les trois diapositives reprennent `ONBOARDING_SLIDES` de `design/maquettes/screens-auth.jsx` :
« Trouvez le bon technicien », « Suivez l'intervention », « Payez en toute sécurité ».

- [ ] **Step 1 : écrire le test du drapeau de persistance**

```ts
import { createMemoryStore } from '@/core/storage';

import { createOnboardingFlag } from './onboardingSeen';

describe('createOnboardingFlag', () => {
  it('est faux avant toute visite', () => {
    const flag = createOnboardingFlag(createMemoryStore());
    expect(flag.seen()).toBe(false);
  });

  it('retient la visite', () => {
    const store = createMemoryStore();
    createOnboardingFlag(store).markSeen();
    expect(createOnboardingFlag(store).seen()).toBe(true);
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/auth/model/onboardingSeen.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter le drapeau**

```ts
import type { KeyValueStore } from '@/core/storage';

const KEY = 'auth.onboarding.seen';

export interface OnboardingFlag {
  seen: () => boolean;
  markSeen: () => void;
}

/** Retient que le fil d'accueil a été parcouru ; conservé à la déconnexion. */
export function createOnboardingFlag(store: KeyValueStore): OnboardingFlag {
  return {
    seen: () => store.getString(KEY) === '1',
    markSeen: () => store.set(KEY, '1'),
  };
}
```

- [ ] **Step 4 : écrire le test de l'écran**

```tsx
import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { authTranslations } from '../i18n';
import { OnboardingScreen } from './OnboardingScreen';

describe('OnboardingScreen', () => {
  it('avance d’une diapositive à l’autre puis termine', async () => {
    const onDone = jest.fn();
    await renderWithProviders(<OnboardingScreen onDone={onDone} />, {
      translations: [authTranslations],
    });
    const user = userEvent.setup();

    expect(screen.getByText('Trouvez le bon technicien')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Suivez l’intervention en direct')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Suivant' }));
    await user.press(screen.getByRole('button', { name: 'Commencer' }));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('permet de passer le fil', async () => {
    const onDone = jest.fn();
    await renderWithProviders(<OnboardingScreen onDone={onDone} />, {
      translations: [authTranslations],
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Passer' }));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('annonce l’avancement', async () => {
    await renderWithProviders(<OnboardingScreen onDone={jest.fn()} />, {
      translations: [authTranslations],
    });

    expect(screen.getByTestId('onboarding-steps')).toBeOnTheScreen();
  });
});
```

- [ ] **Step 5 : vérifier l'échec**

Run: `npm test -- src/features/auth/screens/OnboardingScreen.test.tsx`
Expected: FAIL — module introuvable.

- [ ] **Step 6 : implémenter l'écran**

Structure : `Screen` sans barre, `Icon` de la diapositive en `IconTile` agrandi, titre
`variant="title"`, texte `tone="muted"`, `StepIndicator` (`testID="onboarding-steps"`), puis
`Button` plein `lg` (« Suivant » / « Commencer ») et `Button variant="ghost"` « Passer ».
Les clés i18n sont `auth:onboarding.slides.{0,1,2}.{title,body}`, `auth:onboarding.next`,
`auth:onboarding.start`, `auth:onboarding.skip`.

- [ ] **Step 7 : brancher la route**

`app/(auth)/onboarding.tsx` délègue à `OnboardingRoute`, qui marque le drapeau puis
`router.replace('/login')`. `LaunchScreen` redirige vers `/onboarding` quand le drapeau est faux
et qu'aucune session n'est restaurée.

- [ ] **Step 8 : vérifier**

Run: `npm test -- src/features/auth src/bootstrap`
Expected: PASS.

- [ ] **Step 9 : commit**

```bash
git add src/features/auth src/bootstrap app
git commit -m "feat(auth): transpose le fil d'accueil des maquettes"
```

---

## Task 4 : tranche `interventions` (schémas, API, hooks)

**Files:**

- Create: `src/features/interventions/schemas/interventionSchemas.ts`
- Create: `src/features/interventions/api/interventionsApi.ts`
- Create: `src/features/interventions/hooks/interventionsKeys.ts`, `hooks/useInterventions.ts`
- Create: `src/features/interventions/i18n.ts`, `index.ts`, `README.md`
- Test: `schemas/interventionSchemas.test.ts`, `api/interventionsApi.test.ts`, `hooks/interventionsHooks.test.tsx`

- [ ] **Step 1 : écrire le test des schémas**

```ts
import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';

import {
  interventionListResponseSchema,
  interventionResponseSchema,
  reportFormSchema,
} from './interventionSchemas';

describe('interventionSchemas', () => {
  it('lit le détail capturé', () => {
    expect(interventionResponseSchema.parse(intervention).data.status).toBe('completed');
  });

  it('lit la liste paginée capturée', () => {
    expect(interventionListResponseSchema.parse(interventions).data.data).not.toHaveLength(0);
  });

  it('exige le travail effectué', () => {
    const result = reportFormSchema.safeParse({ workPerformed: '  ', materials: '', hours: '' });
    expect(result.success).toBe(false);
  });

  it('accepte des heures décimales et une liste de matériels', () => {
    const result = reportFormSchema.parse({
      workPerformed: 'Remplacement du disjoncteur',
      materials: 'Disjoncteur 16 A\nGaine',
      hours: '1.5',
      notes: '',
    });
    expect(result.hours).toBe('1.5');
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/interventions/schemas`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter les schémas**

```ts
import { z } from 'zod';

export const INTERVENTION_STATUSES = ['planned', 'in_progress', 'completed'] as const;
export type InterventionStatus = (typeof INTERVENTION_STATUSES)[number];

export const interventionSchema = z.object({
  id: z.string(),
  job_id: z.string().nullish(),
  request_id: z.string().nullish(),
  technician_id: z.string().nullish(),
  type: z.string().nullish(),
  status: z.enum(INTERVENTION_STATUSES).catch('planned'),
  description: z.string().nullish(),
  work_performed: z.string().nullish(),
  materials_used: z.array(z.string()).nullish(),
  duration_hours: z.coerce.number().nullish(),
  notes: z.string().nullish(),
  scheduled_at: z.string().nullish(),
  started_at: z.string().nullish(),
  completed_at: z.string().nullish(),
  request: z.object({ id: z.string(), title: z.string().nullish() }).nullish(),
  technician: z.object({ id: z.string(), name: z.string() }).nullish(),
});
export type Intervention = z.infer<typeof interventionSchema>;

export const interventionResponseSchema = z.object({ data: interventionSchema });

export const interventionListResponseSchema = z.object({
  data: z.object({
    data: z.array(interventionSchema),
    current_page: z.number().nullish(),
    last_page: z.number().nullish(),
    total: z.number().nullish(),
  }),
});

export const WORK_MAX_LENGTH = 4000;

/** Formulaire du rapport : le travail effectué est obligatoire côté serveur. */
export const reportFormSchema = z.object({
  workPerformed: z
    .string()
    .trim()
    .min(1, 'interventions:report.errors.workRequired')
    .max(WORK_MAX_LENGTH, 'interventions:report.errors.workTooLong'),
  materials: z.string().max(WORK_MAX_LENGTH, 'interventions:report.errors.materialsTooLong'),
  hours: z
    .string()
    .trim()
    .refine((value) => value === '' || Number.isFinite(Number(value)), {
      message: 'interventions:report.errors.hoursInvalid',
    })
    .refine((value) => value === '' || Number(value) >= 0, {
      message: 'interventions:report.errors.hoursInvalid',
    }),
  notes: z.string().max(WORK_MAX_LENGTH, 'interventions:report.errors.notesTooLong'),
});
export type ReportFormValues = z.infer<typeof reportFormSchema>;

export interface ReportPayload {
  workPerformed: string;
  materials: string[];
  hours: number | null;
  notes: string | null;
}

/** Une ligne de matériel par ligne saisie ; les lignes vides sont écartées. */
export function toReportPayload(values: ReportFormValues): ReportPayload {
  return {
    workPerformed: values.workPerformed.trim(),
    materials: values.materials
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
    hours: values.hours.trim() === '' ? null : Number(values.hours),
    notes: values.notes.trim() || null,
  };
}
```

- [ ] **Step 4 : écrire le test de l'API**

```ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import completed from '@/test/fixtures/interventions/intervention-completed.json';
import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';

import { completeIntervention, fetchIntervention, fetchInterventions } from './interventionsApi';

function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('interventionsApi', () => {
  it('liste les interventions', async () => {
    const { api, mock } = setup();
    mock.onGet('/interventions').reply(200, interventions);

    await expect(fetchInterventions(api)).resolves.toHaveLength(interventions.data.data.length);
  });

  it('lit une intervention', async () => {
    const { api, mock } = setup();
    mock.onGet(`/interventions/${intervention.data.id}`).reply(200, intervention);

    await expect(fetchIntervention(api, intervention.data.id)).resolves.toMatchObject({
      id: intervention.data.id,
    });
  });

  it('envoie le rapport sous la forme attendue par le serveur', async () => {
    const { api, mock } = setup();
    mock.onPost(`/interventions/${intervention.data.id}/complete`).reply(200, completed);

    await completeIntervention(api, intervention.data.id, {
      workPerformed: 'Remplacement du disjoncteur',
      materials: ['Disjoncteur 16 A'],
      hours: 1.5,
      notes: null,
    });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      work_performed: 'Remplacement du disjoncteur',
      materials_used: ['Disjoncteur 16 A'],
      duration_hours: 1.5,
    });
  });
});
```

- [ ] **Step 5 : vérifier l'échec**

Run: `npm test -- src/features/interventions/api`
Expected: FAIL — module introuvable.

- [ ] **Step 6 : implémenter l'API**

```ts
import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  interventionListResponseSchema,
  interventionResponseSchema,
  type Intervention,
  type ReportPayload,
} from '../schemas/interventionSchemas';

const segment = encodeURIComponent;

/** `GET /interventions` : filtrée au technicien connecté par le serveur. */
export async function fetchInterventions(client: AxiosInstance): Promise<Intervention[]> {
  const { data } = await client.get('/interventions');
  return parseResponse(interventionListResponseSchema, data).data.data;
}

/** `GET /interventions/{id}`. */
export async function fetchIntervention(client: AxiosInstance, id: string): Promise<Intervention> {
  const { data } = await client.get(`/interventions/${segment(id)}`);
  return parseResponse(interventionResponseSchema, data).data;
}

/** `POST /interventions/{id}/complete` : les champs nuls ne sont pas envoyés. */
export async function completeIntervention(
  client: AxiosInstance,
  id: string,
  payload: ReportPayload,
): Promise<Intervention> {
  const body: Record<string, unknown> = { work_performed: payload.workPerformed };
  if (payload.materials.length > 0) body.materials_used = payload.materials;
  if (payload.hours !== null) body.duration_hours = payload.hours;
  if (payload.notes !== null) body.notes = payload.notes;
  const { data } = await client.post(`/interventions/${segment(id)}/complete`, body);
  return parseResponse(interventionResponseSchema, data).data;
}

/** `POST /interventions/{id}/start`. */
export async function startIntervention(client: AxiosInstance, id: string): Promise<Intervention> {
  const { data } = await client.post(`/interventions/${segment(id)}/start`, {});
  return parseResponse(interventionResponseSchema, data).data;
}
```

- [ ] **Step 7 : implémenter les clés et les hooks**

```ts
/** Clés de cache de la feature `interventions`. */
export const interventionsKeys = {
  all: ['interventions'] as const,
  list: () => [...interventionsKeys.all, 'list'] as const,
  detail: (id: string) => [...interventionsKeys.all, 'detail', id] as const,
};
```

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';

import {
  completeIntervention,
  fetchIntervention,
  fetchInterventions,
  startIntervention,
} from '../api/interventionsApi';
import type { ReportPayload } from '../schemas/interventionSchemas';
import { interventionsKeys } from './interventionsKeys';

export function useInterventions() {
  const api = useApiClient();
  return useQuery({ queryKey: interventionsKeys.list(), queryFn: () => fetchInterventions(api) });
}

export function useIntervention(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: interventionsKeys.detail(id),
    queryFn: () => fetchIntervention(api, id),
  });
}

export function useCompleteIntervention(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReportPayload) => completeIntervention(api, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: interventionsKeys.all }),
  });
}

export function useStartIntervention(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startIntervention(api, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: interventionsKeys.all }),
  });
}
```

- [ ] **Step 8 : écrire le test des hooks**

Suivre `src/features/reviews/hooks/reviewsHooks.test.tsx` : `renderHook` enveloppé par les
fournisseurs de `@/test/render`, un cas par hook, vérification de l'invalidation après mutation.

- [ ] **Step 9 : vérifier**

Run: `npm test -- src/features/interventions`
Expected: PASS.

- [ ] **Step 10 : commit**

```bash
git add src/features/interventions
git commit -m "feat(interventions): modélise le rapport d'intervention du serveur"
```

---

## Task 5 : rapport d'intervention (`DiagnosticReportScreen`)

**Files:**

- Create: `src/features/interventions/screens/InterventionReportScreen.tsx`
- Create: `app/(missions)/interventions/[id].tsx`, `src/bootstrap/screens/InterventionReportRoute.tsx`
- Test: `src/features/interventions/screens/InterventionReportScreen.test.tsx`
- Modify: `src/features/interventions/index.ts`, `i18n.ts`, `src/bootstrap/instance.ts`,
  `src/bootstrap/screens/MissionRoute.tsx`, `src/features/missions/screens/MissionCockpitScreen.tsx`,
  `src/features/missions/screens/MissionTrackingScreen.tsx`, `app/(missions)/_layout.tsx`

- [ ] **Step 1 : écrire le test**

Trois cas : mode lecture (le client voit travail effectué, matériels, durée, notes) ; mode
rédaction (le technicien soumet et `POST /interventions/{id}/complete` reçoit le corps attendu) ;
refus du formulaire vide (message `interventions:report.errors.workRequired` traduit, aucun appel).

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/interventions/screens`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter l'écran**

`InterventionReportScreenProps` : `{ interventionId: string; mode: 'read' | 'edit'; onDone: () => void }`.
En lecture : `Screen title={t('interventions:report.title')}`, `Card` par rubrique
(`SectionHeader` + `ListItem`), `Badge` d'état. En rédaction : `TextField` multiligne
« Travail effectué », `TextField` multiligne « Matériels employés (une ligne par pièce) »,
`TextField` « Durée (heures) » en clavier numérique, `TextField` « Notes », `Button lg fullWidth`
« Clôturer l'intervention », `Snackbar` de réussite puis `onDone()`.

- [ ] **Step 4 : brancher les jointures**

- `MissionCockpitScreen` : `onOpenReport?: (interventionId: string) => void` → bouton
  « Rédiger le rapport » visible quand la mission est en cours ou terminée.
- `MissionTrackingScreen` : `onOpenReport?: (interventionId: string) => void` → `ListItem`
  « Consulter le rapport » visible quand une intervention existe.
- `MissionRoute` et la route du suivi client poussent `/interventions/[id]`.

- [ ] **Step 5 : vérifier**

Run: `npm test -- src/features/interventions src/features/missions src/bootstrap`
Expected: PASS.

- [ ] **Step 6 : commit**

```bash
git add src/features src/bootstrap app
git commit -m "feat(interventions): transpose le rapport d'intervention et ses accès"
```

---

## Task 6 : tranche `disputes` (schémas, API, hooks)

**Files:**

- Create: `src/features/disputes/schemas/disputeSchemas.ts`, `api/disputesApi.ts`,
  `hooks/disputesKeys.ts`, `hooks/useDisputes.ts`, `i18n.ts`, `index.ts`, `README.md`
- Test: `schemas/disputeSchemas.test.ts`, `api/disputesApi.test.ts`, `hooks/disputesHooks.test.tsx`

- [ ] **Step 1 : écrire le test des schémas**

Cas : lecture de `disputes.json` (pagination plate `{ data: [...] }` renvoyée par
`paginate()`), lecture de `dispute.json` (avec `messages`), refus d'un formulaire sans motif,
refus d'une description vide.

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/disputes/schemas`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter les schémas**

```ts
import { z } from 'zod';

export const DISPUTE_STATUSES = ['open', 'in_review', 'resolved', 'closed'] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

const party = z.object({ id: z.string(), name: z.string(), avatar_url: z.string().nullish() });

export const disputeMessageSchema = z.object({
  id: z.string(),
  dispute_id: z.string().nullish(),
  sender_id: z.string().nullish(),
  message: z.string(),
  created_at: z.string().nullish(),
  sender: party.nullish(),
});
export type DisputeMessage = z.infer<typeof disputeMessageSchema>;

export const disputeSchema = z.object({
  id: z.string(),
  request_id: z.string().nullish(),
  opened_by: z.string().nullish(),
  against: z.string().nullish(),
  reason: z.string(),
  description: z.string().nullish(),
  status: z.enum(DISPUTE_STATUSES).catch('open'),
  resolution: z.string().nullish(),
  created_at: z.string().nullish(),
  opener: party.nullish(),
  defendant: party.nullish(),
  messages: z.array(disputeMessageSchema).nullish(),
});
export type Dispute = z.infer<typeof disputeSchema>;

export const disputePageResponseSchema = z.object({
  data: z.array(disputeSchema),
  current_page: z.number().nullish(),
  last_page: z.number().nullish(),
  total: z.number().nullish(),
});

export const disputeResponseSchema = z.object({ data: disputeSchema });
export const disputeMessageResponseSchema = z.object({
  message: z.string().nullish(),
  data: disputeMessageSchema,
});

export const REASON_MAX_LENGTH = 255;
export const DESCRIPTION_MAX_LENGTH = 4000;

/** Motifs proposés, reprenant ceux de `screens-feedback.jsx`. */
export const DISPUTE_REASONS = [
  'work_not_done',
  'quality',
  'delay',
  'amount',
  'behaviour',
  'other',
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const disputeFormSchema = z.object({
  reason: z.enum(DISPUTE_REASONS, { message: 'disputes:form.errors.reasonRequired' }),
  description: z
    .string()
    .trim()
    .min(1, 'disputes:form.errors.descriptionRequired')
    .max(DESCRIPTION_MAX_LENGTH, 'disputes:form.errors.descriptionTooLong'),
});
export type DisputeFormValues = z.infer<typeof disputeFormSchema>;

export interface DisputePayload {
  requestId: string;
  against: string;
  reason: string;
  description: string;
}
```

- [ ] **Step 4 : implémenter l'API**

Quatre fonctions : `fetchDisputes`, `fetchDispute`, `openDispute` (corps
`{ request_id, against, reason, description }`), `postDisputeMessage` (corps `{ message }`).
Chacune valide par `parseResponse`.

- [ ] **Step 5 : implémenter les clés et les hooks**

`disputesKeys` : `all`, `list()`, `detail(id)`. Hooks : `useDisputes`, `useDispute(id)`,
`useOpenDispute()`, `usePostDisputeMessage(id)` ; les mutations invalident `disputesKeys.all`.

- [ ] **Step 6 : écrire le test de l'API et des hooks**

Un cas par appel, avec vérification du corps envoyé pour les deux mutations.

- [ ] **Step 7 : vérifier**

Run: `npm test -- src/features/disputes`
Expected: PASS.

- [ ] **Step 8 : commit**

```bash
git add src/features/disputes
git commit -m "feat(disputes): modélise les litiges du serveur"
```

---

## Task 7 : écrans des litiges

**Files:**

- Create: `src/features/disputes/screens/DisputesScreen.tsx`, `DisputeFormScreen.tsx`,
  `DisputeThreadScreen.tsx`
- Create: `app/(litiges)/_layout.tsx`, `app/(litiges)/disputes/index.tsx`,
  `app/(litiges)/disputes/new.tsx`, `app/(litiges)/disputes/[id].tsx`
- Create: `src/bootstrap/screens/disputeRoutes.tsx`
- Test: `src/features/disputes/screens/disputes.test.tsx`
- Modify: `src/features/profile/screens/ProfileScreen.tsx` (destination `disputes`),
  `src/bootstrap/screens/ProfileRoute.tsx`, `src/bootstrap/instance.ts`

- [ ] **Step 1 : écrire les tests**

Cinq cas : la liste affiche motif, état et date ; la liste vide affiche `StateView status="empty"` ;
l'ouverture envoie `POST /disputes` avec `request_id`, `against`, `reason`, `description` ; le
formulaire refuse une description vide ; le fil envoie un message et l'affiche.

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/disputes/screens`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter les trois écrans**

- `DisputesScreen` : `Screen title={t('disputes:list.title')}`, `Card onPress` par litige,
  `Badge` de ton `PHASE_TONES`-like (`open` → `warning`, `in_review` → `neutral`,
  `resolved`/`closed` → `success`), `onOpen(disputeId)`.
- `DisputeFormScreen` : props `{ requestId: string; against: string; onDone: () => void }` ;
  `Chip` par motif (groupe `accessibilityRole="radiogroup"` implicite via libellés),
  `TextField` multiligne, `Button lg fullWidth`, `Snackbar` de réussite.
- `DisputeThreadScreen` : en-tête du litige (motif, état, parties), messages en bulles
  (réutiliser le rendu de `chat`), champ d'envoi désactivé si `resolved`/`closed` avec
  `Snackbar tone="info"` expliquant la clôture.

- [ ] **Step 4 : brancher les jointures**

`ProfileDestination` reçoit `'disputes'` (client et technicien), `PROFILE_HREF.disputes = '/disputes'`.

- [ ] **Step 5 : vérifier**

Run: `npm test -- src/features/disputes src/features/profile src/bootstrap`
Expected: PASS.

- [ ] **Step 6 : commit**

```bash
git add src/features src/bootstrap app
git commit -m "feat(disputes): transpose l'ouverture et le suivi d'un litige"
```

---

## Task 8 : séquestre et contrôle qualité

**Files:**

- Create: `src/features/wallet/schemas/holdSchemas.ts`, `api/holdsApi.ts`, `hooks/useHolds.ts`
- Create: `src/features/missions/screens/QualityControlScreen.tsx`
- Create: `app/(missions)/quality/[requestId].tsx`, `src/bootstrap/screens/QualityControlRoute.tsx`
- Test: `src/features/wallet/api/holdsApi.test.ts`, `src/features/missions/screens/QualityControlScreen.test.tsx`
- Modify: `src/features/wallet/index.ts`, `screens/WalletScreen.tsx`, `i18n.ts`,
  `src/features/missions/index.ts`, `i18n.ts`, `screens/MissionTrackingScreen.tsx`

Le contrôle qualité réunit le rapport d'intervention, les photos de la demande et les gels du
portefeuille. Valider capture le gel au profit du technicien ; signaler un problème ouvre un litige.

- [ ] **Step 1 : écrire le test de l'API des gels**

```ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import captured from '@/test/fixtures/wallet/hold-captured.json';
import holds from '@/test/fixtures/wallet/holds.json';

import { captureHold, fetchHolds, releaseHold } from './holdsApi';

function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('holdsApi', () => {
  it('liste les gels', async () => {
    const { api, mock } = setup();
    mock.onGet('/holds').reply(200, holds);

    await expect(fetchHolds(api)).resolves.toHaveLength(holds.data.length);
  });

  it('capture un gel au profit du technicien', async () => {
    const { api, mock } = setup();
    mock.onPost('/holds/h1/capture').reply(200, captured);

    await captureHold(api, 'h1', { payeeId: 't1', method: 'momo' });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      payee_id: 't1',
      method: 'momo',
    });
  });

  it('libère un gel', async () => {
    const { api, mock } = setup();
    mock.onPost('/holds/h1/release').reply(200, holds);

    await releaseHold(api, 'h1');

    expect(mock.history.post[0]?.url).toBe('/holds/h1/release');
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/wallet/api/holdsApi.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter schémas, API et hooks des gels**

```ts
import { z } from 'zod';

import { decimalSchema } from '@/core/api';

export const HOLD_STATUSES = ['active', 'captured', 'released'] as const;
export type HoldStatus = (typeof HOLD_STATUSES)[number];

export const holdSchema = z.object({
  id: z.string(),
  wallet_id: z.string().nullish(),
  amount: decimalSchema,
  reason: z.string().nullish(),
  status: z.enum(HOLD_STATUSES).catch('active'),
  released_at: z.string().nullish(),
  related_payment: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type Hold = z.infer<typeof holdSchema>;

export const holdListResponseSchema = z.object({ data: z.array(holdSchema) });
export const holdResponseSchema = z.object({
  message: z.string().nullish(),
  data: holdSchema.nullish(),
  payment_id: z.string().nullish(),
});

export interface CapturePayload {
  payeeId: string;
  method: string;
}
```

Hooks : `useHolds()`, `useCaptureHold()`, `useReleaseHold()` ; invalident `walletKeys.all`
(le solde change) et la liste des gels.

- [ ] **Step 4 : écrire le test du contrôle qualité**

Quatre cas : affichage du rapport et du montant gelé ; la validation appelle
`POST /holds/{id}/capture` avec le technicien en bénéficiaire ; l'état de réussite affiche
« Paiement libéré » et le bouton « Noter le technicien » ; « Signaler un problème » appelle
`onOpenDispute(requestId, technicianId)`.

- [ ] **Step 5 : implémenter l'écran**

`QualityControlScreenProps` : `{ requestId: string; onRate: () => void; onOpenDispute: (requestId: string, against: string) => void; onDone: () => void }`.
Après capture, l'écran rend le panneau de réussite transposé d'`EscrowReleaseScreen` :
`Icon check` dans un `IconTile` large, titre `t('missions:quality.released.title')`, montant
transféré, `Button lg fullWidth` « Noter le technicien » puis `Button variant="ghost"` « Terminer ».

- [ ] **Step 6 : brancher les jointures**

`MissionTrackingScreen` reçoit `onOpenQuality?: (requestId: string) => void`, affiché lorsque
la mission est `completed`. Le suivi client pousse `/quality/[requestId]`, qui pousse ensuite
`/reviews/new/[requestId]` puis `/invoices`.

- [ ] **Step 7 : vérifier**

Run: `npm test -- src/features/wallet src/features/missions src/bootstrap`
Expected: PASS.

- [ ] **Step 8 : commit**

```bash
git add src/features src/bootstrap app
git commit -m "feat(missions): transpose le contrôle qualité et la libération du séquestre"
```

---

## Task 9 : annulation d'une mission

**Files:**

- Create: `src/features/missions/screens/CancelMissionScreen.tsx`
- Create: `app/(missions)/cancel/[jobId].tsx`, `src/bootstrap/screens/CancelMissionRoute.tsx`
- Test: `src/features/missions/screens/CancelMissionScreen.test.tsx`
- Modify: `src/features/missions/index.ts`, `i18n.ts`, `screens/MissionCockpitScreen.tsx`,
  `src/bootstrap/screens/MissionRoute.tsx`

La maquette place l'annulation côté client ; aucun point d'API ne le permet
(`PATCH /jobs/{id}/status` refuse tout autre que le technicien assigné). L'écran est donc
transposé côté technicien, en deux temps comme la maquette : choix du motif, puis confirmation
irréversible.

- [ ] **Step 1 : écrire le test**

Trois cas : le premier écran liste les motifs et n'appelle rien ; « Continuer » affiche
l'avertissement irréversible ; la confirmation appelle `PATCH /jobs/{id}/status` avec
`{ status: 'cancelled', completion_notes: <motif> }` puis `onDone()`.

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/missions/screens/CancelMissionScreen.test.tsx`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter**

`StepIndicator` à deux segments, `Chip` par motif (`missions:cancel.reasons.*`), `Button danger`
« Continuer » puis « Confirmer l'annulation », `Snackbar tone="danger"` en cas d'échec.

- [ ] **Step 4 : brancher la jointure**

`MissionCockpitScreen` reçoit `onCancel?: (jobId: string) => void`, affiché tant que la mission
n'est ni `completed` ni `cancelled`.

- [ ] **Step 5 : vérifier**

Run: `npm test -- src/features/missions src/bootstrap`
Expected: PASS.

- [ ] **Step 6 : commit**

```bash
git add src/features/missions src/bootstrap app
git commit -m "feat(missions): transpose l'annulation d'une mission"
```

---

## Task 10 : réputation et badges

**Files:**

- Create: `src/features/reviews/model/reputationTiers.ts`
- Create: `src/features/reviews/screens/ReputationScreen.tsx`, `screens/BadgeDetailScreen.tsx`
- Create: `app/(avis)/reputation.tsx`, `app/(avis)/badges/[code].tsx`,
  `src/bootstrap/screens/reputationRoutes.tsx`
- Test: `src/features/reviews/model/reputationTiers.test.ts`,
  `src/features/reviews/screens/reputation.test.tsx`
- Modify: `src/features/reviews/index.ts`, `i18n.ts`,
  `src/features/profile/screens/ProfileScreen.tsx`, `src/bootstrap/screens/ProfileRoute.tsx`

Les paliers sont ceux de `screens-reputation.jsx` : bronze, argent, or, platine, diamant.

- [ ] **Step 1 : écrire le test des paliers**

```ts
import { nextTierPoints, tierFor } from './reputationTiers';

describe('tierFor', () => {
  it('place un débutant en bronze', () => {
    expect(tierFor(0)).toBe('bronze');
  });

  it('respecte les seuils des maquettes', () => {
    expect(tierFor(499)).toBe('bronze');
    expect(tierFor(500)).toBe('silver');
    expect(tierFor(1500)).toBe('gold');
    expect(tierFor(3000)).toBe('platinum');
    expect(tierFor(6000)).toBe('diamond');
  });

  it('indique le palier suivant', () => {
    expect(nextTierPoints(600)).toBe(1500);
    expect(nextTierPoints(6000)).toBeNull();
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/reviews/model/reputationTiers.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter les paliers**

```ts
export const REPUTATION_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;
export type ReputationTier = (typeof REPUTATION_TIERS)[number];

/** Seuils repris des maquettes (`RANK_TIERS`). */
const THRESHOLDS: Record<ReputationTier, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
  diamond: 6000,
};

export function tierFor(points: number): ReputationTier {
  let tier: ReputationTier = 'bronze';
  for (const candidate of REPUTATION_TIERS) {
    if (points >= THRESHOLDS[candidate]) tier = candidate;
  }
  return tier;
}

/** Points du palier suivant, ou `null` au palier maximal. */
export function nextTierPoints(points: number): number | null {
  const next = REPUTATION_TIERS.find((tier) => THRESHOLDS[tier] > points);
  return next === undefined ? null : THRESHOLDS[next];
}
```

- [ ] **Step 4 : écrire le test des écrans**

Quatre cas : le total de réputation et le palier s'affichent ; les badges obtenus apparaissent en
grille adaptative ; les badges du catalogue non obtenus apparaissent en grisé ; le détail d'un
badge affiche son titre et sa date d'obtention.

- [ ] **Step 5 : implémenter les écrans**

- `ReputationScreen` : props `{ userId: string; onOpenBadge: (code: string) => void; onOpenLeaderboard: () => void }` ;
  `StatTile` du total, `Badge` du palier, `StepIndicator` de progression vers le palier suivant,
  `AdaptiveGrid minTileWidth={96}` d'`IconTile` par badge, historique des variations en `ListItem`.
- `BadgeDetailScreen` : props `{ code: string; userId: string }` ; titre, icône, date
  d'obtention ou mention « non obtenu », description issue du catalogue `GET /badges`.

- [ ] **Step 6 : brancher les jointures**

`ProfileDestination` reçoit `'reputation'` (technicien), `PROFILE_HREF.reputation = '/reputation'`.

- [ ] **Step 7 : vérifier**

Run: `npm test -- src/features/reviews src/features/profile src/bootstrap`
Expected: PASS.

- [ ] **Step 8 : commit**

```bash
git add src/features src/bootstrap app
git commit -m "feat(reviews): transpose la réputation et les badges"
```

---

## Task 11 : classement

**Files:**

- Create: `src/features/directory/model/ranking.ts`, `screens/LeaderboardScreen.tsx`
- Create: `app/(annuaire)/leaderboard.tsx`, `src/bootstrap/screens/LeaderboardRoute.tsx`
- Test: `src/features/directory/model/ranking.test.ts`,
  `src/features/directory/screens/LeaderboardScreen.test.tsx`
- Modify: `src/features/directory/index.ts`, `i18n.ts`,
  `src/features/reviews/screens/ReputationScreen.tsx` (jointure)

Aucun point d'API ne renvoie de palmarès de réputation : le classement ordonne l'annuaire par
note décroissante, puis par nombre d'avis. L'écart est consigné.

- [ ] **Step 1 : écrire le test de l'ordonnancement**

```ts
import { rankTechnicians } from './ranking';

const card = (id: string, rating: number | null, reviews: number | null) =>
  ({ id, name: id, rating, num_reviews: reviews, skills: [], verified: true }) as never;

describe('rankTechnicians', () => {
  it('ordonne par note décroissante', () => {
    const ranked = rankTechnicians([card('a', 4.2, 10), card('b', 4.9, 3)]);
    expect(ranked.map((entry) => entry.technician.id)).toEqual(['b', 'a']);
  });

  it('départage par nombre d’avis', () => {
    const ranked = rankTechnicians([card('a', 4.5, 2), card('b', 4.5, 9)]);
    expect(ranked.map((entry) => entry.technician.id)).toEqual(['b', 'a']);
  });

  it('relègue les techniciens sans note', () => {
    const ranked = rankTechnicians([card('a', null, 0), card('b', 3.1, 1)]);
    expect(ranked.map((entry) => entry.technician.id)).toEqual(['b', 'a']);
  });

  it('numérote les rangs à partir de 1', () => {
    expect(rankTechnicians([card('a', 5, 1)])[0]?.rank).toBe(1);
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/directory/model/ranking.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter**

```ts
import type { TechnicianCard } from '../schemas/directorySchemas';

export interface RankedTechnician {
  rank: number;
  technician: TechnicianCard;
}

/** Ordonne par note décroissante, puis par nombre d'avis ; les non notés ferment la marche. */
export function rankTechnicians(technicians: TechnicianCard[]): RankedTechnician[] {
  return [...technicians]
    .sort((left, right) => {
      const ratingGap = (right.rating ?? -1) - (left.rating ?? -1);
      if (ratingGap !== 0) return ratingGap;
      return (right.num_reviews ?? 0) - (left.num_reviews ?? 0);
    })
    .map((technician, index) => ({ rank: index + 1, technician }));
}
```

- [ ] **Step 4 : implémenter l'écran**

`LeaderboardScreen` : props `{ onOpen: (technicianId: string) => void }` ; podium des trois
premiers en `AdaptiveGrid minTileWidth={96} cap={3}`, puis `ListItem` par rang avec `Avatar`,
note et nombre d'avis. En-tête `Snackbar tone="info"` rappelant que le classement repose sur
les notes reçues.

- [ ] **Step 5 : vérifier**

Run: `npm test -- src/features/directory src/features/reviews`
Expected: PASS.

- [ ] **Step 6 : commit**

```bash
git add src/features src/bootstrap app
git commit -m "feat(directory): transpose le classement des techniciens"
```

---

## Task 12 : détail d'une transaction

**Files:**

- Create: `src/features/wallet/screens/TransactionDetailScreen.tsx`
- Create: `app/(portefeuille)/wallet/transactions/[id].tsx`,
  `src/bootstrap/screens/TransactionDetailRoute.tsx`
- Test: `src/features/wallet/screens/TransactionDetailScreen.test.tsx`
- Modify: `src/features/wallet/index.ts`, `i18n.ts`, `screens/WalletScreen.tsx`,
  `src/bootstrap/screens/WalletRoute.tsx`, `app/(portefeuille)/_layout.tsx`

- [ ] **Step 1 : écrire le test**

Trois cas : le détail affiche montant, type, solde après opération et date ; une transaction
inconnue affiche `StateView status="empty"` ; la carte du portefeuille est pressable et appelle
`onOpenTransaction(id)`.

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/wallet/screens/TransactionDetailScreen.test.tsx`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter**

L'écran relit la liste déjà en cache (`useWalletTransactions`) et y cherche l'identifiant ; aucun
point d'API unitaire n'existe. Rubriques : montant (`formatAmount`), type traduit, solde après
opération, référence de paiement liée, date (`formatDate`).

- [ ] **Step 4 : vérifier**

Run: `npm test -- src/features/wallet src/bootstrap`
Expected: PASS.

- [ ] **Step 5 : commit**

```bash
git add src/features/wallet src/bootstrap app
git commit -m "feat(wallet): transpose le détail d'une transaction"
```

---

## Task 13 : confirmation d'un paiement

**Files:**

- Create: `src/features/wallet/schemas/paymentSchemas.ts`, `api/paymentsApi.ts`,
  `hooks/usePayments.ts`, `screens/PaymentConfirmationScreen.tsx`
- Create: `app/(portefeuille)/wallet/payments/[id].tsx`,
  `src/bootstrap/screens/PaymentConfirmationRoute.tsx`
- Test: `src/features/wallet/api/paymentsApi.test.ts`,
  `src/features/wallet/screens/PaymentConfirmationScreen.test.tsx`
- Modify: `src/features/wallet/index.ts`, `i18n.ts`, `screens/RechargeScreen.tsx`,
  `screens/WithdrawScreen.tsx`, `src/bootstrap/screens/WalletRoute.tsx`

La maquette attend un code à six chiffres. L'API ne vérifie aucun code : `POST /payments/{id}/confirm`
règle le paiement sans secret. Afficher une case de saisie serait un faux-semblant ; l'écran
affiche donc la référence, l'état et l'invitation à valider la demande reçue de l'opérateur.

- [ ] **Step 1 : écrire le test de l'API**

Deux cas : `GET /payments/{id}` rend l'état ; `POST /payments/{id}/confirm` est appelé sans corps
et rend l'état réglé.

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/wallet/api/paymentsApi.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter schémas, API et hooks**

```ts
import { z } from 'zod';

import { decimalSchema } from '@/core/api';

export const PAYMENT_STATUSES = ['pending', 'settled', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const paymentSchema = z.object({
  id: z.string(),
  method: z.string().nullish(),
  amount: decimalSchema,
  currency: z.string().nullish(),
  status: z.enum(PAYMENT_STATUSES).catch('pending'),
  external_ref: z.string().nullish(),
  settled_at: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type Payment = z.infer<typeof paymentSchema>;

export const paymentResponseSchema = z.object({ data: paymentSchema });
```

- [ ] **Step 4 : écrire le test de l'écran**

Trois cas : l'écran affiche la référence et l'état en attente ; « J'ai validé sur mon téléphone »
appelle `POST /payments/{id}/confirm` puis affiche la réussite ; un paiement déjà réglé masque
le bouton.

- [ ] **Step 5 : implémenter l'écran et les jointures**

`RechargeScreen` et `WithdrawScreen` reçoivent `onPending?: (paymentId: string) => void`, appelé
avec l'identifiant renvoyé par la mutation. Les routes poussent `/wallet/payments/[id]`.

- [ ] **Step 6 : vérifier**

Run: `npm test -- src/features/wallet src/bootstrap`
Expected: PASS.

- [ ] **Step 7 : commit**

```bash
git add src/features/wallet src/bootstrap app
git commit -m "feat(wallet): transpose la confirmation d'un paiement en attente"
```

---

## Task 14 : écran de recherche

**Files:**

- Create: `src/features/directory/model/searchHistory.ts`, `screens/SearchScreen.tsx`
- Create: `app/(annuaire)/search.tsx`, `src/bootstrap/screens/SearchRoute.tsx`
- Test: `src/features/directory/model/searchHistory.test.ts`,
  `src/features/directory/screens/SearchScreen.test.tsx`
- Modify: `src/features/directory/index.ts`, `i18n.ts`,
  `src/bootstrap/screens/ClientHomeRoute.tsx`, `src/bootstrap/createServices.ts`

- [ ] **Step 1 : écrire le test de l'historique**

```ts
import { createMemoryStore } from '@/core/storage';

import { createSearchHistory, HISTORY_LIMIT } from './searchHistory';

describe('createSearchHistory', () => {
  it('est vide au départ', () => {
    expect(createSearchHistory(createMemoryStore()).read()).toEqual([]);
  });

  it('place la recherche la plus récente en tête', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('plombier');
    history.remember('électricien');
    expect(history.read()).toEqual(['électricien', 'plombier']);
  });

  it('ne garde qu’une occurrence par terme', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('plombier');
    history.remember('électricien');
    history.remember('plombier');
    expect(history.read()).toEqual(['plombier', 'électricien']);
  });

  it('borne l’historique', () => {
    const history = createSearchHistory(createMemoryStore());
    for (let index = 0; index <= HISTORY_LIMIT; index += 1) history.remember(`terme ${index}`);
    expect(history.read()).toHaveLength(HISTORY_LIMIT);
  });

  it('ignore une recherche vide', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('   ');
    expect(history.read()).toEqual([]);
  });

  it('se purge', () => {
    const history = createSearchHistory(createMemoryStore());
    history.remember('plombier');
    history.clear();
    expect(history.read()).toEqual([]);
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/directory/model/searchHistory.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter l'historique**

```ts
import { z } from 'zod';

import { readJson, writeJson, type KeyValueStore } from '@/core/storage';

const KEY = 'directory.search.history';
const schema = z.array(z.string());

/** Nombre de recherches conservées, comme dans la maquette `SearchScreen`. */
export const HISTORY_LIMIT = 6;

export interface SearchHistory {
  read: () => string[];
  remember: (term: string) => void;
  clear: () => void;
}

/** Historique local des recherches ; jamais transmis au serveur. */
export function createSearchHistory(store: KeyValueStore): SearchHistory {
  const read = () => readJson(store, KEY, schema) ?? [];
  return {
    read,
    remember: (term) => {
      const trimmed = term.trim();
      if (trimmed === '') return;
      const next = [trimmed, ...read().filter((entry) => entry !== trimmed)].slice(
        0,
        HISTORY_LIMIT,
      );
      writeJson(store, KEY, next);
    },
    clear: () => store.remove(KEY),
  };
}
```

- [ ] **Step 4 : écrire le test de l'écran**

Quatre cas : l'écran affiche les recherches récentes ; presser une recherche récente relance la
requête ; soumettre un terme l'enregistre et affiche les résultats ; « Effacer l'historique »
le vide.

- [ ] **Step 5 : implémenter l'écran et la jointure**

`SearchScreen` : props `{ history: SearchHistory; onOpen: (technicianId: string) => void }` ;
`SearchField` éditable en haut, `SectionHeader` « Recherches récentes » avec `ListItem icon="clock"`,
résultats en `Card` réutilisant le rendu de l'annuaire. `ClientHomeRoute.onSearch` pousse
désormais `/search`. L'historique est fourni par `createServices` (stockage
`reliance.preferences`), afin que les tests injectent un stockage en mémoire.

- [ ] **Step 6 : vérifier**

Run: `npm test -- src/features/directory src/bootstrap`
Expected: PASS.

- [ ] **Step 7 : commit**

```bash
git add src/features/directory src/bootstrap app
git commit -m "feat(directory): transpose l'écran de recherche et son historique"
```

---

## Task 15 : parcours d'installation du technicien

**Files:**

- Create: `src/features/profile/model/setupSteps.ts`, `screens/TechnicianSetupScreen.tsx`
- Create: `app/(profil)/setup.tsx`, `src/bootstrap/screens/TechnicianSetupRoute.tsx`
- Test: `src/features/profile/model/setupSteps.test.ts`,
  `src/features/profile/screens/TechnicianSetupScreen.test.tsx`
- Modify: `src/features/profile/index.ts`, `i18n.ts`, `screens/ProfileScreen.tsx`,
  `src/bootstrap/screens/ProfileRoute.tsx`, `src/features/kyc/screens/KycScreen.tsx`

La maquette impose un assistant en cinq étapes. Les cinq écrans existent déjà et sont utilisables
séparément ; les enfermer dans un assistant retirerait cette liberté. Le parcours affiche donc les
cinq étapes, leur état d'achèvement et un lien vers chacune.

- [ ] **Step 1 : écrire le test du modèle**

```ts
import { setupStepsFor } from './setupSteps';

describe('setupStepsFor', () => {
  it('marque le profil achevé dès que la description et le téléphone existent', () => {
    const steps = setupStepsFor({
      profile: { bio: 'Électricien depuis 10 ans', phone: '+237600000000' },
      skills: [],
      serviceArea: null,
      kycApproved: false,
      timeSlots: [],
    });
    expect(steps.find((step) => step.key === 'professional')?.done).toBe(true);
  });

  it('exige au moins une compétence', () => {
    const steps = setupStepsFor({
      profile: null,
      skills: [],
      serviceArea: null,
      kycApproved: false,
      timeSlots: [],
    });
    expect(steps.find((step) => step.key === 'skills')?.done).toBe(false);
  });

  it('compte les étapes achevées', () => {
    const steps = setupStepsFor({
      profile: { bio: 'x', phone: '+237600000000' },
      skills: [{ id: 's1' }],
      serviceArea: { radius_km: 10 },
      kycApproved: true,
      timeSlots: [{ id: 'c1' }],
    });
    expect(steps.every((step) => step.done)).toBe(true);
  });
});
```

- [ ] **Step 2 : vérifier l'échec**

Run: `npm test -- src/features/profile/model/setupSteps.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : implémenter le modèle et l'écran**

`setupStepsFor` rend cinq entrées `{ key, done }` dans l'ordre `professional`, `skills`, `zone`,
`kyc`, `planning`. L'écran affiche `StepIndicator` (étapes achevées), puis un `ListItem` par
étape avec icône `check` ou `minus` et navigation vers l'écran correspondant.

- [ ] **Step 4 : brancher les jointures**

`ProfileDestination` reçoit `'setup'` (technicien, en tête de liste) ;
`PROFILE_HREF.setup = '/setup'`. `KycScreen` affiche un `Button` « Poursuivre l'installation »
quand tous les justificatifs sont déposés.

- [ ] **Step 5 : vérifier**

Run: `npm test -- src/features/profile src/features/kyc src/bootstrap`
Expected: PASS.

- [ ] **Step 6 : commit**

```bash
git add src/features src/bootstrap app
git commit -m "feat(profile): transpose le parcours d'installation du technicien"
```

---

## Task 16 : audit des jointures

**Files:**

- Create: `src/bootstrap/screens/joins.test.tsx`
- Modify: les enveloppes de `src/bootstrap/screens/` dont une jointure manque

- [ ] **Step 1 : écrire le test des jointures**

Le test monte chaque enveloppe de route avec `expo-router` simulé (`jest.mock('expo-router')`),
presse l'élément censé mener ailleurs et vérifie la cible poussée. Une assertion par arête du
graphe des maquettes : accueil client → recherche, accueil client → notifications, suivi →
rapport, suivi → contrôle qualité, contrôle qualité → avis, avis → facture, cockpit → rapport,
cockpit → annulation, compte → litiges, compte → réputation, réputation → classement, réputation
→ détail d'un badge, portefeuille → transaction, recharge → confirmation, compte → parcours,
accueil → fil d'accueil.

- [ ] **Step 2 : exécuter et corriger**

Run: `npm test -- src/bootstrap/screens/joins.test.tsx`
Expected: les arêtes absentes échouent ; les brancher jusqu'au vert.

- [ ] **Step 3 : commit**

```bash
git add src/bootstrap
git commit -m "test(navigation): verrouille les jointures du graphe des maquettes"
```

---

## Task 17 : documentation

**Files:**

- Create: `docs/adr/0010-transposition-complete-des-maquettes.md`
- Modify: `docs/adr/0009-habillage-android-adaptatif.md` (renvoi), `docs/architecture.md`,
  `README.md`, `src/features/*/README.md` des tranches touchées, ce plan (table des écarts)

- [ ] **Step 1 : écrire l'ADR 0010**

Contexte : le recensement du 17/10/2026 ; décision : transposer les quatorze maquettes
atteignables et matérialiser les arêtes du graphe ; conséquences : les écarts assumés
(annulation côté technicien, confirmation de paiement sans code, classement par note, détail de
transaction lu dans la liste, parcours d'installation sans assistant) et les deux maquettes
inatteignables (`MapScreen`, `AssignJobScreen`) avec leur cause exacte.

- [ ] **Step 2 : mettre à jour l'architecture et le README**

Ajouter les tranches `interventions` et `disputes` à la liste des features, la table des
jointures au README, et la note sur l'absence de clé Google Maps.

- [ ] **Step 3 : remplir la table des écarts de ce plan**

- [ ] **Step 4 : vérification finale**

Run: `npm run format:check && npm run lint && npm run typecheck && npm test`
Expected: tout vert.

Run: `npx expo export --platform android --output-dir "$SCRATCH/export"`
Expected: `exit=0`, paquet Hermes produit.

- [ ] **Step 5 : commit**

```bash
git add docs README.md src
git commit -m "docs: consigne la transposition complète des maquettes (ADR 0010)"
```

---

## Écarts constatés à l'exécution

| #   | Tâche | Constat                                                                                                                                                                    | Traitement                                                                                                                                       |
| --- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 1     | Les badges n'avaient jamais été semés : `GET /badges` et `/badges/user/{id}` renvoyaient des listes vides, et trois tests entérinaient ce vide.                            | Le script sème trois badges et en attribue deux ; les trois assertions sont rectifiées.                                                          |
| 2   | 1     | `POST /holds` exige un solde disponible, que la passerelle NotchPay ne peut créditer hors ligne.                                                                           | La recharge de capture emploie `bank_transfer`, qui n'appelle aucun service externe, puis `POST /payments/{id}/confirm`.                         |
| 3   | 1     | L'anonymiseur ignorait `opener`, `defendant`, `payer` et `payee`.                                                                                                          | Quatre clés ajoutées à `PERSON_KEYS`.                                                                                                            |
| 4   | 2     | `getByRole('alert')` ne trouve pas une vue qui porte le rôle sans être `accessible`.                                                                                       | Le bandeau est `accessible`, porte son message en libellé et une région active.                                                                  |
| 5   | 2     | Les maquettes n'emploient que trois tons de bandeau, et aucune icône `alert` n'existe au jeu.                                                                              | `SnackbarTone` se limite à `info`, `success` et `danger`.                                                                                        |
| 6   | 3     | `TranslationTree` n'admet pas de tableau : les diapositives ne pouvaient être une liste.                                                                                   | Objet indexé (`slides['0']`), lu par `t('auth:onboarding.slides.0.title')`.                                                                      |
| 7   | 3     | Le fil d'accueil n'est pas une route de la pile invitée : il la précède.                                                                                                   | `OnboardingGate` interpose le fil devant la pile `(auth)`, au premier lancement seulement.                                                       |
| 8   | 5     | Le serveur ne publie l'identifiant d'intervention nulle part, et `GET /interventions` ne filtrait que pour les techniciens : un client recevait les interventions de tous. | Correctif serveur restreignant la liste et la lecture aux deux parties, puis `InterventionReportGate` qui retrouve l'intervention dans la liste. |
| 9   | 5     | `duration_hours` arrive en chaîne décimale et aucun format d'heures n'existait.                                                                                            | `z.coerce.number()` au schéma, `formatHours` au module de formats.                                                                               |
| 10  | 8     | `clientActiveMission` ne renvoie que les demandes `quoted` ou `assigned` : la mission terminée disparaît du suivi.                                                         | La fin de parcours est accrochée au détail de la demande, qui subsiste.                                                                          |
| 11  | 8     | Aucun gel de séquestre ne porte d'identifiant de demande.                                                                                                                  | `holdForRequest` retient le gel dont le motif cite la demande, à défaut le plus ancien actif.                                                    |
| 12  | 8     | `POST /holds/{id}/capture` ne renvoie que `payment_id`, sans objet `data`.                                                                                                 | Schéma de réponse dédié, l'API rendant l'identifiant du paiement.                                                                                |
| 13  | 10    | Les seuils de palier du plan étaient inventés.                                                                                                                             | Seuils repris de `RANK_TIERS` : 0, 50, 150, 300 et 600 points.                                                                                   |
| 14  | 10    | Une réputation peut être négative, ce qui faisait rendre 1 à la progression.                                                                                               | Le total est borné à zéro avant tout calcul.                                                                                                     |
| 15  | 10    | Le catalogue `GET /badges` porte une `description` absente des badges attribués.                                                                                           | Schéma `catalogBadgeSchema` distinct du badge attribué.                                                                                          |
| 16  | 12    | `TransactionResource` ne porte pas de `related_payment`, mais un `meta.source`.                                                                                            | Le détail présente l'origine du mouvement.                                                                                                       |
| 17  | 13    | `POST /payments/{id}/confirm` ne vérifie aucun code.                                                                                                                       | Aucune saisie n'est présentée : l'écran rappelle la référence et confirme le règlement.                                                          |
| 18  | 16    | Quatre routes d'`app/` portaient encore leur jointure, ce qui les rendait inéprouvables.                                                                                   | Jointures déplacées dans `src/bootstrap/screens`, comme le veut l'architecture.                                                                  |
| 19  | 16    | Jest refuse qu'une usine de simulation référence une variable hors portée non préfixée `mock`.                                                                             | Le capteur de propriétés est une fonction `mockCapture`, hissée avec les appels à `jest.mock`.                                                   |
| 20  | —     | Les fixtures anonymisées portent toutes le même nom et deux captures ont produit des doublons.                                                                             | Les assertions visent les libellés d'accessibilité ou le premier élément d'une liste homogène.                                                   |
| 21  | —     | Les types de routes d'expo-router ne se régénèrent qu'au démarrage du serveur de développement.                                                                            | Chaque nouvelle route est suivie d'un démarrage bref de Metro avant le contrôle de typage.                                                       |
