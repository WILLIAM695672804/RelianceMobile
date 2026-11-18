import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { QueryGate } from '@/shared/ui';

import { useRechargeWallet, useRequestWithdrawal, useWallet } from '../hooks/useWallet';
import type { PaymentMethod } from '../model/transaction';
import {
  rechargeFormSchema,
  toRechargePayload,
  toWithdrawalPayload,
  withdrawFormSchema,
} from '../schemas/walletSchemas';
import { MoneyFlowView, type PaymentSource } from '../ui/WalletViews';

/** Moyens proposés : le serveur ne conserve aucune source enregistrée. */
const METHODS: readonly PaymentMethod[] = ['momo', 'om', 'card'];
const PRESETS = {
  topUp: [5000, 10000, 25000, 50000],
  withdraw: [5000, 10000, 25000],
} as const;

export interface MoneyFlowContainerProps {
  mode: 'topUp' | 'withdraw';
  onBack: () => void;
  /** Demande enregistrée sans paiement à confirmer. */
  onDone: () => void;
  /** Paiement initié, à confirmer auprès de l'opérateur. */
  onPending: (paymentId: string) => void;
}

/** Recharge ou retrait : montant, moyen de paiement et numéro mobile money. */
export function MoneyFlowContainer({ mode, onBack, onDone, onPending }: MoneyFlowContainerProps) {
  const { t } = useTranslation();
  const wallet = useWallet();
  const recharge = useRechargeWallet();
  const withdraw = useRequestWithdrawal();
  const [formError, setFormError] = useState<string | null>(null);
  const topUp = mode === 'topUp';

  const sources: PaymentSource[] = METHODS.map((method, index) => ({
    method,
    label: t(`wallet:methods.${method}`),
    detail: t(`wallet:flow.methodDetail.${method}`),
    isDefault: index === 0,
  }));

  const submit = async (values: { amount: number; method: PaymentMethod; phone: string }) => {
    const input = { amount: String(values.amount), method: values.method, phone: values.phone };
    const parsed = (topUp ? rechargeFormSchema : withdrawFormSchema).safeParse(input);
    if (!parsed.success) {
      setFormError(t(parsed.error.issues[0]!.message));
      return;
    }
    setFormError(null);
    try {
      const result = topUp
        ? await recharge.mutateAsync(toRechargePayload(input))
        : await withdraw.mutateAsync(toWithdrawalPayload(input));
      if (result.payment_id) onPending(result.payment_id);
      else onDone();
    } catch (error) {
      setFormError(describeError(normalizeError(error), t));
    }
  };

  return (
    <QueryGate queries={[wallet]}>
      {() => (
        <MoneyFlowView
          mode={mode}
          balance={wallet.data?.available_balance ?? 0}
          sources={sources}
          presets={PRESETS[mode]}
          feeOf={() => 0}
          submitting={recharge.isPending || withdraw.isPending}
          formError={formError}
          onBack={onBack}
          onSubmit={(values) => void submit(values)}
        />
      )}
    </QueryGate>
  );
}
