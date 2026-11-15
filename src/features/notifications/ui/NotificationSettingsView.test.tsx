import { screen, userEvent } from '@testing-library/react-native';

import settingsFixture from '@/test/fixtures/notifications/settings.json';
import { renderWithProviders } from '@/test/render';

import { notificationsTranslations } from '../i18n';
import { settingsResponseSchema, toChannelMap } from '../schemas/notificationSchemas';

import {
  NotificationSettingsView,
  type NotificationSettingsViewProps,
} from './NotificationSettingsView';

const channels = toChannelMap(settingsResponseSchema.parse(settingsFixture).data);

async function setup(overrides: Partial<NotificationSettingsViewProps> = {}) {
  const props: NotificationSettingsViewProps = {
    status: 'ready',
    channels,
    dirty: false,
    saving: false,
    onToggle: jest.fn(),
    onSave: jest.fn(),
    onRetry: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  };
  const result = await renderWithProviders(<NotificationSettingsView {...props} />, {
    translations: [notificationsTranslations],
  });
  return { props, ...result };
}

describe('NotificationSettingsView', () => {
  it('présente les canaux capturés et relaie une bascule', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    const email = screen.getByRole('switch', { name: 'Courriel' });
    if (channels.email) expect(email).toBeChecked();
    else expect(email).not.toBeChecked();
    await user.press(email);
    expect(props.onToggle).toHaveBeenCalledWith('email', !channels.email);
  });

  it('désactive le canal poussé tant que le serveur ne l’émet pas', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    const push = screen.getByRole('switch', { name: 'Notifications poussées' });
    expect(push).toBeDisabled();
    await user.press(push);
    expect(props.onToggle).not.toHaveBeenCalled();
  });

  it('n’enregistre qu’après modification et rend compte de l’issue', async () => {
    const user = userEvent.setup();
    const { props, rerender } = await setup();
    expect(screen.getByRole('button', { name: 'Enregistrer les préférences' })).toBeDisabled();
    await rerender(<NotificationSettingsView {...props} dirty outcome="saved" />);
    await user.press(screen.getByRole('button', { name: 'Enregistrer les préférences' }));
    expect(props.onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Préférences enregistrées.')).toBeOnTheScreen();
  });

  it('présente l’erreur de chargement', async () => {
    const user = userEvent.setup();
    const { props } = await setup({ status: 'error', errorKind: 'network' });
    expect(screen.getByRole('header', { name: 'Pas de connexion' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
