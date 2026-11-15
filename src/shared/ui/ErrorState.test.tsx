import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('présente la coupure réseau et relance', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    await renderWithProviders(<ErrorState kind="network" onRetry={onRetry} />);
    expect(screen.getByRole('header', { name: 'Pas de connexion' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('propose le support pour une panne du serveur', async () => {
    const user = userEvent.setup();
    const onSupport = jest.fn();
    await renderWithProviders(
      <ErrorState kind="server" onRetry={jest.fn()} onSupport={onSupport} />,
    );
    expect(screen.getByRole('header', { name: 'Quelque chose a cassé' })).toBeOnTheScreen();
    expect(
      screen.getByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Contacter le support' }));
    expect(onSupport).toHaveBeenCalledTimes(1);
  });

  it('demande de patienter en cas de limitation de débit', async () => {
    await renderWithProviders(<ErrorState kind="rateLimited" onRetry={jest.fn()} />);
    expect(screen.getByRole('header', { name: 'Trop de demandes' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'D’accord, je patiente' })).toBeOnTheScreen();
  });

  it('reste générique pour les autres catégories et accepte un message propre', async () => {
    await renderWithProviders(<ErrorState kind="notFound" message="Demande introuvable." />);
    expect(screen.getByRole('header', { name: 'Chargement impossible' })).toBeOnTheScreen();
    expect(screen.getByText('Demande introuvable.')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
