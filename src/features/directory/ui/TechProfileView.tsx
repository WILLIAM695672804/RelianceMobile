import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Pattern, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/core/theme';
import { formatAmount, formatRating } from '@/shared/format';
import type { TechSummary } from '@/shared/model';
import {
  Avatar,
  Button,
  Card,
  Icon,
  GeoMap,
  type GeoPoint,
  ImagePlaceholder,
  Pill,
  Screen,
  Segmented,
  Stars,
  Text,
  type IconName,
} from '@/shared/ui';

export interface TechProfile extends TechSummary {
  city: string | null;
  bio: string | null;
  skills: readonly string[];
  /** Taux de réussite affiché (« 98 % ») ; absent, la tuile affiche un tiret. */
  successRate: string | null;
  kycApproved: boolean;
  /** Distinction mise en avant (« Top 10 »). */
  highlight: string | null;
  /** Zone d'intervention déclarée : centre et rayon. */
  zone?: { center: GeoPoint; radiusKm: number } | null;
}

export interface TechWork {
  id: string;
  title: string;
  likes: number;
  comments: number;
}

export interface TechReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  when: string;
}

export interface TechProfileViewProps {
  tech: TechProfile;
  works: readonly TechWork[];
  reviews: readonly TechReview[];
  saved?: boolean;
  onToggleSaved?: () => void;
  onBack: () => void;
  onMessage: () => void;
  onBook: () => void;
}

type Tab = 'about' | 'work' | 'reviews';

/** Profil public d'un technicien (maquette `TechProfileScreen`), présentation pure. */
export function TechProfileView(props: TechProfileViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('about');
  const { tech } = props;
  const color = tech.color ?? theme.colors.primary;
  const ids = useId().replace(/[^a-zA-Z0-9]/g, '');

  const stats: {
    value: string;
    label: string;
    icon: IconName;
    tone: 'warning' | 'success' | 'primary';
  }[] = [
    {
      value: tech.rating != null ? formatRating(tech.rating) : '—',
      label: t('directory:profile.rating'),
      icon: 'star',
      tone: 'warning',
    },
    {
      value: tech.jobs != null ? String(tech.jobs) : '—',
      label: t('directory:profile.jobs'),
      icon: 'check',
      tone: 'success',
    },
    {
      value: tech.successRate ?? '—',
      label: t('directory:profile.success'),
      icon: 'shield',
      tone: 'primary',
    },
  ];

  const roundButton = (icon: IconName, label: string, onPress?: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={!onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={18} color="#ffffff" />
    </Pressable>
  );

  return (
    <Screen
      testID="profil-technicien"
      footer={
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('directory:profile.message')}
            onPress={props.onMessage}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="chat" size={20} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Button
              label={
                tech.price != null
                  ? t('directory:profile.book', { price: formatAmount(tech.price) })
                  : t('directory:profile.bookNoPrice')
              }
              size="lg"
              full
              onPress={props.onBook}
            />
          </View>
        </View>
      }
    >
      <View
        style={{
          height: 220 - insets.top,
          marginTop: -insets.top,
          paddingTop: insets.top,
          overflow: 'hidden',
        }}
      >
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id={`fond${ids}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} />
              <Stop offset="1" stopColor={color} stopOpacity={0.86} />
            </LinearGradient>
            <Pattern id={`points${ids}`} patternUnits="userSpaceOnUse" width={14} height={14}>
              <Circle cx={7} cy={7} r={1} fill="rgba(255,255,255,0.3)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#fond${ids})`} />
          <Rect width="100%" height="100%" fill={`url(#points${ids})`} opacity={0.25} />
        </Svg>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          {roundButton('chevronL', t('directory:profile.back'), props.onBack)}
          {props.onToggleSaved
            ? roundButton(
                'bookmark',
                t(props.saved ? 'directory:profile.saved' : 'directory:profile.save'),
                props.onToggleSaved,
              )
            : null}
        </View>
      </View>

      <View style={{ marginTop: -54, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              padding: 4,
              backgroundColor: '#ffffff',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Avatar name={tech.name} color={color} size={88} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 6 }}>
            {tech.kycApproved ? (
              <Pill label={t('directory:profile.kyc')} tone="success" size="sm" icon="shield" />
            ) : null}
            {tech.highlight ? <Pill label={tech.highlight} size="sm" icon="badge" /> : null}
          </View>
        </View>
        <Text
          variant="headline"
          accessibilityRole="header"
          style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.5 }}
        >
          {tech.name}
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: 4, fontSize: 14 }}>
          {[tech.skill, tech.city].filter(Boolean).join(' · ')}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              accessible
              accessibilityLabel={`${stat.label} : ${stat.value}`}
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name={stat.icon} size={13} tone={stat.tone} />
                <Text
                  variant="bodyStrong"
                  style={{ fontFamily: theme.fontFamily.display, fontSize: 16 }}
                >
                  {stat.value}
                </Text>
              </View>
              <Text variant="caption" tone="muted" style={{ fontSize: 10, marginTop: 2 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 22 }}>
          <Segmented
            items={(['about', 'work', 'reviews'] as const).map((key) => ({
              key,
              label: t(`directory:profile.tabs.${key}`),
            }))}
            activeKey={tab}
            onSelect={(key) => setTab(key as Tab)}
          />
        </View>

        {tab === 'about' ? (
          <View style={{ marginTop: 16 }}>
            {tech.bio ? (
              <Text variant="body" tone="muted" style={{ fontSize: 14, lineHeight: 22 }}>
                {tech.bio}
              </Text>
            ) : null}
            {tech.skills.length > 0 ? (
              <>
                <Eyebrow>{t('directory:profile.skills')}</Eyebrow>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tech.skills.map((skill) => (
                    <Pill key={skill} label={skill} />
                  ))}
                </View>
              </>
            ) : null}
            <Eyebrow>{t('directory:profile.zone')}</Eyebrow>
            <View style={{ height: 160, borderRadius: 14, overflow: 'hidden' }}>
              <GeoMap
                compact
                zoneCenter={tech.zone?.center ?? null}
                radiusKm={tech.zone?.radiusKm ?? null}
                you={tech.zone?.center ?? null}
              />
            </View>
          </View>
        ) : null}

        {tab === 'work' ? (
          props.works.length === 0 ? (
            <Text variant="body" tone="muted" style={{ marginTop: 16 }}>
              {t('directory:profile.noWork')}
            </Text>
          ) : (
            <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {props.works.map((work) => (
                <View
                  key={work.id}
                  style={{
                    width: '48%',
                    flexGrow: 1,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    overflow: 'hidden',
                  }}
                >
                  <ImagePlaceholder label={work.title} height={120} radius={0} />
                  <View style={{ padding: 10 }}>
                    <Text
                      variant="caption"
                      numberOfLines={1}
                      style={{
                        color: theme.colors.text,
                        fontFamily: theme.fontFamily.bodySemiBold,
                        marginBottom: 4,
                      }}
                    >
                      {work.title}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Counter icon="heart" value={work.likes} />
                      <Counter icon="chat" value={work.comments} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : null}

        {tab === 'reviews' ? (
          props.reviews.length === 0 ? (
            <Text variant="body" tone="muted" style={{ marginTop: 16 }}>
              {t('directory:profile.noReviews')}
            </Text>
          ) : (
            <View style={{ marginTop: 16, gap: 10 }}>
              {props.reviews.map((review) => (
                <Card key={review.id} padding={14}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Avatar name={review.author} size={32} color="#888888" />
                    <View style={{ flex: 1 }}>
                      <Text variant="labelStrong">{review.author}</Text>
                      <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                        {review.when}
                      </Text>
                    </View>
                    <Stars value={review.rating} />
                  </View>
                  <Text
                    variant="label"
                    tone="muted"
                    style={{ marginTop: 8, lineHeight: 20, fontFamily: theme.fontFamily.body }}
                  >
                    {review.text}
                  </Text>
                </Card>
              ))}
            </View>
          )
        ) : null}
      </View>
    </Screen>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <Text
      variant="eyebrow"
      tone="muted"
      style={{ letterSpacing: 1, marginTop: 18, marginBottom: 8 }}
    >
      {children}
    </Text>
  );
}

function Counter({ icon, value }: { icon: IconName; value: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Icon name={icon} size={11} tone="muted" />
      <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
        {value}
      </Text>
    </View>
  );
}
