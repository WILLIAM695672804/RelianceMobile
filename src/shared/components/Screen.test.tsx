import { act, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { renderWithProviders } from '@/test/render';

import { Screen } from './Screen';
import { Text } from './Text';

/** Le rendu simulé de `RefreshControl` ne conserve pas ses propriétés : on passe par le `ScrollView`. */
function refreshControlOf():
  ReactElement<{ onRefresh: () => void; refreshing: boolean }> | undefined {
  return screen.getByTestId('screen-scroll').props.refreshControl;
}

describe('Screen', () => {
  it('déclenche le rafraîchissement quand l’utilisateur tire le contenu', async () => {
    const onRefresh = jest.fn();
    await renderWithProviders(
      <Screen onRefresh={onRefresh} refreshing>
        <Text>Contenu</Text>
      </Screen>,
    );

    expect(refreshControlOf()?.props.refreshing).toBe(true);
    await act(async () => {
      refreshControlOf()?.props.onRefresh();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Contenu')).toBeOnTheScreen();
  });

  it('n’installe aucun contrôle de rafraîchissement par défaut', async () => {
    await renderWithProviders(
      <Screen scroll>
        <Text>Contenu</Text>
      </Screen>,
    );

    expect(refreshControlOf()).toBeUndefined();
  });
});
