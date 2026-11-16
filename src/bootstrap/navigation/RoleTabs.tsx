import { Tabs, useRouter, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { Fab, TabBar, type TabBarItem } from '@/shared/ui';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export interface RoleTabsProps {
  /** Onglets visibles ; les autres fichiers du dossier restent des écrans sans onglet. */
  items: readonly TabBarItem[];
  /** Bouton d'action flottant, affiché sur le premier onglet. */
  fab?: { label: string; href: Href };
}

/** Coque d'onglets d'un rôle, dessinée par la barre « verre liquide » des maquettes. */
export function RoleTabs({ items, fab }: RoleTabsProps) {
  const router = useRouter();
  const first = items[0]?.key;
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props: TabBarProps) => {
        const active = props.state.routes[props.state.index]?.name ?? first;
        if (!items.some((item) => item.key === active)) return null;
        return (
          <View
            pointerEvents="box-none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
          >
            {fab && active === first ? (
              <Fab accessibilityLabel={fab.label} onPress={() => router.push(fab.href)} />
            ) : null}
            <TabBar
              items={items}
              activeKey={active ?? ''}
              onSelect={(key) => props.navigation.navigate(key)}
            />
          </View>
        );
      }}
    />
  );
}
