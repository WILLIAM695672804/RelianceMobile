import { useState, type ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';

import { useResponsive } from '@/core/responsive';
import { ThemeProvider, useTheme, type ColorScheme } from '@/core/theme';
import {
  Avatar,
  Button,
  Card,
  Fab,
  Field,
  Icon,
  ImagePlaceholder,
  Pill,
  Screen,
  Section,
  TabBar,
  Text,
  TEXT_VARIANTS,
  type TabBarItem,
  type TextVariant,
} from '@/shared/ui';

const CLIENT_TABS: readonly TabBarItem[] = [
  { key: 'home', label: 'Accueil', icon: 'home' },
  { key: 'map', label: 'Carte', icon: 'map' },
  { key: 'inbox', label: 'Messages', icon: 'chat' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'profile', label: 'Profil', icon: 'user' },
];

const SWATCHES = [
  'background',
  'surfaceMuted',
  'surfaceHigh',
  'text',
  'textMuted',
  'border',
  'primary',
  'primaryFixed',
  'onPrimaryFixed',
  'success',
  'warning',
  'danger',
] as const;

/** Catalogue de développement (hors production) : primitives Clean Lavender, clair et sombre. */
export function CatalogueScreen() {
  const system = useColorScheme();
  const [scheme, setScheme] = useState<ColorScheme>(system === 'dark' ? 'dark' : 'light');
  return (
    <ThemeProvider scheme={scheme}>
      <Catalogue
        scheme={scheme}
        onToggle={() => setScheme((current) => (current === 'light' ? 'dark' : 'light'))}
      />
    </ThemeProvider>
  );
}

function Row({ children }: { children: ReactNode }) {
  const { gutter } = useResponsive();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: gutter,
      }}
    >
      {children}
    </View>
  );
}

function Catalogue({ scheme, onToggle }: { scheme: ColorScheme; onToggle: () => void }) {
  const theme = useTheme();
  const { gutter } = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('motdepasse');
  const [tab, setTab] = useState('home');

  return (
    <Screen testID="catalogue">
      <View style={{ paddingHorizontal: gutter, paddingVertical: 20, gap: 12 }}>
        <Text variant="eyebrow" tone="muted">
          Reliance · Socle visuel
        </Text>
        <Text variant="display" accessibilityRole="header">
          Catalogue
        </Text>
        <Button
          label={scheme === 'light' ? 'Passer en thème sombre' : 'Passer en thème clair'}
          icon={scheme === 'light' ? 'moon' : 'sun'}
          variant="soft"
          size="sm"
          onPress={onToggle}
          testID="bascule-theme"
        />
      </View>

      <Section title="Typographie">
        <View style={{ paddingHorizontal: gutter, gap: 6 }}>
          {(Object.keys(TEXT_VARIANTS) as TextVariant[]).map((variant) => (
            <Text key={variant} variant={variant}>
              {variant} · Le bon technicien
            </Text>
          ))}
        </View>
      </Section>

      <Section title="Couleurs">
        <Row>
          {SWATCHES.map((name) => (
            <View key={name} style={{ width: 96, gap: 4 }}>
              <View
                style={{
                  height: 40,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors[name],
                }}
              />
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </Row>
      </Section>

      <Section title="Boutons">
        <View style={{ gap: 12 }}>
          <Row>
            <Button label="Principal" size="lg" />
            <Button label="Doux" variant="soft" />
            <Button label="Fantôme" variant="ghost" size="sm" />
          </Row>
          <Row>
            <Button label="Continuer" icon="arrowR" iconRight="chevronR" />
            <Button label="Désactivé" disabled />
            <Button label="Envoi" loading />
          </Row>
          <View style={{ paddingHorizontal: gutter }}>
            <Button label="Se connecter" size="lg" full />
          </View>
        </View>
      </Section>

      <Section title="Pastilles">
        <Row>
          <Pill label="Neutre" />
          <Pill label="En cours" tone="primary" icon="clock" />
          <Pill label="Payé" tone="success" size="sm" />
          <Pill label="En attente" tone="warning" size="lg" />
          <Pill label="Litige" tone="danger" />
        </Row>
      </Section>

      <Section title="Champs">
        <View style={{ paddingHorizontal: gutter, gap: 14 }}>
          <Field
            label="Adresse email"
            icon="user"
            value={email}
            onChangeText={setEmail}
            placeholder="ton@email.cm"
            keyboardType="email-address"
          />
          <Field
            label="Mot de passe"
            icon="shield"
            value={password}
            onChangeText={setPassword}
            secure
          />
          <Field
            label="Téléphone"
            icon="phone"
            value="6 99"
            onChangeText={() => undefined}
            error="Numéro incomplet"
          />
        </View>
      </Section>

      <Section title="Avatars et icônes">
        <Row>
          <Avatar name="Paul Mbarga" />
          <Avatar name="Awa Ndiaye" size={56} variant="striped" />
          <Avatar name="Jean Fotso" size={32} color="#006c49" />
          <Icon name="wrench" size={14} />
          <Icon name="bell" size={18} />
          <Icon name="star" size={22} tone="warning" />
          <Icon name="shield" size={28} tone="primary" />
        </Row>
      </Section>

      <Section title="Cartes et visuels">
        <View style={{ paddingHorizontal: gutter, gap: 12 }}>
          <Card onPress={() => undefined} accessibilityLabel="Carte pressable">
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="flash" size={22} tone="onPrimary" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="labelStrong">Match en 47 s</Text>
                <Text variant="caption" tone="muted">
                  Quartier Bastos · plomberie
                </Text>
              </View>
              <Icon name="chevronR" size={16} tone="muted" />
            </View>
          </Card>
          <ImagePlaceholder label="Photo du chantier" />
          <Row>
            <ImagePlaceholder label="Primaire" tone="primary" width={150} height={80} />
            <ImagePlaceholder label="Sombre" tone="dark" width={150} height={80} />
          </Row>
        </View>
      </Section>

      <Section title="Navigation">
        <View style={{ height: 200, marginHorizontal: gutter, position: 'relative' }}>
          <View
            style={{
              flex: 1,
              borderRadius: theme.radius.card,
              backgroundColor: theme.colors.surfaceMuted,
            }}
          />
          <TabBar items={CLIENT_TABS} activeKey={tab} onSelect={setTab} />
          <Fab accessibilityLabel="Nouvelle demande" onPress={() => undefined} />
        </View>
      </Section>
    </Screen>
  );
}
