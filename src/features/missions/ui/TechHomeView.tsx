import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import { formatAmount, formatDistance } from '@/shared/format';
import { Avatar, Button, Card, EmptyState, Icon, Pill, Screen, Section, Text } from '@/shared/ui';

export interface IncomingRequest {
  id: string;
  client: string;
  category: string;
  when: string;
  distanceKm: number | null;
  etaMin: number | null;
  price: number | null;
}

export interface AgendaSlot {
  id: string;
  time: string;
  title: string;
  detail: string;
  state: 'done' | 'active' | 'todo';
}

export interface TechHomeViewProps {
  firstName: string;
  online: boolean;
  today: { earnings: number; missions: number; rating: string; time: string };
  /** Période du bandeau de gains ; « Aujourd'hui » par défaut. */
  periodLabel?: string;
  /** Libellé de la troisième mesure ; « temps » par défaut. */
  timeLabel?: string;
  incoming: readonly IncomingRequest[];
  agenda: readonly AgendaSlot[];
  respondingId?: string | null;
  onNotifications: () => void;
  onAccept: (request: IncomingRequest) => void;
  onDecline: (request: IncomingRequest) => void;
  onOpenSlot?: (slot: AgendaSlot) => void;
  onPlanning?: () => void;
}

/** Accueil technicien (maquette `TechHomeScreen`), présentation pure. */
export function TechHomeView(props: TechHomeViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gutter } = useResponsive();

  return (
    <Screen withTabBar testID="accueil-technicien">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: gutter,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={props.firstName} size={42} />
          <View>
            <Text variant="caption" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
              {t('missions:techHome.hello')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="bodyStrong">{props.firstName}</Text>
              <Pill
                label={t(props.online ? 'missions:techHome.online' : 'missions:techHome.offline')}
                tone={props.online ? 'success' : 'neutral'}
                size="sm"
              />
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('missions:techHome.notifications')}
          onPress={props.onNotifications}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="bell" size={20} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingTop: 8, paddingBottom: 20 }}>
        <View
          style={{ borderRadius: 24, padding: 20, backgroundColor: '#2b2a36', overflow: 'hidden' }}
        >
          <View
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: theme.colors.primary,
              opacity: 0.55,
            }}
          />
          <Text variant="eyebrow" style={{ color: '#ffffff', opacity: 0.7, letterSpacing: 1.5 }}>
            {props.periodLabel ?? t('missions:techHome.today')}
          </Text>
          <Text
            variant="display"
            style={{ color: '#ffffff', marginTop: 4, fontSize: 34, lineHeight: 38 }}
          >
            {formatAmount(props.today.earnings)}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
            {[
              { value: String(props.today.missions), label: t('missions:techHome.missions') },
              { value: props.today.rating, label: t('missions:techHome.rating') },
              { value: props.today.time, label: props.timeLabel ?? t('missions:techHome.time') },
            ].map((stat) => (
              <View key={stat.label} style={{ flex: 1 }}>
                <Text
                  variant="section"
                  style={{ color: '#ffffff', fontFamily: theme.fontFamily.display }}
                >
                  {stat.value}
                </Text>
                <Text variant="caption" style={{ color: '#ffffff', opacity: 0.65, fontSize: 11 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Section
        title={t('missions:techHome.incoming', { count: props.incoming.length })}
        action={
          props.incoming.length > 0 ? (
            <Pill label={t('missions:techHome.respondQuickly')} tone="warning" size="sm" />
          ) : undefined
        }
      >
        <View style={{ paddingHorizontal: gutter, gap: 10 }}>
          {props.incoming.length === 0 ? (
            <Card padding={16}>
              <Text variant="label" tone="muted">
                {t('missions:techHome.noIncoming')}
              </Text>
            </Card>
          ) : (
            props.incoming.map((request) => (
              <Card key={request.id} padding={0}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                  <Avatar name={request.client} size={36} color="#888888" />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="labelStrong" numberOfLines={1}>
                      {request.client}
                    </Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {request.category} · {request.when}
                    </Text>
                  </View>
                  {request.price != null ? (
                    <Text variant="bodyStrong" style={{ fontFamily: theme.fontFamily.display }}>
                      {formatAmount(request.price)}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 14,
                    paddingHorizontal: 14,
                    paddingBottom: 10,
                  }}
                >
                  {request.distanceKm != null ? (
                    <Fact icon="pin" label={formatDistance(request.distanceKm)} />
                  ) : null}
                  {request.etaMin != null ? (
                    <Fact icon="clock" label={`${request.etaMin} min`} />
                  ) : null}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    padding: 14,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.divider,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Button
                      label={t('missions:techHome.decline')}
                      variant="ghost"
                      size="sm"
                      full
                      disabled={props.respondingId != null}
                      onPress={() => props.onDecline(request)}
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Button
                      label={t('missions:techHome.accept')}
                      size="sm"
                      full
                      loading={props.respondingId === request.id}
                      disabled={props.respondingId != null && props.respondingId !== request.id}
                      onPress={() => props.onAccept(request)}
                      accessibilityLabel={`${t('missions:techHome.accept')} · ${request.client}`}
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </Section>

      <Section
        title={t('missions:techHome.agenda')}
        action={
          props.onPlanning ? (
            <Pressable
              accessibilityRole="link"
              onPress={props.onPlanning}
              style={{ minHeight: 48, justifyContent: 'center' }}
            >
              <Text variant="label" tone="primary">
                {t('missions:techHome.planning')}
              </Text>
            </Pressable>
          ) : undefined
        }
      >
        <View style={{ paddingHorizontal: gutter }}>
          {props.agenda.length === 0 ? (
            <EmptyState
              icon="calendar"
              tone="neutral"
              title={t('missions:techHome.freeTitle')}
              message={t('missions:techHome.freeBody')}
            />
          ) : (
            <Card padding={0}>
              {props.agenda.map((slot, index) => (
                <Pressable
                  key={slot.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${slot.time} · ${slot.title}`}
                  disabled={!props.onOpenSlot}
                  onPress={() => props.onOpenSlot?.(slot)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.divider,
                    opacity: slot.state === 'done' ? 0.6 : 1,
                  }}
                >
                  <Text
                    variant="labelStrong"
                    style={{ width: 46, fontFamily: theme.fontFamily.display }}
                  >
                    {slot.time}
                  </Text>
                  <View
                    style={{
                      width: 3,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      backgroundColor:
                        slot.state === 'active' ? theme.colors.primary : theme.colors.border,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="labelStrong">{slot.title}</Text>
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {slot.detail}
                    </Text>
                  </View>
                  {slot.state === 'active' ? (
                    <Pill label={t('missions:techHome.ongoing')} tone="primary" size="sm" />
                  ) : null}
                  {slot.state === 'done' ? (
                    <Icon name="check" size={16} strokeWidth={2.5} tone="success" />
                  ) : null}
                </Pressable>
              ))}
            </Card>
          )}
        </View>
      </Section>
    </Screen>
  );
}

function Fact({ icon, label }: { icon: 'pin' | 'clock'; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={11} tone="muted" />
      <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}
