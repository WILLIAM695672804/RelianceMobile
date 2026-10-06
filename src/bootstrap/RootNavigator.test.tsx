import { act, screen } from '@testing-library/react-native';

import { createSessionStore } from '@/core/session';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { RootNavigator } from './RootNavigator';

jest.mock('expo-router', () => {
  const { createElement, Fragment } = require('react');
  const { Text } = require('react-native');
  function Stack({ children }: { children: unknown }) {
    return createElement(Fragment, null, children);
  }
  function Protected({ guard, children }: { guard: boolean; children: unknown }) {
    return guard ? createElement(Fragment, null, children) : null;
  }
  function Screen({ name }: { name: string }) {
    return createElement(Text, null, `écran:${name}`);
  }
  Stack.Protected = Protected;
  Stack.Screen = Screen;
  return { Stack };
});

jest.mock('./RealtimeBridge', () => ({ RealtimeBridge: () => null }));

describe('RootNavigator', () => {
  it('n’expose que l’écran de démarrage tant que la session est inconnue', async () => {
    await renderWithProviders(<RootNavigator />);
    expect(screen.getByText('écran:index')).toBeOnTheScreen();
    expect(screen.queryByText('écran:(auth)')).not.toBeOnTheScreen();
  });

  it('bascule vers le groupe invité puis vers l’espace du rôle et le profil', async () => {
    const sessionStore = createSessionStore();
    await renderWithProviders(<RootNavigator />, { sessionStore });

    await act(async () => {
      sessionStore.getState().setUnauthenticated();
    });
    expect(screen.getByText('écran:(auth)')).toBeOnTheScreen();
    expect(screen.queryByText('écran:(profil)')).not.toBeOnTheScreen();

    await act(async () => {
      sessionStore.getState().setAuthenticated(buildSessionUser('technicien'));
    });
    expect(screen.getByText('écran:technicien')).toBeOnTheScreen();
    expect(screen.getByText('écran:(missions)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(profil)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(annuaire)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(facturation)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(notifications)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(messagerie)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(portefeuille)')).toBeOnTheScreen();
    expect(screen.getByText('écran:(avis)')).toBeOnTheScreen();
    expect(screen.queryByText('écran:(auth)')).not.toBeOnTheScreen();
  });

  it('dirige un administrateur vers l’espace réservé au web', async () => {
    const sessionStore = createSessionStore();
    sessionStore.getState().setAuthenticated(buildSessionUser('admin'));
    await renderWithProviders(<RootNavigator />, { sessionStore });
    expect(screen.getByText('écran:web-only')).toBeOnTheScreen();
    expect(screen.queryByText('écran:(profil)')).not.toBeOnTheScreen();
  });

  it('n’ouvre le parcours des demandes qu’au client', async () => {
    const sessionStore = createSessionStore();
    sessionStore.getState().setAuthenticated(buildSessionUser('client'));
    await renderWithProviders(<RootNavigator />, { sessionStore });
    expect(screen.getByText('écran:(demande)')).toBeOnTheScreen();

    await act(async () => {
      sessionStore.getState().setAuthenticated(buildSessionUser('technicien'));
    });
    expect(screen.queryByText('écran:(demande)')).not.toBeOnTheScreen();
  });
});
