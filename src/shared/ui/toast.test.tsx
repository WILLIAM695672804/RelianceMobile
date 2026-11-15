import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Pressable, Text as NativeText } from 'react-native';

import { renderWithProviders } from '@/test/render';

import { Toast } from './Toast';
import { ToastProvider, useToast, type ToastRequest } from './ToastProvider';

function Trigger({ requests }: { requests: ToastRequest[] }) {
  const toast = useToast();
  return (
    <Pressable accessibilityRole="button" onPress={() => requests.forEach(toast.show)}>
      <NativeText>Déclencher</NativeText>
    </Pressable>
  );
}

async function setup(requests: ToastRequest[]) {
  const user = userEvent.setup();
  await renderWithProviders(
    <ToastProvider>
      <Trigger requests={requests} />
    </ToastProvider>,
  );
  await user.press(screen.getByRole('button', { name: 'Déclencher' }));
  return user;
}

describe('Toast', () => {
  it('teinte son liseré selon le niveau et propose son action', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    await renderWithProviders(
      <Toast
        kind="error"
        title="Paiement échoué"
        body="Solde insuffisant."
        when="12 s"
        actionLabel="Voir"
        onAction={onAction}
        testID="toast"
      />,
    );
    expect(screen.getByTestId('toast')).toHaveStyle({
      borderLeftColor: '#ba1a1a',
      borderLeftWidth: 4,
    });
    expect(screen.getByText('12 s')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Voir' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('ToastProvider', () => {
  it('affiche le toast, l’annonce aux lecteurs d’écran et le ferme par sa croix', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const user = await setup([
      { kind: 'success', title: 'Devis accepté', body: '18 000 FCFA en séquestre.', duration: 0 },
    ]);
    expect(screen.getByText('Devis accepté')).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith('Devis accepté. 18 000 FCFA en séquestre.');
    await user.press(screen.getByRole('button', { name: 'Fermer la notification' }));
    await waitFor(() => expect(screen.queryByText('Devis accepté')).toBeNull());
    announce.mockRestore();
  });

  it('se ferme seul au terme de sa durée', async () => {
    await setup([{ kind: 'info', title: 'Nouvelle mission', duration: 30 }]);
    expect(screen.getByText('Nouvelle mission')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Nouvelle mission')).toBeNull(), {
      timeout: 2000,
    });
  });

  it('présente les toasts l’un après l’autre', async () => {
    const user = await setup([
      { kind: 'warning', title: 'Connexion lente', duration: 0 },
      { kind: 'badge', title: 'Badge débloqué', duration: 0 },
    ]);
    expect(screen.getByText('Connexion lente')).toBeOnTheScreen();
    expect(screen.queryByText('Badge débloqué')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Fermer la notification' }));
    expect(await screen.findByText('Badge débloqué')).toBeOnTheScreen();
  });

  it('exécute l’action puis se ferme', async () => {
    const onAction = jest.fn();
    const user = await setup([
      { kind: 'info', title: 'Nouvelle mission', actionLabel: 'Voir', onAction, duration: 0 },
    ]);
    await user.press(screen.getByRole('button', { name: 'Voir' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Nouvelle mission')).toBeNull());
  });

  it('exige un fournisseur', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<Trigger requests={[]} />)).rejects.toThrow(
      'useToast exige un ToastProvider.',
    );
    error.mockRestore();
  });
});
