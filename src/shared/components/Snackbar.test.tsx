import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  it('affiche le message et l’icône de son ton', async () => {
    await renderWithProviders(<Snackbar message="Paiement libéré" tone="success" />);

    expect(screen.getByText('Paiement libéré')).toBeOnTheScreen();
    expect(screen.getByTestId('snackbar-icon')).toBeOnTheScreen();
  });

  it('déclenche son action', async () => {
    const onAction = jest.fn();
    await renderWithProviders(
      <Snackbar message="Litige ouvert" tone="info" actionLabel="Voir" onAction={onAction} />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Voir' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('n’affiche aucune action sans libellé', async () => {
    await renderWithProviders(<Snackbar message="Nouveau message reçu" tone="info" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('expose le rôle d’alerte pour les lecteurs d’écran', async () => {
    await renderWithProviders(<Snackbar message="Échec du paiement" tone="danger" />);

    expect(screen.getByRole('alert')).toBeOnTheScreen();
  });
});
