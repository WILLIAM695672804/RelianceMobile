import { useState } from 'react';
import { View } from 'react-native';

import { useResponsive } from '@/core/responsive';
import { useTheme } from '@/core/theme';
import {
  Avatar,
  Card,
  Fab,
  Icon,
  ImagePlaceholder,
  Pill,
  Screen,
  TabBar,
  Text,
  TopBar,
  type TabBarItem,
} from '@/shared/ui';

const CLIENT_TABS: readonly TabBarItem[] = [
  { key: 'home', label: 'Accueil', icon: 'home' },
  { key: 'map', label: 'Carte', icon: 'map' },
  { key: 'inbox', label: 'Messages', icon: 'chat' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profil', icon: 'user' },
];

const TECHNICIANS = [
  { name: 'Paul Mvondo', trade: 'Plombier · Bastos', color: '#5f3add' },
  { name: 'Awa Ndiaye', trade: 'Électricienne · Tsinga', color: '#006c49' },
  { name: 'Yves Kamga', trade: 'Climatisation · Mvog-Ada', color: '#825100' },
  { name: 'Jean Fotso', trade: 'Serrurier · Essos', color: '#ba1a1a' },
];

/** Démonstration plein écran de la barre de navigation et de sa transition liquide. */
export function TabBarDemo({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const { gutter } = useResponsive();
  const [tab, setTab] = useState('home');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Screen withTabBar testID="demo-barre">
        <TopBar title="Barre de navigation" onBack={onClose} />
        <View style={{ paddingHorizontal: gutter, gap: 12 }}>
          <View
            style={{
              borderRadius: theme.radius.card,
              padding: 20,
              gap: 8,
              backgroundColor: theme.colors.primary,
            }}
          >
            <Text variant="eyebrow" style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>
              Demande en cours
            </Text>
            <Text variant="title" style={{ color: theme.colors.onPrimary }}>
              Fuite sous l’évier
            </Text>
            <Text variant="label" style={{ color: theme.colors.onPrimary, opacity: 0.85 }}>
              Paul arrive dans 12 min
            </Text>
          </View>
          {TECHNICIANS.map((technician) => (
            <Card key={technician.name}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={technician.name} color={technician.color} size={44} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{technician.name}</Text>
                  <Text variant="caption" tone="muted">
                    {technician.trade}
                  </Text>
                </View>
                <Pill label="4,9" icon="star" tone="warning" size="sm" />
              </View>
            </Card>
          ))}
          <ImagePlaceholder label="Avant / après" tone="primary" height={160} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {(['success', 'warning', 'danger'] as const).map((tone) => (
              <View
                key={tone}
                style={{
                  flex: 1,
                  height: 90,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors[tone],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="bolt" size={26} color={theme.colors.onPrimary} />
              </View>
            ))}
          </View>
          <ImagePlaceholder label="Photo du chantier" height={220} />
        </View>
      </Screen>
      <Fab accessibilityLabel="Nouvelle demande" onPress={() => undefined} />
      <TabBar items={CLIENT_TABS} activeKey={tab} onSelect={setTab} />
    </View>
  );
}
