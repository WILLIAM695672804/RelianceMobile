import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { tabIcon, useTabBarStyle } from './tabOptions';

describe('tabIcon', () => {
  it('rend l’icône demandée à la couleur de l’onglet', async () => {
    const renderIcon = tabIcon('home');
    await renderWithProviders(renderIcon({ color: '#1F5BC4', focused: true, size: 24 }));

    expect(screen.getByTestId('tab-icon-home')).toBeTruthy();
  });

  it('épaissit le trait de l’onglet actif', () => {
    const renderIcon = tabIcon('home');
    const active = renderIcon({ color: '#1F5BC4', focused: true, size: 24 });
    const idle = renderIcon({ color: '#5B6472', focused: false, size: 24 });

    expect(active.props.strokeWidth).toBeGreaterThan(idle.props.strokeWidth);
  });
});

describe('useTabBarStyle', () => {
  it('fournit les options de la barre Material', async () => {
    let options: ReturnType<typeof useTabBarStyle> | undefined;
    function Probe() {
      options = useTabBarStyle();
      return null;
    }
    await renderWithProviders(<Probe />);

    expect(options?.headerShown).toBe(false);
    expect(options?.tabBarActiveTintColor).toBe('#1F5BC4');
    expect(options?.tabBarInactiveTintColor).toBe('#5B6472');
    expect(options?.tabBarLabelPosition).toBe('below-icon');
    expect(options?.tabBarStyle.height).toBe(64);
  });
});
