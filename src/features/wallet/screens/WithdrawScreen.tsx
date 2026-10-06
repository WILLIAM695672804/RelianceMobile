import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { useRequestWithdrawal } from '../hooks/useWallet';
import { toWithdrawalPayload, withdrawFormSchema } from '../schemas/walletSchemas';
import { PaymentForm } from './PaymentForm';

export interface WithdrawScreenProps {
  /** Demande enregistrée : retour au portefeuille. */
  onDone: () => void;
}

/** E21 — Demande de retrait du solde disponible. */
export function WithdrawScreen({ onDone }: WithdrawScreenProps) {
  const { t } = useTranslation();
  const withdrawal = useRequestWithdrawal();

  return (
    <PaymentForm
      title={t('wallet:forms.withdrawTitle')}
      hint={t('wallet:forms.withdrawHint')}
      submitLabel={t('wallet:forms.submitWithdraw')}
      resolver={zodResolver(withdrawFormSchema)}
      toPayload={toWithdrawalPayload}
      submit={(payload) => withdrawal.mutateAsync(payload)}
      pending={withdrawal.isPending}
      onDone={onDone}
    />
  );
}
