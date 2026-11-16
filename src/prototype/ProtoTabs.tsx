import { Tabs, useRouter, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { Fab, TabBar, type TabBarItem } from '@/shared/ui';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export interface ProtoTabsProps {
  items: readonly TabBarItem[];
  /** Bouton d'action flottant de l'onglet d'accueil (nouvelle demande, côté client). */
  fab?: { label: string; href: string };
}

/** Onglets d'un rôle du prototype, dessinés par la barre « verre liquide ». */
export function ProtoTabs({ items, fab }: ProtoTabsProps) {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props: TabBarProps) => {
        const active = props.state.routes[props.state.index]?.name ?? items[0]!.key;
        return (
          <View
            pointerEvents="box-none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
          >
            {fab && active === items[0]!.key ? (
              <Fab accessibilityLabel={fab.label} onPress={() => router.push(fab.href as Href)} />
            ) : null}
            <TabBar
              items={items}
              activeKey={active}
              onSelect={(key) => props.navigation.navigate(key)}
            />
          </View>
        );
      }}
    >
      {items.map((item) => (
        <Tabs.Screen key={item.key} name={item.key} />
      ))}
    </Tabs>
  );
}
