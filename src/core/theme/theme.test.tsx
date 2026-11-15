import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ThemeProvider, useTheme } from './ThemeProvider';
import { buildTheme, fontFamily, radius } from './tokens';

describe('buildTheme', () => {
  it('reprend les jetons clairs de Clean Lavender', () => {
    const theme = buildTheme('light');
    expect(theme.colors).toMatchObject({
      background: '#ffffff',
      text: '#17161f',
      textMuted: '#57556a',
      border: '#ececf1',
      primary: '#5f3add',
      onPrimary: '#ffffff',
      primaryFixed: '#efeaff',
      onPrimaryFixed: '#4918c8',
      danger: '#ba1a1a',
    });
    expect(theme.radius).toBe(radius);
    expect(theme.radius.card).toBe(20);
  });

  it('reprend les jetons sombres de Clean Lavender', () => {
    expect(buildTheme('dark').colors).toMatchObject({
      background: '#0e0e12',
      surface: '#16161b',
      text: '#ededf2',
      primary: '#b5a3ff',
      onPrimary: '#1f0a5c',
      danger: '#ff8a80',
    });
  });

  it('accorde teintes et ombres au schéma', () => {
    expect(buildTheme('light').tint.primary).toBe('#efeaff');
    expect(buildTheme('dark').tint.primary).toBe('#2a2350');
    expect(buildTheme('light').shadow.card).toEqual({
      boxShadow: '0px 2px 8px rgba(23, 22, 31, 0.04)',
    });
    expect(buildTheme('dark').shadow.card).toEqual({});
  });

  it('emploie Plus Jakarta Sans pour toutes les graisses', () => {
    expect(Object.values(fontFamily).every((name) => name.startsWith('PlusJakartaSans_'))).toBe(
      true,
    );
  });
});

describe('ThemeProvider', () => {
  it('impose le schéma demandé', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider scheme="dark">{children}</ThemeProvider>
    );
    const { result } = await renderHook(() => useTheme(), { wrapper });
    expect(result.current.scheme).toBe('dark');
  });

  it('fournit le thème clair par défaut hors fournisseur', async () => {
    const { result } = await renderHook(() => useTheme());
    expect(result.current.scheme).toBe('light');
  });
});
