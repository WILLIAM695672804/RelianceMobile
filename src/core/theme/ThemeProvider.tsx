import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme, type ColorScheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(buildTheme('light'));

/** Fournit le thème ; suit le schéma du système si `scheme` n'est pas imposé. */
export function ThemeProvider({ scheme, children }: { scheme?: ColorScheme; children: ReactNode }) {
  const system = useColorScheme();
  const resolved: ColorScheme = scheme ?? (system === 'dark' ? 'dark' : 'light');
  const theme = useMemo(() => buildTheme(resolved), [resolved]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
