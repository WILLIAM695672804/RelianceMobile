import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { MAX_FONT_SCALE } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  Avatar,
  Banner,
  Button,
  Card,
  ChoiceChip,
  DetailHeader,
  Field,
  Icon,
  Pill,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';

import type { PaymentMethod } from '../model/transaction';

export interface PaymentSource {
  method: PaymentMethod;
  label: string;
  /** Numéro masqué ou fin de carte. */
  detail: string;
  isDefault?: boolean;
}

export interface WalletMovement {
  id: string;
  label: string;
  when: string;
  /** Montant signé : positif pour un crédit. */
  amount: number;
}

export interface WalletHold {
  id: string;
  label: string;
  detail: string;
  amount: number;
  progress: number;
}

const BRAND: Record<PaymentMethod, { short: string; background: string; color: string }> = {
  momo: { short: 'MTN', background: '#FFCC00', color: '#000000' },
  om: { short: 'OM', background: '#FF6600', color: '#ffffff' },
  card: { short: 'VISA', background: '#1A1F71', color: '#ffffff' },
  bank_transfer: { short: 'BQ', background: '#2b2a36', color: '#ffffff' },
};

function SourceMark({ method }: { method: PaymentMethod }) {
  const brand = BRAND[method];
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: brand.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        variant="caption"
        style={{ color: brand.color, fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' }}
      >
        {brand.short}
      </Text>
    </View>
  );
}

const signed = (amount: number) =>
  `${amount >= 0 ? '+' : '−'}${formatAmount(Math.abs(amount)).replace(/\s?FCFA$/, '')}`;

export interface WalletViewProps {
  balance: number;
  holds: readonly WalletHold[];
  sources: readonly PaymentSource[];
  movements: readonly WalletMovement[];
  onTopUp: () => void;
  onWithdraw: () => void;
  onMovement: (movement: WalletMovement) => void;
  onSettings?: () => void;
  /** Fourni, l'écran est ouvert hors des onglets : bouton retour, sans barre d'onglets. */
  onBack?: () => void;
}

/** Portefeuille (maquette `WalletScreen`), présentation pure. */
export function WalletView(props: WalletViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen withTabBar={!props.onBack} testID="portefeuille">
      <TopBar
        title={t('wallet:home.title')}
        onBack={props.onBack}
        trailing={
          props.onSettings ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('wallet:home.settings')}
              onPress={props.onSettings}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="settings" size={18} />
            </Pressable>
          ) : undefined
        }
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <View
          style={{ borderRadius: 24, padding: 22, overflow: 'hidden', backgroundColor: '#2b2a36' }}
        >
          <View
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: theme.colors.primary,
              opacity: 0.5,
            }}
          />
          <Text variant="eyebrow" style={{ color: '#ffffff', opacity: 0.7, letterSpacing: 1.5 }}>
            {t('wallet:home.available')}
          </Text>
          <View
            accessible
            accessibilityLabel={`${t('wallet:home.available')} ${formatAmount(props.balance)}`}
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}
          >
            <Text
              variant="display"
              style={{ color: '#ffffff', fontSize: 38, lineHeight: 44, letterSpacing: -1.2 }}
            >
              {formatAmount(props.balance).replace(/\s?FCFA$/, '')}
            </Text>
            <Text variant="bodyStrong" style={{ color: '#ffffff', opacity: 0.6 }}>
              FCFA
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
            <Pressable
              accessibilityRole="button"
              onPress={props.onTopUp}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#ffffff',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon name="plus" size={16} color="#2b2a36" />
              <Text variant="labelStrong" style={{ color: '#2b2a36' }}>
                {t('wallet:home.topUp')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={props.onWithdraw}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon name="send" size={16} color="#ffffff" />
              <Text variant="labelStrong" style={{ color: '#ffffff' }}>
                {t('wallet:home.withdraw')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {props.holds.length > 0 ? (
        <Section title={t('wallet:home.escrow')}>
          <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {props.holds.map((hold) => (
              <Card key={hold.id} padding={16}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: theme.tint.success,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="shield" size={18} tone="success" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="labelStrong">{hold.label}</Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {hold.detail}
                    </Text>
                  </View>
                  <Text variant="bodyStrong" style={{ fontFamily: theme.fontFamily.display }}>
                    {formatAmount(hold.amount)}
                  </Text>
                </View>
                <View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.round(hold.progress * 100)}%`,
                      height: '100%',
                      backgroundColor: theme.colors.success,
                    }}
                  />
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      {props.sources.length > 0 ? (
        <Section title={t('wallet:home.methods')}>
          <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {props.sources.map((source) => (
              <Card key={`${source.method}-${source.detail}`} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <SourceMark method={source.method} />
                  <View style={{ flex: 1 }}>
                    <Text variant="labelStrong">{source.label}</Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {source.detail}
                    </Text>
                  </View>
                  {source.isDefault ? (
                    <Pill label={t('wallet:home.default')} tone="primary" size="sm" />
                  ) : null}
                </View>
              </Card>
            ))}
          </View>
        </Section>
      ) : null}

      <Section title={t('wallet:home.recent')}>
        <View style={{ paddingHorizontal: 20 }}>
          <Card padding={0}>
            {props.movements.length === 0 ? (
              <Text variant="label" tone="muted" style={{ padding: 16 }}>
                {t('wallet:home.noMovement')}
              </Text>
            ) : (
              props.movements.map((movement, index) => {
                const credit = movement.amount >= 0;
                return (
                  <Pressable
                    key={movement.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${movement.label}, ${signed(movement.amount)} FCFA, ${movement.when}`}
                    onPress={() => props.onMovement(movement)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: theme.colors.divider,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: credit ? theme.tint.success : theme.tint.danger,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name={credit ? 'arrowUp' : 'arrowR'}
                        size={14}
                        strokeWidth={2.5}
                        tone={credit ? 'success' : 'danger'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="label" style={{ color: theme.colors.text }}>
                        {movement.label}
                      </Text>
                      <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                        {movement.when}
                      </Text>
                    </View>
                    <Text
                      variant="bodyStrong"
                      tone={credit ? 'success' : 'default'}
                      style={{ fontFamily: theme.fontFamily.display, fontSize: 14 }}
                    >
                      {signed(movement.amount)}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </Card>
        </View>
      </Section>
    </Screen>
  );
}

export interface MoneyFlowViewProps {
  /** `topUp` : recharge depuis une source ; `withdraw` : retrait vers une destination. */
  mode: 'topUp' | 'withdraw';
  balance: number;
  sources: readonly PaymentSource[];
  presets: readonly number[];
  /** Frais calculés pour un montant ; 0 s'il n'y en a pas. */
  feeOf: (amount: number) => number;
  submitting?: boolean;
  formError?: string | null;
  /** Numéro proposé pour le mobile money (celui du profil). */
  initialPhone?: string;
  onBack: () => void;
  onSubmit: (values: { amount: number; method: PaymentMethod; phone: string }) => void;
}

/** Le mobile money exige le numéro du compte à débiter ou à créditer. */
const isMobile = (method: PaymentMethod | undefined) => method === 'momo' || method === 'om';

/** Recharge ou retrait (maquettes `WalletTopUpScreen`, `WalletWithdrawScreen`). */
export function MoneyFlowView(props: MoneyFlowViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const withdraw = props.mode === 'withdraw';
  const [raw, setRaw] = useState(String(props.presets[1] ?? props.presets[0] ?? ''));
  const [method, setMethod] = useState<PaymentMethod | undefined>(
    props.sources.find((source) => source.isDefault)?.method ?? props.sources[0]?.method,
  );
  const [phone, setPhone] = useState(props.initialPhone ?? '');
  const amount = Number(raw) || 0;
  const fee = amount > 0 ? props.feeOf(amount) : 0;
  const over = withdraw && amount > props.balance;
  const mobile = isMobile(method);
  const valid = amount > 0 && !over && method != null && (!mobile || phone.trim().length > 0);
  const key = withdraw ? 'withdraw' : 'topUp';

  return (
    <Screen
      testID={withdraw ? 'retrait' : 'recharge'}
      footer={
        <Button
          label={t(`wallet:flow.${key}.submit`, {
            amount: formatAmount(withdraw ? amount : amount + fee),
          })}
          size="lg"
          full
          disabled={!valid}
          loading={props.submitting}
          onPress={() => method && props.onSubmit({ amount, method, phone: phone.trim() })}
        />
      }
    >
      <TopBar title={t(`wallet:flow.${key}.title`)} align="center" onBack={props.onBack} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 16 }}>
        {props.formError ? <Banner tone="danger" message={props.formError} /> : null}
        {withdraw ? (
          <Card padding={16}>
            <Text variant="caption" tone="muted">
              {t('wallet:home.available')}
            </Text>
            <Text variant="title">{formatAmount(props.balance)}</Text>
          </Card>
        ) : null}
        <Card padding={16}>
          <Text variant="caption" tone="muted" style={{ marginBottom: 6 }}>
            {t(`wallet:flow.${key}.amount`)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <TextInput
              accessibilityLabel={t(`wallet:flow.${key}.amount`)}
              value={raw}
              onChangeText={(text) => setRaw(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              style={{
                flex: 1,
                padding: 0,
                fontFamily: theme.fontFamily.display,
                fontSize: 36,
                color: over ? theme.colors.danger : theme.colors.text,
              }}
            />
            <Text variant="bodyStrong" tone="muted">
              FCFA
            </Text>
          </View>
          {withdraw ? (
            <Text variant="caption" tone={over ? 'danger' : 'muted'} style={{ marginTop: 6 }}>
              {over
                ? t('wallet:flow.withdraw.over')
                : t('wallet:flow.withdraw.availableHint', { amount: formatAmount(props.balance) })}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {props.presets.map((preset) => (
              <ChoiceChip
                key={preset}
                label={formatAmount(preset)}
                selected={amount === preset}
                onPress={() => setRaw(String(preset))}
              />
            ))}
            {withdraw ? (
              <ChoiceChip
                label={t('wallet:flow.withdraw.all')}
                selected={amount === props.balance}
                onPress={() => setRaw(String(props.balance))}
              />
            ) : null}
          </View>
        </Card>

        <View>
          <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1, marginBottom: 8 }}>
            {t(`wallet:flow.${key}.source`)}
          </Text>
          <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
            {props.sources.map((source) => {
              const selected = source.method === method;
              return (
                <Pressable
                  key={`${source.method}-${source.detail}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={source.label}
                  onPress={() => setMethod(source.method)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <SourceMark method={source.method} />
                  <View style={{ flex: 1 }}>
                    <Text variant="labelStrong">{source.label}</Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {source.detail}
                    </Text>
                  </View>
                  {selected ? (
                    <Icon name="check" size={18} strokeWidth={2.5} tone="primary" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {mobile ? (
          <Field
            label={t('wallet:flow.phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="6XXXXXXXX"
          />
        ) : null}

        <Card padding={0}>
          <SummaryRow label={t(`wallet:flow.${key}.amountLine`)} value={formatAmount(amount)} />
          <SummaryRow label={t(`wallet:flow.${key}.fee`)} value={formatAmount(fee)} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 14,
              backgroundColor: withdraw ? theme.tint.success : theme.tint.primary,
            }}
          >
            <Text variant="labelStrong">{t(`wallet:flow.${key}.total`)}</Text>
            <Text variant="section" style={{ fontFamily: theme.fontFamily.display }}>
              {formatAmount(withdraw ? Math.max(amount - fee, 0) : amount + fee)}
            </Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}
    >
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="labelStrong" style={{ fontFamily: theme.fontFamily.display }}>
        {value}
      </Text>
    </View>
  );
}

export interface OtpViewProps {
  /** Numéro de destination, masqué. */
  destination: string;
  length?: number;
  /** Délai avant de pouvoir renvoyer le code, en secondes. */
  resendDelay?: number;
  verifying?: boolean;
  error?: string | null;
  onBack: () => void;
  onResend: () => void;
  onComplete: (code: string) => void;
}

/** Saisie d'un code reçu par SMS (maquette `WalletOTPScreen`), présentation pure. */
export function OtpView({
  destination,
  length = 6,
  resendDelay = 58,
  verifying = false,
  error,
  onBack,
  onResend,
  onComplete,
}: OtpViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(resendDelay);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const change = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, length);
    setCode(digits);
    if (digits.length === length) onComplete(digits);
  };

  return (
    <Screen testID="code-sms">
      <DetailHeader title={t('wallet:otp.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: 24, paddingTop: 32, gap: 14, alignItems: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            backgroundColor: theme.tint.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="phone" size={32} tone="primary" />
        </View>
        <Text variant="title" accessibilityRole="header" align="center">
          {t('wallet:otp.heading')}
        </Text>
        <Text variant="label" tone="muted" align="center">
          {t('wallet:otp.sentTo', { destination })}
        </Text>
        <Pressable
          accessibilityRole="none"
          onPress={() => input.current?.focus()}
          style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}
        >
          {Array.from({ length }, (_, index) => {
            const filled = index < code.length;
            const focused = index === code.length;
            return (
              <View
                key={index}
                style={{
                  width: 46,
                  height: 56,
                  borderRadius: 12,
                  borderWidth: focused ? 2 : 1,
                  borderColor: error
                    ? theme.colors.danger
                    : focused
                      ? theme.colors.primary
                      : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="title">{filled ? code[index]! : ''}</Text>
              </View>
            );
          })}
        </Pressable>
        <TextInput
          ref={input}
          accessibilityLabel={t('wallet:otp.label')}
          value={code}
          onChangeText={change}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          autoFocus
          maxLength={length}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        />
        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : null}
        {verifying ? (
          <Text variant="caption" tone="muted">
            {t('wallet:otp.verifying')}
          </Text>
        ) : seconds > 0 ? (
          <Text variant="caption" tone="muted">
            {t('wallet:otp.resendIn', { seconds })}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSeconds(resendDelay);
              onResend();
            }}
            style={{ minHeight: 48, justifyContent: 'center' }}
          >
            <Text variant="labelStrong" tone="primary">
              {t('wallet:otp.resend')}
            </Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

export interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  status: string;
  rows: readonly { label: string; value: string; detail?: string; person?: boolean }[];
  breakdown: readonly { label: string; amount: number; muted?: boolean }[];
  note: string | null;
}

export interface TransactionViewProps {
  transaction: TransactionDetail;
  onBack: () => void;
  onReceipt?: () => void;
  onReport?: () => void;
}

/** Détail d'un mouvement (maquette `TransactionDetailScreen`), présentation pure. */
export function TransactionView({
  transaction,
  onBack,
  onReceipt,
  onReport,
}: TransactionViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const credit = transaction.amount >= 0;

  return (
    <Screen testID="transaction">
      <DetailHeader title={t('wallet:movement.title')} onBack={onBack} />
      <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 20, gap: 8 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: credit ? theme.tint.success : theme.tint.danger,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={credit ? 'arrowUp' : 'arrowR'}
            size={24}
            strokeWidth={2.5}
            tone={credit ? 'success' : 'danger'}
          />
        </View>
        <Text variant="label" tone="muted">
          {transaction.type}
        </Text>
        <Text variant="display" tone={credit ? 'success' : 'default'} accessibilityRole="header">
          {`${signed(transaction.amount)} FCFA`}
        </Text>
        <Pill label={transaction.status} tone="success" size="sm" icon="check" />
      </View>
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Card padding={0}>
          {transaction.rows.map((row, index) => (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
              }}
            >
              <Text variant="label" tone="muted" style={{ flex: 1 }}>
                {row.label}
              </Text>
              {row.person ? <Avatar name={row.value} size={28} /> : null}
              <View style={{ alignItems: 'flex-end', maxWidth: '60%' }}>
                <Text variant="labelStrong" numberOfLines={1}>
                  {row.value}
                </Text>
                {row.detail ? (
                  <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                    {row.detail}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
        {transaction.breakdown.length > 0 ? (
          <Card padding={0}>
            <Text
              variant="eyebrow"
              tone="muted"
              style={{ letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}
            >
              {t('wallet:movement.breakdown')}
            </Text>
            {transaction.breakdown.map((line) => (
              <View
                key={line.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.divider,
                }}
              >
                <Text variant="label" tone={line.muted ? 'muted' : 'default'}>
                  {line.label}
                </Text>
                <Text
                  variant="labelStrong"
                  tone={line.muted ? 'muted' : 'default'}
                  style={{ fontFamily: theme.fontFamily.display }}
                >
                  {formatAmount(line.amount)}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}
        {transaction.note ? (
          <Card padding={14}>
            <Text variant="eyebrow" tone="muted" style={{ letterSpacing: 1, marginBottom: 6 }}>
              {t('wallet:movement.note')}
            </Text>
            <Text variant="label">{transaction.note}</Text>
          </Card>
        ) : null}
        {onReceipt || onReport ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {onReceipt ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('wallet:movement.receipt')}
                  variant="ghost"
                  full
                  onPress={onReceipt}
                />
              </View>
            ) : null}
            {onReport ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('wallet:movement.report')}
                  variant="ghost"
                  full
                  onPress={onReport}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
