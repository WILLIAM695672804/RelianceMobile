import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ReviewRoute } from './ReviewRoute';
import { WalletRoute } from './WalletRoute';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ requestId: 'r1' }),
}));

const mockWalletProps: { current?: { onTopUp: () => void; onWithdraw: () => void } } = {};
const mockReviewProps: { current?: { requestId: string; onDone: () => void } } = {};

jest.mock('@/features/wallet', () => ({
  WalletContainer: (props: { onTopUp: () => void; onWithdraw: () => void }) => {
    mockWalletProps.current = props;
    return null;
  },
}));

jest.mock('@/features/reviews', () => ({
  RatingContainer: (props: { requestId: string; onDone: () => void }) => {
    mockReviewProps.current = props;
    return null;
  },
}));

describe('routes du portefeuille et des avis', () => {
  it('ouvre la recharge et le retrait depuis le portefeuille', async () => {
    await render(<WalletRoute />);

    mockWalletProps.current?.onTopUp();
    mockWalletProps.current?.onWithdraw();

    expect(router.push).toHaveBeenCalledWith('/wallet/recharge');
    expect(router.push).toHaveBeenCalledWith('/wallet/withdraw');
  });

  it('revient en arrière après le dépôt d’un avis', async () => {
    await render(<ReviewRoute />);

    expect(mockReviewProps.current?.requestId).toBe('r1');
    mockReviewProps.current?.onDone();

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
