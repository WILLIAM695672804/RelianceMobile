import { screen, userEvent, within } from '@testing-library/react-native';

import notificationsFixture from '@/test/fixtures/notifications/notifications.json';
import { renderWithProviders } from '@/test/render';

import { notificationsTranslations } from '../i18n';
import { notificationPageSchema, type AppNotification } from '../schemas/notificationSchemas';

import { NotificationsView, type NotificationsViewProps } from './NotificationsView';

const captured = notificationPageSchema.parse(notificationsFixture).data;
const NOW = new Date('2026-10-06T20:00:00.000Z');

async function setup(overrides: Partial<NotificationsViewProps> = {}) {
  const props: NotificationsViewProps = {
    status: 'ready',
    notifications: captured,
    now: NOW,
    onBack: jest.fn(),
    onRetry: jest.fn(),
    onMarkAll: jest.fn(),
    onOpen: jest.fn(),
    ...overrides,
  };
  const result = await renderWithProviders(<NotificationsView {...props} />, {
    translations: [notificationsTranslations],
  });
  return { props, ...result };
}

describe('NotificationsView', () => {
  it('présente les notifications capturées sous leur période, les non-lues signalées', async () => {
    const { props } = await setup();
    expect(await screen.findByRole('header', { name: 'Notifications' })).toBeOnTheScreen();
    expect(screen.getByText('Aujourd’hui')).toBeOnTheScreen();
    const first = captured[0]!;
    expect(screen.getByTestId(`notification-${first.id}`)).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: first.title }).length).toBeGreaterThan(0);
    const unread = captured.filter((item) => !item.is_read);
    for (const item of unread) {
      expect(screen.getByTestId(`non-lue-${item.id}`)).toBeOnTheScreen();
    }
    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it('ouvre une notification et marque tout comme lu', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    const first = captured[0]!;
    await user.press(await screen.findByTestId(`notification-${first.id}`));
    expect(props.onOpen).toHaveBeenCalledWith(first);
    await user.press(screen.getByRole('button', { name: 'Tout lire' }));
    expect(props.onMarkAll).toHaveBeenCalledTimes(1);
  });

  it('compte les non-lues sur l’onglet actif et filtre par rubrique', async () => {
    const user = userEvent.setup();
    await setup();
    const unreadCount = captured.filter((item) => !item.is_read).length;
    const allTab = await screen.findByRole('tab', { name: 'Tout' });
    expect(within(allTab).getByText(String(unreadCount))).toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'Finance' }));
    expect(screen.getByRole('tab', { name: 'Finance' })).toBeSelected();
    expect(screen.getByText('Aucune notification dans cette rubrique.')).toBeOnTheScreen();
  });

  it('désactive « Tout lire » lorsque tout est lu', async () => {
    const allRead: AppNotification[] = captured.map((item) => ({ ...item, is_read: true }));
    await setup({ notifications: allRead });
    expect(await screen.findByRole('button', { name: 'Tout lire' })).toBeDisabled();
  });

  it('présente l’état vide, le chargement et l’erreur', async () => {
    const user = userEvent.setup();
    const { rerender, props } = await setup({ notifications: [] });
    expect(await screen.findByText('Rien de neuf')).toBeOnTheScreen();

    await rerender(<NotificationsView {...props} status="loading" />);
    expect(screen.getByLabelText('Chargement…')).toBeOnTheScreen();

    await rerender(
      <NotificationsView {...props} status="error" errorMessage="Serveur indisponible" />,
    );
    expect(screen.getByText('Serveur indisponible')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it('revient en arrière', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    await user.press(await screen.findByRole('button', { name: 'Retour' }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });
});
