import { router } from 'expo-router';

import { InboxContainer } from '@/features/chat';
import { AccountContainer } from '@/features/profile';
import { WalletContainer } from '@/features/wallet';

import { appVersion } from '../appVersion';
import { PROFILE_HREF } from './ProfileRoute';

/** Onglet « Messages », commun aux trois rôles. */
export function InboxTab() {
  return (
    <InboxContainer
      onOpen={(id) => router.push({ pathname: '/conversations/[id]', params: { id } })}
      onNew={() => router.push('/conversations/new')}
    />
  );
}

/** Onglet « Portefeuille » / « Gains ». */
export function WalletTab() {
  return (
    <WalletContainer
      onTopUp={() => router.push('/wallet/recharge')}
      onWithdraw={() => router.push('/wallet/withdraw')}
      onMovement={(id) => router.push({ pathname: '/wallet/transactions/[id]', params: { id } })}
    />
  );
}

/** Onglet « Profil », commun aux trois rôles. */
export function AccountTab() {
  return (
    <AccountContainer
      appVersion={appVersion}
      onOpen={(destination) => router.push(PROFILE_HREF[destination])}
    />
  );
}
