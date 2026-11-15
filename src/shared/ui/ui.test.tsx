import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { Avatar, initialsOf } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { Fab } from './Fab';
import { Field } from './Field';
import { Icon, strokeFor } from './Icon';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Pill } from './Pill';
import { Screen } from './Screen';
import { Section } from './Section';
import { TAB_BAR_CLEARANCE, TabBar } from './TabBar';
import { Text } from './Text';

describe('Text', () => {
  it('applique la variante et la tonalité', async () => {
    await renderWithProviders(
      <Text variant="display" tone="primary">
        Bienvenue
      </Text>,
    );
    expect(screen.getByText('Bienvenue')).toHaveStyle({
      fontSize: 32,
      fontFamily: 'PlusJakartaSans_700Bold',
      color: '#5f3add',
    });
  });

  it('met le surtitre en capitales et plafonne la mise à l’échelle', async () => {
    await renderWithProviders(<Text variant="eyebrow">Reliance · 01</Text>);
    const node = screen.getByText('Reliance · 01');
    expect(node).toHaveStyle({ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 });
    expect(node.props.maxFontSizeMultiplier).toBe(1.4);
  });
});

describe('Icon', () => {
  it('suit le trait des maquettes selon la taille', () => {
    expect(strokeFor(14)).toBe(2);
    expect(strokeFor(18)).toBe(1.85);
    expect(strokeFor(22)).toBe(1.75);
  });

  it('devient porteuse de sens lorsqu’un libellé est fourni', async () => {
    await renderWithProviders(<Icon name="star" label="Note" />);
    expect(screen.getByLabelText('Note')).toBeOnTheScreen();
  });
});

describe('Button', () => {
  it('déclenche onPress et porte son libellé', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Se connecter" onPress={onPress} />);
    await user.press(screen.getByRole('button', { name: 'Se connecter' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('étend la zone tactile à 48 points sous la hauteur dessinée', async () => {
    await renderWithProviders(<Button label="Petit" size="sm" testID="petit" />);
    expect(screen.getByTestId('petit').props.hitSlop).toEqual({ top: 6, bottom: 6 });
  });

  it('se désactive pendant le chargement', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Envoyer" loading onPress={onPress} testID="envoi" />);
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
    expect(screen.getByTestId('envoi-chargement')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('dessine la variante primaire sur l’accent', async () => {
    await renderWithProviders(<Button label="Valider" testID="valider" />);
    expect(screen.getByTestId('valider')).toHaveStyle({
      backgroundColor: '#5f3add',
      borderRadius: 9999,
      height: 44,
    });
  });
});

describe('Card', () => {
  it('reprend surface, filet et arrondi des maquettes', async () => {
    await renderWithProviders(
      <Card testID="carte">
        <Text>Contenu</Text>
      </Card>,
    );
    expect(screen.getByTestId('carte')).toHaveStyle({
      borderRadius: 20,
      borderColor: '#ececf1',
      padding: 16,
    });
  });

  it('devient un bouton lorsqu’elle est pressable', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(
      <Card onPress={onPress} accessibilityLabel="Ouvrir la demande">
        <Text>Fuite</Text>
      </Card>,
    );
    await user.press(screen.getByRole('button', { name: 'Ouvrir la demande' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Pill', () => {
  it('teinte le fond et le texte selon la tonalité', async () => {
    await renderWithProviders(<Pill label="Payé" tone="success" testID="statut" />);
    expect(screen.getByTestId('statut')).toHaveStyle({ backgroundColor: 'rgba(0, 108, 73, 0.10)' });
    expect(screen.getByText('Payé')).toHaveStyle({ color: '#006c49' });
  });
});

describe('Field', () => {
  it('relaie la saisie et expose son libellé', async () => {
    const user = userEvent.setup();
    const onChangeText = jest.fn();
    await renderWithProviders(<Field label="Adresse email" value="" onChangeText={onChangeText} />);
    await user.type(screen.getByLabelText('Adresse email'), 'a');
    expect(onChangeText).toHaveBeenCalledWith('a');
  });

  it('affiche l’erreur et cerne le champ de la couleur de danger', async () => {
    await renderWithProviders(
      <Field label="Email" value="x" onChangeText={jest.fn()} error="Adresse invalide" />,
    );
    expect(screen.getByText('Adresse invalide')).toHaveStyle({ color: '#ba1a1a' });
  });

  it('masque puis révèle un mot de passe', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <Field label="Mot de passe" value="secret" onChangeText={jest.fn()} secure />,
    );
    expect(screen.getByLabelText('Mot de passe').props.secureTextEntry).toBe(true);
    await user.press(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(screen.getByLabelText('Mot de passe').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toBeOnTheScreen();
  });
});

describe('Avatar', () => {
  it('calcule les initiales', () => {
    expect(initialsOf('Paul  Mbarga Essomba')).toBe('PM');
    expect(initialsOf('awa')).toBe('A');
  });

  it('affiche les initiales sur l’accent', async () => {
    await renderWithProviders(<Avatar name="Paul Mbarga" testID="avatar" />);
    expect(screen.getByText('PM')).toBeOnTheScreen();
    expect(screen.getByTestId('avatar')).toHaveStyle({ backgroundColor: '#5f3add', width: 40 });
  });

  it('dessine le gabarit rayé à la couleur de la personne', async () => {
    await renderWithProviders(<Avatar name="Awa Ndiaye" variant="striped" color="#006c49" />);
    expect(screen.getByText('AN')).toHaveStyle({ color: '#006c49' });
  });
});

describe('ImagePlaceholder', () => {
  it('se présente comme une image légendée', async () => {
    await renderWithProviders(<ImagePlaceholder label="Photo du chantier" />);
    expect(screen.getByLabelText('Photo du chantier')).toBeOnTheScreen();
  });
});

describe('Section', () => {
  it('titre le bloc comme un en-tête', async () => {
    await renderWithProviders(
      <Section title="Techniciens proches">
        <Text>Liste</Text>
      </Section>,
    );
    expect(screen.getByRole('header', { name: 'Techniciens proches' })).toBeOnTheScreen();
  });
});

describe('TabBar', () => {
  const items = [
    { key: 'home', label: 'Accueil', icon: 'home' },
    { key: 'map', label: 'Carte', icon: 'map' },
  ] as const;

  it('signale l’onglet actif et relaie la sélection', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await renderWithProviders(<TabBar items={items} activeKey="home" onSelect={onSelect} />);
    expect(screen.getByRole('tab', { name: 'Accueil' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Carte' })).not.toBeSelected();
    await user.press(screen.getByRole('tab', { name: 'Carte' }));
    expect(onSelect).toHaveBeenCalledWith('map');
  });

  it('réserve un dégagement sous le contenu', () => {
    expect(TAB_BAR_CLEARANCE).toBe(112);
  });
});

describe('Fab', () => {
  it('est un bouton nommé', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await renderWithProviders(<Fab accessibilityLabel="Nouvelle demande" onPress={onPress} />);
    await user.press(screen.getByRole('button', { name: 'Nouvelle demande' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Screen', () => {
  it('applique le fond du thème', async () => {
    await renderWithProviders(
      <Screen testID="ecran">
        <Text>Corps</Text>
      </Screen>,
    );
    expect(screen.getByTestId('ecran')).toHaveStyle({ backgroundColor: '#ffffff' });
    expect(screen.getByText('Corps')).toBeOnTheScreen();
  });

  it('affiche un pied fixe', async () => {
    await renderWithProviders(
      <Screen footer={<Text>Pied</Text>} scroll={false}>
        <Text>Corps</Text>
      </Screen>,
    );
    expect(screen.getByText('Pied')).toBeOnTheScreen();
  });
});
