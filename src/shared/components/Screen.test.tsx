import { act, fireEvent, screen } from '@testing-library/react-native';
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

describe('Screen avec barre supérieure', () => {
  it('affiche le titre et déclenche le retour', async () => {
    const onBack = jest.fn();
    await renderWithProviders(
      <Screen title="Nouvelle demande" onBack={onBack}>
        <Text>Contenu</Text>
      </Screen>,
    );

    expect(screen.getByTestId('app-bar')).toBeTruthy();
    expect(screen.getByText('Nouvelle demande')).toBeOnTheScreen();
    fireEvent.press(screen.getByLabelText('Retour'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('n’affiche pas de barre supérieure sans titre', async () => {
    await renderWithProviders(
      <Screen>
        <Text>Contenu</Text>
      </Screen>,
    );

    expect(screen.queryByTestId('app-bar')).toBeNull();
  });

  it('place le pied d’écran hors de la zone défilante', async () => {
    await renderWithProviders(
      <Screen scroll footer={<Text>Envoyer</Text>}>
        <Text>Contenu</Text>
      </Screen>,
    );

    expect(screen.getByTestId('screen-footer')).toBeTruthy();
    expect(screen.getByTestId('screen-scroll').props.children).toBeTruthy();
  });
});
