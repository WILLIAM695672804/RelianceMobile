import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { renderWithProviders } from '@/test/render';

import { Button } from './Button';
import { Card } from './Card';
import { PlaceholderScreen } from './PlaceholderScreen';
import { Screen } from './Screen';
import { Text } from './Text';
import { TextField } from './TextField';

describe('Text', () => {
  it('applique la couleur de la tonalité', async () => {
    await renderWithProviders(<Text tone="danger">Alerte</Text>);
    expect(screen.getByText('Alerte')).toHaveStyle({ color: '#E5484D' });
  });

  it('applique la taille de la variante', async () => {
    await renderWithProviders(<Text variant="title">Titre</Text>);
    expect(screen.getByText('Titre')).toHaveStyle({ fontSize: 22 });
  });
});

describe('Text adaptatif', () => {
  it('plafonne la mise à l’échelle demandée par le système', async () => {
    await renderWithProviders(<Text>Bonjour</Text>);
    expect(screen.getByText('Bonjour').props.maxFontSizeMultiplier).toBe(1.4);
  });

  it('expose la variante label', async () => {
    await renderWithProviders(<Text variant="label">Quartier</Text>);
    expect(screen.getByText('Quartier')).toHaveStyle({ fontSize: 13 });
  });
});

describe('Button', () => {
  it('déclenche onPress', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Valider" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Valider' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('est inactif lorsqu’il est désactivé', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Valider" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Valider' });
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('signale le chargement et bloque l’action', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Valider" onPress={onPress} loading />);

    const button = screen.getByRole('button', { name: 'Valider' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
  });
});

describe('TextField', () => {
  it('associe le libellé au champ et relaie la saisie', async () => {
    const onChangeText = jest.fn();
    await renderWithProviders(
      <TextField label="Adresse électronique" value="" onChangeText={onChangeText} />,
    );

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'awa@example.test');

    expect(onChangeText).toHaveBeenCalledWith('awa@example.test');
  });

  it('affiche le message d’erreur', async () => {
    await renderWithProviders(
      <TextField label="Mot de passe" value="" onChangeText={jest.fn()} error="Trop court" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Trop court');
  });
});

describe('Screen, Card et PlaceholderScreen', () => {
  it('rendent leur contenu', async () => {
    await renderWithProviders(
      <Screen scroll>
        <Card>
          <Text>Contenu</Text>
        </Card>
      </Screen>,
    );
    expect(screen.getByText('Contenu')).toBeOnTheScreen();
  });

  it('affiche le titre et la description par défaut de l’écran provisoire', async () => {
    await renderWithProviders(<PlaceholderScreen title="Portefeuille" />);
    expect(screen.getByRole('header')).toHaveTextContent('Portefeuille');
    expect(screen.getByText('Écran prévu dans un lot ultérieur.')).toBeOnTheScreen();
  });
});

describe('Button aux conventions Android', () => {
  it('respecte la cible tactile minimale', async () => {
    await renderWithProviders(<Button label="Envoyer" onPress={jest.fn()} testID="go" />);
    const flattened = StyleSheet.flatten(screen.getByTestId('go').props.style);
    expect(flattened.minHeight).toBeGreaterThanOrEqual(48);
  });

  it('affiche une icône de tête lorsqu’elle est demandée', async () => {
    await renderWithProviders(
      <Button label="Appeler" icon="phone" onPress={jest.fn()} testID="call" />,
    );
    expect(screen.getByTestId('call-icon')).toBeTruthy();
  });

  it('occupe toute la largeur sur demande', async () => {
    await renderWithProviders(
      <Button label="Continuer" fullWidth onPress={jest.fn()} testID="next" />,
    );
    expect(StyleSheet.flatten(screen.getByTestId('next').props.style).alignSelf).toBe('stretch');
  });

  it('borde la variante fantôme et remplit la variante principale', async () => {
    await renderWithProviders(
      <>
        <Button label="Annuler" variant="ghost" onPress={jest.fn()} testID="ghost" />
        <Button label="Valider" onPress={jest.fn()} testID="plein" />
      </>,
    );
    expect(StyleSheet.flatten(screen.getByTestId('ghost').props.style).borderWidth).toBe(1);
    expect(StyleSheet.flatten(screen.getByTestId('plein').props.style)).toMatchObject({
      backgroundColor: '#1F5BC4',
      borderWidth: 0,
    });
  });

  it('réduit sa hauteur en petite taille tout en élargissant sa zone de frappe', async () => {
    await renderWithProviders(<Button label="Voir" size="sm" onPress={jest.fn()} testID="see" />);
    expect(screen.getByTestId('see').props.hitSlop).toBe(8);
  });
});
