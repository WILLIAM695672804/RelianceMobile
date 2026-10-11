import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { Avatar, initialsOf } from './Avatar';
import { Badge } from './Badge';
import { Card } from './Card';
import { ListItem } from './ListItem';
import { Text } from './Text';

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

describe('Card actionnable', () => {
  it('se presse et porte le rôle de bouton', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Card onPress={onPress} accessibilityLabel="Ouvrir la demande" testID="carte">
        <Text>Contenu</Text>
      </Card>,
    );

    await userEvent.press(screen.getByTestId('carte'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Ouvrir la demande')).toBeTruthy();
  });

  it('reste une simple surface sans action', async () => {
    await renderWithProviders(
      <Card testID="carte">
        <Text>Contenu</Text>
      </Card>,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('ListItem enrichie', () => {
  it('affiche une icône de tête', async () => {
    await renderWithProviders(
      <ListItem label="Portefeuille" icon="wallet" onPress={jest.fn()} testID="ligne" />,
    );

    expect(screen.getByTestId('ligne-icon')).toBeTruthy();
  });

  it('affiche un chevron vectoriel lorsqu’elle est actionnable', async () => {
    await renderWithProviders(<ListItem label="Profil" onPress={jest.fn()} testID="ligne" />);

    expect(screen.getByTestId('ligne-chevron')).toBeTruthy();
  });

  it('n’affiche aucun chevron lorsqu’elle est informative', async () => {
    await renderWithProviders(<ListItem label="Solde" detail="12 000 FCFA" testID="ligne" />);

    expect(screen.queryByTestId('ligne-chevron')).toBeNull();
  });
});

describe('Badge enrichie', () => {
  it('porte une icône et une teinte de fond', async () => {
    await renderWithProviders(<Badge label="Vérifié" tone="success" icon="check" testID="b" />);

    expect(screen.getByTestId('b-icon')).toBeTruthy();
    expect(screen.getByText('Vérifié')).toHaveStyle({ color: '#16A34A' });
  });
});
