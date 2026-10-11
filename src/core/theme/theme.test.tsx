import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ThemeProvider, useTheme } from './ThemeProvider';
import { buildTheme, radius } from './tokens';

describe('buildTheme', () => {
  it('reprend les jetons clairs des maquettes', () => {
    const theme = buildTheme('light');
    expect(theme.colors).toMatchObject({
      background: '#FFFFFF',
      text: '#101828',
      primary: '#1F5BC4',
    });
    expect(theme.radius).toBe(radius);
  });

  it('expose les teintes et les élévations', () => {
    const theme = buildTheme('light');
    expect(theme.tint.primary).toBe('rgba(31,91,196,0.10)');
    expect(theme.elevation.medium).toEqual({ elevation: 3 });
  });

  it('reprend les jetons sombres des maquettes', () => {
    expect(buildTheme('dark').colors).toMatchObject({
      background: '#0B1220',
      surface: '#111A2B',
      text: '#F2F6FF',
      primary: '#1F5BC4',
      danger: '#E5484D',
    });
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
