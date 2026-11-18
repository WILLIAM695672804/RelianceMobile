/**
 * Feature `wallet` — portefeuille (E19), recharge (E20) et retrait (E21).
 * @packageDocumentation
 */

export { walletKeys } from './hooks/walletKeys';
export { useCaptureHold, useHolds, usePlaceHold, useReleaseHold } from './hooks/useHolds';
export { useConfirmPayment, usePayment } from './hooks/usePayments';
export {
  useRechargeWallet,
  useRequestWithdrawal,
  useWallet,
  useWalletSync,
  useWalletTransactions,
} from './hooks/useWallet';
export { walletTranslations } from './i18n';
export { holdForRequest } from './model/holdForRequest';
export { isMobileMethod, PAYMENT_METHODS, transactionToneOf } from './model/transaction';
export {
  PaymentConfirmationScreen,
  type PaymentConfirmationScreenProps,
} from './screens/PaymentConfirmationScreen';
export { HOLD_MIN_AMOUNT, isHoldActive, type Hold, type HoldStatus } from './schemas/holdSchemas';
export { isPaymentPending, type Payment, type PaymentStatus } from './schemas/paymentSchemas';
export type { PaymentPayload, Transaction, Wallet } from './schemas/walletSchemas';
export {
  MoneyFlowView,
  OtpView,
  TransactionView,
  WalletView,
  type MoneyFlowViewProps,
  type OtpViewProps,
  type PaymentSource,
  type TransactionDetail,
  type TransactionViewProps,
  type WalletHold,
  type WalletMovement,
  type WalletViewProps,
} from './ui/WalletViews';
export { WalletContainer, type WalletContainerProps } from './containers/WalletContainer';
export { MoneyFlowContainer, type MoneyFlowContainerProps } from './containers/MoneyFlowContainer';
export {
  TransactionContainer,
  toTransactionDetail,
  type TransactionContainerProps,
} from './containers/TransactionContainer';
