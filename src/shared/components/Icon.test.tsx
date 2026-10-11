import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { Icon } from './Icon';
import { ICON_NAMES } from './icons';

describe('Icon', () => {
  it('expose le jeu complet des maquettes', () => {
    expect(ICON_NAMES).toHaveLength(53);
    expect(ICON_NAMES).toContain('wrench');
    expect(ICON_NAMES).toContain('wallet');
  });

  it('rend chaque icône du jeu', async () => {
    await renderWithProviders(
      <>
        {ICON_NAMES.map((name) => (
          <Icon key={name} name={name} testID={`icone-${name}`} />
        ))}
      </>,
    );
    expect(screen.getAllByTestId(/^icone-/)).toHaveLength(ICON_NAMES.length);
  });

  it('porte un libellé d’accessibilité lorsqu’il est fourni', async () => {
    await renderWithProviders(<Icon name="bell" label="Notifications" />);
    expect(screen.getByLabelText('Notifications')).toBeTruthy();
  });

  it('reste décoratif par défaut', async () => {
    await renderWithProviders(<Icon name="bell" testID="deco" />);
    expect(screen.getByTestId('deco').props.accessible).toBe(false);
  });

  it('applique la tonalité demandée au tracé', async () => {
    await renderWithProviders(<Icon name="star" tone="warning" testID="etoile" />);
    expect(screen.getByTestId('etoile')).toBeTruthy();
  });
});
