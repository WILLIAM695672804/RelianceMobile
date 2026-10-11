import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { View } from 'react-native';

import { renderWithProviders } from '@/test/render';

import { AdaptiveGrid } from './AdaptiveGrid';
import { Chip } from './Chip';
import { IconTile } from './IconTile';
import { Rail } from './Rail';
import { SearchField } from './SearchField';
import { SectionHeader } from './SectionHeader';
import { StatTile } from './StatTile';
import { StepIndicator } from './StepIndicator';

describe('SectionHeader', () => {
  it('affiche le titre et déclenche l’action', async () => {
    const onAction = jest.fn();
    await renderWithProviders(
      <SectionHeader title="Nos services" actionLabel="Tout voir" onAction={onAction} />,
    );

    expect(screen.getByText('Nos services')).toBeOnTheScreen();
    await userEvent.press(screen.getByLabelText('Tout voir'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('n’affiche aucune action sans rappel', async () => {
    await renderWithProviders(<SectionHeader title="Mes demandes" />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('IconTile', () => {
  it('affiche l’icône et le libellé, et se presse', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <IconTile icon="wrench" label="Plomberie" onPress={onPress} testID="tuile" />,
    );

    expect(screen.getByText('Plomberie')).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId('tuile'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('signale son état retenu', async () => {
    await renderWithProviders(
      <IconTile icon="bolt" label="Électricité" selected onPress={jest.fn()} testID="tuile" />,
    );

    expect(screen.getByTestId('tuile').props.accessibilityState.selected).toBe(true);
  });
});

describe('SearchField', () => {
  it('se comporte en bouton lorsqu’il n’est pas éditable', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <SearchField placeholder="Rechercher un service" onPress={onPress} />,
    );

    await userEvent.press(screen.getByLabelText('Rechercher un service'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('remonte la saisie lorsqu’il est éditable', async () => {
    const onChangeText = jest.fn();
    await renderWithProviders(
      <SearchField placeholder="Rechercher" value="" onChangeText={onChangeText} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Rechercher'), 'plomb');
    expect(onChangeText).toHaveBeenCalledWith('plomb');
  });
});

describe('Chip', () => {
  it('reflète son état sélectionné', async () => {
    await renderWithProviders(
      <Chip label="Plomberie" selected onPress={jest.fn()} testID="puce" />,
    );

    expect(screen.getByTestId('puce').props.accessibilityState.selected).toBe(true);
  });

  it('se presse', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Chip label="Sécurité" onPress={onPress} testID="puce" />);

    await userEvent.press(screen.getByTestId('puce'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('StepIndicator', () => {
  it('rend une barre par étape et annonce l’avancement', async () => {
    await renderWithProviders(<StepIndicator steps={4} current={1} testID="etapes" />);

    expect(screen.getAllByTestId(/^etapes-bar-/)).toHaveLength(4);
    expect(screen.getByTestId('etapes').props.accessibilityValue).toEqual({
      min: 1,
      max: 4,
      now: 2,
    });
  });
});

describe('AdaptiveGrid', () => {
  it('répartit les enfants sans en perdre', async () => {
    await renderWithProviders(
      <AdaptiveGrid minTileWidth={100} testID="grille">
        <View testID="enfant" />
        <View testID="enfant" />
        <View testID="enfant" />
        <View testID="enfant" />
        <View testID="enfant" />
      </AdaptiveGrid>,
    );

    expect(screen.getAllByTestId('enfant')).toHaveLength(5);
  });

  it('respecte le plafond de colonnes', async () => {
    await renderWithProviders(
      <AdaptiveGrid minTileWidth={80} maxColumns={2} testID="grille">
        <View testID="enfant" />
        <View testID="enfant" />
        <View testID="enfant" />
      </AdaptiveGrid>,
    );

    // Trois enfants sur deux colonnes : deux lignes, la seconde complétée d'une cellule vide.
    expect(screen.getAllByTestId('enfant')).toHaveLength(3);
  });
});

describe('Rail', () => {
  it('défile horizontalement', async () => {
    await renderWithProviders(
      <Rail testID="rail">
        <View testID="carte" />
      </Rail>,
    );

    expect(screen.getByTestId('rail').props.horizontal).toBe(true);
  });
});

describe('StatTile', () => {
  it('affiche la valeur et son libellé', async () => {
    await renderWithProviders(<StatTile icon="star" value="4,8" label="Note moyenne" />);

    expect(screen.getByText('4,8')).toBeOnTheScreen();
    expect(screen.getByText('Note moyenne')).toBeOnTheScreen();
  });
});
