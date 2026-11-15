import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { MIN_TOUCH_TARGET, useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import type { TechSummary } from '@/shared/model';
import { formatAmount, formatDistance, formatRating } from '@/shared/format';
import {
  Avatar,
  Card,
  initialsOf,
  PhaseBar,
  VerifiedMark,
  Icon,
  IllustratedMap,
  Screen,
  Section,
  Text,
} from '@/shared/ui';

import type { ServiceCategory } from '../model/categories';

export interface ActiveIntervention {
  requestId: string;
  technicianName: string;
  title: string;
  /** Phase courante, de 1 à `phaseCount`. */
  phase: number;
  phaseCount: number;
  phaseLabel: string;
  statusLabel: string;
}

export interface ClientHomeViewProps {
  firstName: string;
  hasUnreadNotifications: boolean;
  categories: readonly ServiceCategory[];
  nearby: { count: number; area: string } | null;
  recommended: readonly TechSummary[];
  active: ActiveIntervention | null;
  onNotifications: () => void;
  onNewRequest: () => void;
  onCategory: (slug: string) => void;
  onAllCategories: () => void;
  onMap: () => void;
  onTech: (tech: TechSummary) => void;
  onAllTechs: () => void;
  onOpenActive: (requestId: string) => void;
  onChatActive: (requestId: string) => void;
}

/** Accueil client (maquette `ClientHomeScreen`), présentation pure. */
export function ClientHomeView(props: ClientHomeViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gutter, columns } = useResponsive();
  const dark = theme.scheme === 'dark';
  const cols = columns(100, 10, 4);

  const link = (label: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' }}
    >
      <Text variant="label" tone="primary">
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen withTabBar testID="accueil-client">
      <View
        style={{
          paddingHorizontal: gutter,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={props.firstName} size={42} />
          <View>
            <Text variant="caption" tone="muted" style={{ fontFamily: theme.fontFamily.body }}>
              {t('requests:home2.hello')}
            </Text>
            <Text variant="bodyStrong">{props.firstName}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('requests:home2.notifications')}
          accessibilityHint={props.hasUnreadNotifications ? t('requests:home2.unread') : undefined}
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
          {props.hasUnreadNotifications ? (
            <View
              testID="pastille-notifications"
              style={{
                position: 'absolute',
                top: 10,
                right: 11,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.danger,
              }}
            />
          ) : null}
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingTop: 12, paddingBottom: 4 }}>
        <Text
          variant="display"
          accessibilityRole="header"
          style={{ fontSize: 28, lineHeight: 31, letterSpacing: -0.8 }}
        >
          {t('requests:home2.title')}
        </Text>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingTop: 14, paddingBottom: 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('requests:home2.newRequest')}
          accessibilityHint={t('requests:home2.newRequestHint')}
          onPress={props.onNewRequest}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 18,
            borderRadius: 20,
            backgroundColor: dark ? '#ffffff' : '#2b2a36',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={24} strokeWidth={2.5} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              variant="bodyStrong"
              style={{
                color: dark ? '#2b2a36' : '#ffffff',
                fontFamily: theme.fontFamily.bodyBold,
                fontSize: 16,
              }}
            >
              {t('requests:home2.newRequest')}
            </Text>
            <Text
              variant="caption"
              style={{ color: dark ? '#2b2a36' : '#ffffff', opacity: 0.7, marginTop: 2 }}
            >
              {t('requests:home2.newRequestHint')}
            </Text>
          </View>
          <Icon name="arrowR" size={20} color={dark ? '#2b2a36' : '#ffffff'} />
        </Pressable>
      </View>

      <Section
        title={t('requests:home2.categories')}
        action={link(t('requests:home2.seeAll'), props.onAllCategories)}
      >
        <View
          style={{ paddingHorizontal: gutter, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
        >
          {props.categories.map((category) => {
            const color = category.color ?? theme.colors.primary;
            return (
              <Pressable
                key={category.slug}
                accessibilityRole="button"
                accessibilityLabel={category.label}
                onPress={() => props.onCategory(category.slug)}
                style={({ pressed }) => ({
                  width: `${100 / cols - 3}%`,
                  flexGrow: 1,
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 16,
                  paddingHorizontal: 8,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${color}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={category.icon} size={22} color={color} />
                </View>
                <Text
                  variant="caption"
                  align="center"
                  numberOfLines={1}
                  style={{ color: theme.colors.text }}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {props.nearby ? (
        <Section
          title={t('requests:home2.nearby')}
          action={link(t('requests:home2.seeMap'), props.onMap)}
        >
          <View style={{ paddingHorizontal: gutter }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('requests:home2.seeMap')}
              onPress={props.onMap}
              style={{ height: 160, borderRadius: 22, overflow: 'hidden' }}
            >
              <IllustratedMap
                compact
                pins={props.recommended
                  .filter((tech) => tech.mapPoint)
                  .map((tech) => ({
                    id: tech.id,
                    label: initialsOf(tech.name),
                    x: tech.mapPoint!.x,
                    y: tech.mapPoint!.y,
                    color: tech.color,
                  }))}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <Icon name="pin" size={18} tone="primary" />
                <View style={{ flex: 1 }}>
                  <Text
                    variant="caption"
                    style={{ fontFamily: theme.fontFamily.bodySemiBold, color: theme.colors.text }}
                  >
                    {t('requests:home2.available', { count: props.nearby.count })}
                  </Text>
                  <Text
                    variant="caption"
                    tone="muted"
                    style={{ fontFamily: theme.fontFamily.body }}
                  >
                    {props.nearby.area}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        </Section>
      ) : null}

      {props.recommended.length > 0 ? (
        <Section
          title={t('requests:home2.recommended')}
          action={link(t('requests:home2.more'), props.onAllTechs)}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: gutter, gap: 12 }}
          >
            {props.recommended.slice(0, 6).map((tech) => (
              <Card
                key={tech.id}
                padding={14}
                onPress={() => props.onTech(tech)}
                accessibilityLabel={tech.name}
                style={{ width: 200 }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}
                >
                  <Avatar name={tech.name} color={tech.color} size={40} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="labelStrong" numberOfLines={1}>
                      {tech.name}
                    </Text>
                    <Text variant="caption" tone="muted" numberOfLines={1} style={{ fontSize: 11 }}>
                      {tech.skill}
                    </Text>
                  </View>
                  {tech.verified ? <VerifiedMark /> : null}
                </View>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}
                >
                  <Icon name="star" size={13} tone="warning" />
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.text, fontFamily: theme.fontFamily.bodySemiBold }}
                  >
                    {tech.rating != null ? formatRating(tech.rating) : '—'}
                  </Text>
                  {tech.jobs != null ? (
                    <Text variant="caption" tone="muted">
                      · {t('requests:home2.jobs', { count: tech.jobs })}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.divider,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={12} tone="muted" />
                    <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                      {tech.distanceKm != null ? formatDistance(tech.distanceKm) : '—'}
                    </Text>
                  </View>
                  {tech.price != null ? (
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.text,
                        fontFamily: theme.fontFamily.bodySemiBold,
                        fontSize: 11,
                      }}
                    >
                      {formatAmount(tech.price)}
                    </Text>
                  ) : null}
                </View>
              </Card>
            ))}
          </ScrollView>
        </Section>
      ) : null}

      {props.active ? (
        <Section title={t('requests:home2.ongoing')}>
          <View style={{ paddingHorizontal: gutter }}>
            <Card
              padding={0}
              onPress={() => props.onOpenActive(props.active!.requestId)}
              accessibilityLabel={props.active.title}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <Avatar name={props.active.technicianName} size={44} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                    {props.active.technicianName}
                  </Text>
                  <Text
                    variant="caption"
                    tone="muted"
                    style={{ fontFamily: theme.fontFamily.body }}
                  >
                    {t('requests:home2.activeLine', {
                      title: props.active.title,
                      phase: props.active.phase,
                      count: props.active.phaseCount,
                    })}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('requests:home2.chat', {
                    name: props.active.technicianName,
                  })}
                  onPress={() => props.onChatActive(props.active!.requestId)}
                  hitSlop={5}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="chat" size={18} tone="onPrimary" />
                </Pressable>
              </View>
              <View style={{ padding: 16 }}>
                <PhaseBar phase={props.active.phase} count={props.active.phaseCount} />
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}
                >
                  <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                    {props.active.phaseLabel}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      fontSize: 11,
                      color: theme.colors.text,
                      fontFamily: theme.fontFamily.bodySemiBold,
                    }}
                  >
                    {props.active.statusLabel}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </Section>
      ) : null}
    </Screen>
  );
}
