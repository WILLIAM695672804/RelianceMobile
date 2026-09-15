import { act, screen, userEvent } from '@testing-library/react-native';

import { AppError } from '@/core/errors';
import { connectivityStore } from '@/core/offline';
import { renderWithProviders } from '@/test/render';

import { ConfirmDialog } from './ConfirmDialog';
import { OfflineBanner } from './OfflineBanner';
import { StateView } from './StateView';

afterEach(() => connectivityStore.setState({ isOnline: true }));

describe('StateView', () => {
  it('annonce le chargement', async () => {
    await renderWithProviders(<StateView status="loading" />);
    expect(screen.getByLabelText('Chargement…')).toBeOnTheScreen();
  });

  it('décrit l’erreur et propose de réessayer', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    await renderWithProviders(
      <StateView status="error" error={new AppError({ kind: 'network' })} onRetry={onRetry} />,
    );

    expect(screen.getByText('Vérifiez votre connexion.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('affiche le message vide par défaut ou personnalisé', async () => {
    const { rerender } = await renderWithProviders(<StateView status="empty" />);
    expect(screen.getByText('Aucun élément à afficher.')).toBeOnTheScreen();

    await rerender(<StateView status="empty" message="Aucune demande." />);
    expect(screen.getByText('Aucune demande.')).toBeOnTheScreen();
  });
});

describe('OfflineBanner', () => {
  it('n’apparaît qu’hors ligne', async () => {
    await renderWithProviders(<OfflineBanner />);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();

    await act(async () => {
      connectivityStore.setState({ isOnline: false });
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Vous êtes hors ligne. Certaines fonctionnalités sont limitées.',
    );
  });
});

describe('ConfirmDialog', () => {
  it('confirme ou annule', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await renderWithProviders(
      <ConfirmDialog
        visible
        title="Se déconnecter ?"
        message="Vous devrez vous reconnecter."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Se déconnecter ?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Confirmer' }));
    await user.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('ne rend rien lorsqu’il est masqué', async () => {
    await renderWithProviders(
      <ConfirmDialog
        visible={false}
        title="Masqué"
        message=""
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.queryByText('Masqué')).not.toBeOnTheScreen();
  });
});
