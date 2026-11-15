import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import documents from '@/test/fixtures/kyc/kyc-mine.json';
import calendar from '@/test/fixtures/planning/calendar.json';
import identity from '@/test/fixtures/technician/identity.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { TechnicianSetupScreen } from './TechnicianSetupScreen';

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technician/profile').reply(200, identity);
  mock.onGet('/technician/calendar').reply(200, calendar);
  mock.onGet('/auth/kyc/mine').reply(200, documents);
  return { api, mock };
}

describe('TechnicianSetupScreen', () => {
  it('présente les cinq étapes', async () => {
    const { api } = setupApi();
    await renderWithProviders(<TechnicianSetupScreen onOpen={jest.fn()} />, {
      api,
      translations: [profileTranslations],
    });

    expect(await screen.findByTestId('setup-step-professional')).toBeOnTheScreen();
    for (const step of ['skills', 'zone', 'kyc', 'planning']) {
      expect(screen.getByTestId(`setup-step-${step}`)).toBeOnTheScreen();
    }
  });

  it('mesure l’avancement d’après les données du serveur', async () => {
    const { api } = setupApi();
    await renderWithProviders(<TechnicianSetupScreen onOpen={jest.fn()} />, {
      api,
      translations: [profileTranslations],
    });

    expect(await screen.findByTestId('setup-progress')).toBeOnTheScreen();
    expect(screen.getAllByText('Fait').length).toBeGreaterThan(0);
  });

  it('mène à l’écran de l’étape pressée', async () => {
    const { api } = setupApi();
    const onOpen = jest.fn();
    await renderWithProviders(<TechnicianSetupScreen onOpen={onOpen} />, {
      api,
      translations: [profileTranslations],
    });
    const user = userEvent.setup();

    await user.press(await screen.findByTestId('setup-step-zone'));

    expect(onOpen).toHaveBeenCalledWith('zone');
  });
});
