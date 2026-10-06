import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { useRechargeWallet } from '../hooks/useWallet';
import { rechargeFormSchema, toRechargePayload } from '../schemas/walletSchemas';
import { PaymentForm } from './PaymentForm';

export interface RechargeScreenProps {
  /** Demande enregistrée : retour au portefeuille. */
  onDone: () => void;
}

/** E20 — Recharge du portefeuille par mobile money, carte ou virement. */
export function RechargeScreen({ onDone }: RechargeScreenProps) {
  const { t } = useTranslation();
  const recharge = useRechargeWallet();

  return (
    <PaymentForm
      title={t('wallet:forms.rechargeTitle')}
      hint={t('wallet:forms.rechargeHint')}
      submitLabel={t('wallet:forms.submitRecharge')}
      resolver={zodResolver(rechargeFormSchema)}
      toPayload={toRechargePayload}
      submit={(payload) => recharge.mutateAsync(payload)}
      pending={recharge.isPending}
      onDone={onDone}
    />
  );
}
