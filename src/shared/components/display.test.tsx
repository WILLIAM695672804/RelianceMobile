import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { Avatar, initialsOf } from './Avatar';
import { Badge } from './Badge';
import { ListItem } from './ListItem';

describe('initialsOf', () => {
  it.each([
    ['Awa Diallo', 'AD'],
    ['  awa  ', 'A'],
    ['Jean Paul Sartre', 'JP'],
    ['', ''],
  ])('%s → %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});

describe('Avatar', () => {
  it('affiche l’image lorsque l’URL est connue', async () => {
    await renderWithProviders(<Avatar name="Awa Diallo" uri="http://api.test/storage/a.png" />);
    expect(screen.getByLabelText('Awa Diallo')).toHaveProp('source', {
      uri: 'http://api.test/storage/a.png',
    });
  });

  it('affiche les initiales à défaut d’image', async () => {
    await renderWithProviders(<Avatar name="Awa Diallo" uri={null} />);
    expect(screen.getByText('AD')).toBeOnTheScreen();
  });
});

describe('Badge', () => {
  it('affiche son libellé', async () => {
    await renderWithProviders(<Badge label="Validé" tone="success" />);
    expect(screen.getByText('Validé')).toBeOnTheScreen();
  });
});

describe('ListItem', () => {
  it('est un bouton lorsqu’il porte une action', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <ListItem label="Mes adresses" detail="2 adresses" onPress={onPress} />,
    );

    await userEvent.setup().press(screen.getByRole('button', { name: 'Mes adresses' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('2 adresses')).toBeOnTheScreen();
  });

  it('n’est pas un bouton sans action', async () => {
    await renderWithProviders(<ListItem label="Double authentification" detail="Désactivée" />);
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
