import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/core/theme';
import {
  Banner,
  ChoiceChip,
  EmptyState,
  ErrorState,
  Screen,
  Text,
  TextAction,
  Toast,
  TopBar,
  useToast,
  type ToastContent,
} from '@/shared/ui';

const noop = () => undefined;

const VARIANTS = [
  { key: 'empty-history', label: 'Aucun historique' },
  { key: 'empty-search', label: 'Recherche vide' },
  { key: 'empty-feed', label: 'Fil vide' },
  { key: 'no-internet', label: 'Hors ligne' },
  { key: 'error-server', label: 'Erreur serveur' },
  { key: 'rate-limit', label: 'Trop de tentatives' },
] as const;

type Variant = (typeof VARIANTS)[number]['key'];

/** Galerie de la maquette `EmptyStatesScreen` : six variantes d'état vide ou d'erreur. */
export function EmptyStatesGallery({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const [variant, setVariant] = useState<Variant>('empty-history');

  const state = () => {
    switch (variant) {
      case 'empty-history':
        return (
          <EmptyState
            icon="home"
            title="Pas encore de mission"
            message="Votre historique apparaîtra ici dès votre première intervention."
            actionLabel="Découvrir les pros près de moi"
            onAction={noop}
          />
        );
      case 'empty-search':
        return (
          <EmptyState
            icon="search"
            tone="neutral"
            title="Aucun résultat"
            message="Rien trouvé pour « soudure tig ». Essayez un mot-clé plus simple ou parcourez les catégories."
            actionLabel="Voir toutes les catégories"
            onAction={noop}
          />
        );
      case 'empty-feed':
        return (
          <EmptyState
            icon="sparkle"
            title="Le fil est calme"
            message="Personne n’a publié ces dernières heures dans votre quartier. Soyez la première personne à partager une astuce."
            actionLabel="Créer une publication"
            onAction={noop}
          />
        );
      case 'no-internet':
        return <ErrorState kind="network" onRetry={noop} />;
      case 'error-server':
        return <ErrorState kind="server" onRetry={noop} onSupport={noop} />;
      default:
        return <ErrorState kind="rateLimited" onRetry={noop} />;
    }
  };

  return (
    <Screen scroll={false} testID="galerie-etats">
      <TopBar title="États vides & erreurs" align="center" onBack={onClose} />
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, gap: 6 }}
        >
          {VARIANTS.map((option) => (
            <ChoiceChip
              key={option.key}
              label={option.label}
              selected={variant === option.key}
              onPress={() => setVariant(option.key)}
            />
          ))}
        </ScrollView>
      </View>
      {state()}
    </Screen>
  );
}

const TOASTS: readonly (ToastContent & { key: string })[] = [
  {
    key: 'succes',
    kind: 'success',
    title: 'Devis accepté',
    body: '18 000 FCFA placés en séquestre.',
    when: 'maintenant',
  },
  {
    key: 'lent',
    kind: 'warning',
    title: 'Connexion lente',
    body: 'La messagerie peut être en différé.',
    when: '5 s',
  },
  {
    key: 'echec',
    kind: 'error',
    title: 'Paiement échoué',
    body: 'MTN MoMo a refusé · solde insuffisant.',
    when: '12 s',
  },
  {
    key: 'mission',
    kind: 'info',
    title: 'Nouvelle mission',
    body: 'Mme Owono · Mvog-Ada · 25 000 FCFA',
    when: '20 s',
    actionLabel: 'Voir',
  },
  {
    key: 'badge',
    kind: 'badge',
    title: 'Badge débloqué',
    body: '« Première mission » : bravo.',
    when: '1 min',
  },
];

/** Galerie de la maquette `ToastsScreen` : niveaux de toast et bannières en ligne. */
export function ToastsGallery({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [visible, setVisible] = useState(TOASTS.map((item) => item.key));

  const replay = () => {
    setVisible(TOASTS.map((item) => item.key));
    TOASTS.forEach(({ key: _key, ...content }) =>
      toast.show({ ...content, onAction: content.actionLabel ? noop : undefined, duration: 2500 }),
    );
  };

  return (
    <Screen testID="galerie-toasts">
      <TopBar
        title="Toasts & feedback"
        align="center"
        onBack={onClose}
        trailing={<TextAction label="Rejouer" onPress={replay} />}
      />
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}>
        <Text variant="title">Système de feedback</Text>
        <Text variant="label" tone="muted" style={{ marginBottom: 14, lineHeight: 20 }}>
          Cinq niveaux de toast : chaque événement a un canal et un ton précis. Glisser pour fermer,
          toucher pour agir.
        </Text>
        {TOASTS.filter((item) => visible.includes(item.key)).map(({ key, ...content }) => (
          <Toast
            key={key}
            {...content}
            onAction={content.actionLabel ? noop : undefined}
            onClose={() => setVisible((current) => current.filter((entry) => entry !== key))}
          />
        ))}
        <Text variant="eyebrow" tone="muted" style={{ marginTop: 22, letterSpacing: 1 }}>
          Bannières en ligne
        </Text>
        <Banner tone="success" message="Mission sous garantie 30 jours · jusqu’au 14 avril 2026" />
        <Banner
          tone="warning"
          message="Votre KYC expire dans 14 jours · renouvelez maintenant"
          onPress={noop}
        />
        <Banner tone="danger" message="Compte gelé · 3 retraits MoMo refusés sur 24 h" />
      </View>
    </Screen>
  );
}
