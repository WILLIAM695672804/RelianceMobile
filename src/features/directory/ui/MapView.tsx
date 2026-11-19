import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/theme';
import { formatAmount, formatDistance, formatRating } from '@/shared/format';
import {
  Avatar,
  Icon,
  GeoMap,
  type GeoMapHandle,
  Pill,
  Screen,
  TAB_BAR_CLEARANCE,
  Text,
  type IconName,
} from '@/shared/ui';

import { techFacts, type TechSummary } from '@/shared/model';

export interface MapViewProps {
  technicians: readonly TechSummary[];
  /** Libellé du champ de recherche flottant (« Plombier près de Bastos »). */
  searchLabel: string;
  /** Réserve la place de la barre d'onglets lorsque la carte est un onglet. */
  withTabBar?: boolean;
  onBack?: () => void;
  onSearch: () => void;
  onFilters?: () => void;
  onRecenter?: () => void;
  onViewProfile: (tech: TechSummary) => void;
}

/** Carte des techniciens proches (maquette `MapScreen`), présentation pure. */
export function MapView(props: MapViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(props.technicians[0]?.id);
  const format = { rating: formatRating, distance: formatDistance };
  const mapRef = useRef<GeoMapHandle>(null);
  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  return (
    <Screen scroll={false} bleedBottom testID="carte">
      <View style={StyleSheet.absoluteFill}>
        <GeoMap
          ref={mapRef}
          pins={props.technicians
            .filter((tech) => tech.coordinates)
            .map((tech) => ({
              id: tech.id,
              label: tech.name,
              latitude: tech.coordinates!.latitude,
              longitude: tech.coordinates!.longitude,
              color: tech.color,
              onPress: () => setSelectedId(tech.id),
            }))}
          // Recherche en haut, panneau des techniciens en bas : le cadrage les évite.
          padding={{ top: 120, bottom: 420 }}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 }}>
        {props.onBack ? (
          <FloatingButton icon="chevronL" label={t('directory:map.back')} onPress={props.onBack} />
        ) : null}
        <Pressable
          accessibilityRole="search"
          accessibilityLabel={t('directory:map.search')}
          onPress={props.onSearch}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 14,
          }}
        >
          <IconGlyph name="search" muted />
          <Text variant="body" tone="muted" numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            {props.searchLabel}
          </Text>
          {props.onFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('directory:map.filters')}
              onPress={props.onFilters}
              hitSlop={12}
            >
              <IconGlyph name="filter" />
            </Pressable>
          ) : null}
        </Pressable>
      </View>

      <View style={{ position: 'absolute', right: 16, bottom: 300 + insets.bottom, gap: 8 }}>
        <FloatingButton icon="plus" label={t('directory:map.zoomIn')} onPress={zoomIn} />
        <FloatingButton icon="minus" label={t('directory:map.zoomOut')} onPress={zoomOut} />
        <FloatingButton
          icon="location"
          label={t('directory:map.recenter')}
          onPress={props.onRecenter}
        />
      </View>

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingTop: 8,
            paddingBottom: (props.withTabBar ? TAB_BAR_CLEARANCE : 24) + insets.bottom,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: theme.colors.surface,
          },
          theme.shadow.sheet,
        ]}
      >
        <View
          style={{
            width: 44,
            height: 5,
            borderRadius: 3,
            backgroundColor: theme.colors.border,
            alignSelf: 'center',
            marginBottom: 12,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            paddingHorizontal: 20,
            paddingBottom: 14,
          }}
        >
          <Text
            variant="section"
            accessibilityRole="header"
            style={{ flexShrink: 1, fontFamily: theme.fontFamily.display, fontSize: 18 }}
          >
            {t('directory:map.nearby', { count: props.technicians.length })}
          </Text>
          <Pill label={t('directory:map.autoMatch')} tone="primary" icon="bolt" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {props.technicians.map((tech) => {
            const selected = tech.id === selectedId;
            const fg = selected ? '#ffffff' : theme.colors.text;
            return (
              <Pressable
                key={tech.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={tech.name}
                onPress={() => setSelectedId(tech.id)}
                style={{
                  width: 240,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primary : theme.colors.background,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}
                >
                  <Avatar
                    name={tech.name}
                    color={selected ? '#ffffff' : tech.color}
                    size={38}
                    variant={selected ? 'striped' : 'solid'}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="labelStrong" numberOfLines={1} style={{ color: fg }}>
                      {tech.name}
                    </Text>
                    <Text
                      variant="caption"
                      numberOfLines={1}
                      style={{ color: fg, opacity: 0.75, fontSize: 11 }}
                    >
                      {techFacts(tech, format)}
                    </Text>
                  </View>
                </View>
                {tech.price != null ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text variant="caption" style={{ color: fg, opacity: 0.75, fontSize: 11 }}>
                      {t('directory:map.diagnosticRate')}
                    </Text>
                    <Text
                      variant="bodyStrong"
                      style={{ color: fg, fontFamily: theme.fontFamily.bodyBold, fontSize: 14 }}
                    >
                      {formatAmount(tech.price)}
                    </Text>
                  </View>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t('directory:map.viewProfile')} · ${tech.name}`}
                  onPress={() => props.onViewProfile(tech)}
                  style={{
                    marginTop: 10,
                    height: 40,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? '#ffffff' : theme.colors.text,
                  }}
                >
                  <Text
                    variant="labelStrong"
                    style={{ color: selected ? theme.colors.primary : theme.colors.background }}
                  >
                    {t('directory:map.viewProfile')}
                  </Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}

function IconGlyph({ name, muted = false }: { name: IconName; muted?: boolean }) {
  return <Icon name={name} size={18} tone={muted ? 'muted' : 'default'} />;
}

/** Bouton rond posé sur la carte (retour, filtres, zoom, recentrage). */
function FloatingButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={!onPress}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: onPress ? 1 : 0.6,
      }}
    >
      <IconGlyph name={icon} />
    </Pressable>
  );
}
