import { render } from '@testing-library/react-native';

import { useResponsive, type Responsive } from './useResponsive';

// Seul le module de mesure de la fenêtre est substitué : remplacer `react-native` en entier
// rompt le chargement des greffons Expo.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

interface WindowMetrics {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

const mocked = (
  jest.requireMock('react-native/Libraries/Utilities/useWindowDimensions') as {
    default: jest.MockedFunction<() => WindowMetrics>;
  }
).default;

async function measure(width: number, height: number): Promise<Responsive> {
  mocked.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
  let measured: Responsive | undefined;
  function Probe() {
    measured = useResponsive();
    return null;
  }
  await render(<Probe />);
  if (!measured) throw new Error('mesures non calculées');
  return measured;
}

describe('useResponsive', () => {
  it('mesure un téléphone d’entrée de gamme en portrait', async () => {
    const responsive = await measure(320, 640);
    expect(responsive.sizeClass).toBe('compact');
    expect(responsive.gutter).toBe(12);
    expect(responsive.landscape).toBe(false);
    expect(responsive.wide).toBe(false);
    expect(responsive.maxContentWidth).toBeUndefined();
    expect(responsive.typeScale).toBeLessThan(1);
  });

  it('mesure un téléphone courant', async () => {
    const responsive = await measure(412, 915);
    expect(responsive.sizeClass).toBe('medium');
    expect(responsive.columns(96)).toBe(3);
  });

  it('borne et centre le contenu sur tablette', async () => {
    const responsive = await measure(800, 1280);
    expect(responsive.sizeClass).toBe('expanded');
    expect(responsive.maxContentWidth).toBe(640);
    expect(responsive.wide).toBe(true);
    // Les colonnes se calculent sur la largeur bornée, non sur celle de la fenêtre.
    expect(responsive.columns(96)).toBe(5);
  });

  it('détecte le mode paysage', async () => {
    const responsive = await measure(915, 412);
    expect(responsive.landscape).toBe(true);
  });

  it('respecte le plafond de colonnes', async () => {
    const responsive = await measure(412, 915);
    expect(responsive.columns(96, 12, 2)).toBe(2);
  });
});
