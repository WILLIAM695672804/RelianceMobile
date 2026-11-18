import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { CancelMissionRoute } from './CancelMissionRoute';
import { ClientHomeRoute } from './ClientHomeRoute';
import { ClientTrackingRoute } from './ClientTrackingRoute';
import { DisputeFormRoute, DisputesRoute, DisputeThreadRoute } from './disputeRoutes';
import { PaymentConfirmationRoute, TransactionDetailRoute } from './financeRoutes';
import { KycRoute } from './KycRoute';
import { LeaderboardRoute } from './LeaderboardRoute';
import { MissionRoute } from './MissionRoute';
import { RechargeRoute, WithdrawRoute } from './paymentRoutes';
import { PROFILE_HREF, ProfileRoute } from './ProfileRoute';
import { QualityControlRoute } from './QualityControlRoute';
import { RequestDetailRoute } from './RequestDetailRoute';
import { BadgeDetailRoute, ReputationRoute } from './reputationRoutes';
import { SearchRoute } from './SearchRoute';
import { TechnicianSetupRoute } from './TechnicianSetupRoute';
import { WalletRoute } from './WalletRoute';

/**
 * Verrouille les arêtes du graphe de navigation des maquettes (`design/maquettes/app.jsx`).
 * Chaque écran est remplacé par un capteur de propriétés : seule la jointure est éprouvée.
 */

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({
    id: 'r1',
    jobId: 'j1',
    requestId: 'r1',
    against: 't1',
    technicianId: 't1',
    code: 'first-mission',
  }),
}));

type Props = Record<string, unknown>;
let mockCaptured: Props | undefined;

// Déclaration de fonction préfixée « mock » : jest l'autorise dans ses usines de simulation.
function mockCapture(props: Props) {
  mockCaptured = props;
  return null;
}

function call(name: string, ...args: unknown[]) {
  const handler = mockCaptured?.[name];
  if (typeof handler !== 'function') throw new Error(`propriété absente : ${name}`);
  (handler as (...rest: unknown[]) => void)(...args);
}

jest.mock('@/features/requests', () => ({
  ClientHomeScreen: mockCapture,
  RequestDetailScreen: mockCapture,
}));
jest.mock('@/features/missions', () => ({
  MissionCockpitScreen: mockCapture,
  ClientTrackingContainer: mockCapture,
  QualityControlScreen: mockCapture,
  CancelMissionContainer: mockCapture,
}));
jest.mock('../containers/QualityContainer', () => ({ QualityContainer: mockCapture }));
jest.mock('@/features/disputes', () => ({
  DisputesScreen: mockCapture,
  DisputeFormContainer: mockCapture,
  DisputeThreadScreen: mockCapture,
}));
jest.mock('@/features/reviews', () => ({
  ReputationScreen: mockCapture,
  BadgeDetailScreen: mockCapture,
}));
jest.mock('@/features/directory', () => ({
  LeaderboardScreen: mockCapture,
  SearchScreen: mockCapture,
}));
jest.mock('@/features/wallet', () => ({
  WalletScreen: mockCapture,
  RechargeScreen: mockCapture,
  WithdrawScreen: mockCapture,
  TransactionDetailScreen: mockCapture,
  PaymentConfirmationScreen: mockCapture,
}));
jest.mock('@/features/profile', () => ({
  ProfileScreen: mockCapture,
  TechnicianSetupScreen: mockCapture,
}));
jest.mock('@/features/kyc', () => ({ KycScreen: mockCapture }));
jest.mock('@/features/interventions', () => ({
  InterventionReportScreen: mockCapture,
  interventionForJob: () => null,
  interventionForRequest: () => null,
  useInterventions: () => ({ isPending: true, data: undefined }),
  useCreateIntervention: () => ({ isIdle: true, mutate: jest.fn() }),
}));
jest.mock('@/bootstrap/instance', () => ({ searchHistory: { read: () => [] } }));
jest.mock('@/core/session', () => ({ useSession: () => 'u1' }));

beforeEach(() => {
  mockCaptured = undefined;
  jest.clearAllMocks();
});

describe('jointures de l’accueil client', () => {
  it('mène à la recherche et aux notifications', async () => {
    await render(<ClientHomeRoute />);

    call('onSearch');
    call('onOpenNotifications');

    expect(router.push).toHaveBeenNthCalledWith(1, '/search');
    expect(router.push).toHaveBeenNthCalledWith(2, '/notifications');
  });

  it('mène à la recherche de l’annuaire', async () => {
    await render(<SearchRoute />);

    call('onOpen', 't1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/technicians/[id]',
      params: { id: 't1' },
    });
  });
});

describe('jointures du parcours d’intervention', () => {
  it('relie le cockpit au rapport et à l’annulation', async () => {
    await render(<MissionRoute />);

    call('onOpenReport', 'j1', 'r1');
    call('onCancel', 'j1');

    expect(router.push).toHaveBeenNthCalledWith(1, {
      pathname: '/reports/[jobId]',
      params: { jobId: 'j1', requestId: 'r1' },
    });
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: '/cancel/[jobId]',
      params: { jobId: 'j1' },
    });
  });

  it('ramène au cockpit après une annulation', async () => {
    await render(<CancelMissionRoute />);

    call('onDone');

    expect(router.replace).toHaveBeenCalledWith('/technicien/mission');
  });

  it('relie le suivi client à la messagerie, aux devis et au contrôle qualité', async () => {
    await render(<ClientTrackingRoute />);

    call('onChat', 't1', 'Fuite');
    call('onOpenQuotes', 'r1');
    call('onOpenQuality', 'r1', 't1');

    expect(router.push).toHaveBeenNthCalledWith(1, {
      pathname: '/conversations/new',
      params: { member: 't1', subject: 'Fuite' },
    });
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: '/quotes/[requestId]',
      params: { requestId: 'r1' },
    });
    expect(router.push).toHaveBeenNthCalledWith(3, {
      pathname: '/requests/[id]/quality',
      params: { id: 'r1', technicianId: 't1' },
    });
  });

  it('relie le détail d’une demande au contrôle qualité, au rapport, à l’avis et au litige', async () => {
    await render(<RequestDetailRoute />);

    call('onOpenQuality', 'r1', 't1');
    call('onOpenReport', 'r1');
    call('onReview', 'r1');
    call('onOpenDispute', 'r1', 't1');

    expect(router.push).toHaveBeenNthCalledWith(1, {
      pathname: '/requests/[id]/quality',
      params: { id: 'r1', technicianId: 't1' },
    });
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: '/requests/[id]/report',
      params: { id: 'r1' },
    });
    expect(router.push).toHaveBeenNthCalledWith(3, {
      pathname: '/reviews/new/[requestId]',
      params: { requestId: 'r1' },
    });
    expect(router.push).toHaveBeenNthCalledWith(4, {
      pathname: '/disputes/new',
      params: { requestId: 'r1', against: 't1' },
    });
  });

  it('mène du contrôle qualité à l’avis puis au litige', async () => {
    await render(<QualityControlRoute />);

    call('onRate', 'r1');
    call('onDispute', 'r1', 't1');

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/reviews/new/[requestId]',
      params: { requestId: 'r1' },
    });
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/disputes/new',
      params: { requestId: 'r1', against: 't1' },
    });
  });
});

describe('jointures des litiges', () => {
  it('ouvre le fil d’un litige depuis la liste', async () => {
    await render(<DisputesRoute />);

    call('onOpen', 'd1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/disputes/[id]',
      params: { id: 'd1' },
    });
  });

  it('remplace le formulaire par le fil du litige ouvert', async () => {
    await render(<DisputeFormRoute />);

    call('onOpened', 'd1');

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/disputes/[id]',
      params: { id: 'd1' },
    });
  });

  it('revient en arrière depuis le fil', async () => {
    await render(<DisputeThreadRoute />);

    call('onBack');

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

describe('jointures de la réputation', () => {
  it('mène au classement et au détail d’un badge', async () => {
    await render(<ReputationRoute />);

    call('onOpenBadge', 'first-mission');
    call('onOpenLeaderboard');

    expect(router.push).toHaveBeenNthCalledWith(1, {
      pathname: '/badges/[code]',
      params: { code: 'first-mission' },
    });
    expect(router.push).toHaveBeenNthCalledWith(2, '/leaderboard');
  });

  it('mène du classement au profil public', async () => {
    await render(<LeaderboardRoute />);

    call('onOpen', 't1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/technicians/[id]',
      params: { id: 't1' },
    });
  });

  it('revient en arrière depuis un badge', async () => {
    await render(<BadgeDetailRoute />);

    call('onBack');

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

describe('jointures du portefeuille', () => {
  it('ouvre le détail d’un mouvement', async () => {
    await render(<WalletRoute />);

    call('onOpenTransaction', 'x1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/wallet/transactions/[id]',
      params: { id: 'x1' },
    });
  });

  it('mène de la recharge et du retrait à la confirmation du paiement', async () => {
    await render(<RechargeRoute />);
    call('onPending', 'p1');
    await render(<WithdrawRoute />);
    call('onPending', 'p2');

    expect(router.replace).toHaveBeenNthCalledWith(1, {
      pathname: '/wallet/payments/[id]',
      params: { id: 'p1' },
    });
    expect(router.replace).toHaveBeenNthCalledWith(2, {
      pathname: '/wallet/payments/[id]',
      params: { id: 'p2' },
    });
  });

  it('ramène au portefeuille après la confirmation', async () => {
    await render(<PaymentConfirmationRoute />);

    call('onDone');

    expect(router.replace).toHaveBeenCalledWith('/wallet');
  });

  it('revient en arrière depuis un mouvement', async () => {
    await render(<TransactionDetailRoute />);

    call('onBack');

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

describe('jointures du compte', () => {
  it('expose une route par destination du menu', async () => {
    await render(<ProfileRoute />);

    for (const destination of Object.keys(PROFILE_HREF)) {
      call('onOpen', destination);
    }

    expect(router.push).toHaveBeenCalledTimes(Object.keys(PROFILE_HREF).length);
    expect(PROFILE_HREF.disputes).toBe('/disputes');
    expect(PROFILE_HREF.reputation).toBe('/reputation');
    expect(PROFILE_HREF.setup).toBe('/setup');
  });

  it('mène du parcours d’installation à chacune de ses étapes', async () => {
    await render(<TechnicianSetupRoute />);

    call('onOpen', 'professional');
    call('onOpen', 'skills');
    call('onOpen', 'zone');
    call('onOpen', 'kyc');
    call('onOpen', 'planning');

    expect(router.push).toHaveBeenNthCalledWith(1, '/professional');
    expect(router.push).toHaveBeenNthCalledWith(2, '/skills');
    expect(router.push).toHaveBeenNthCalledWith(3, '/zone');
    expect(router.push).toHaveBeenNthCalledWith(4, '/kyc');
    expect(router.push).toHaveBeenNthCalledWith(5, '/planning/time-slots');
  });

  it('mène des justificatifs au parcours d’installation', async () => {
    await render(<KycRoute />);

    call('onContinue');

    expect(router.push).toHaveBeenCalledWith('/setup');
  });
});
