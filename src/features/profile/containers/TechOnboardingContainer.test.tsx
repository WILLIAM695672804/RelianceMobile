import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import catalog from '@/test/fixtures/profile/skills.json';
import profileUpdated from '@/test/fixtures/profile/profile-updated.json';
import identity from '@/test/fixtures/technician/identity.json';
import identityUpdated from '@/test/fixtures/technician/identity-updated.json';
import locationUpdated from '@/test/fixtures/technician/location-updated.json';
import skillAdded from '@/test/fixtures/technician/skill-added.json';
import mySkills from '@/test/fixtures/technician/skills.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { skillCatalogResponseSchema } from '../schemas/skillSchemas';
import { technicianSkillListResponseSchema } from '../schemas/technicianSchemas';
import { onboardingInitial, skillsToAdd, TechOnboardingContainer } from './TechOnboardingContainer';

const CATALOG = skillCatalogResponseSchema.parse(catalog).data;
const DECLARED = technicianSkillListResponseSchema.parse(mySkills).data;

describe('modèle de l’installation', () => {
  it('reprend les compétences déclarées et leurs tarifs', () => {
    const initial = onboardingInitial('Paul', undefined, DECLARED);
    expect(initial.skills['eclairage']).toBe('expert');
    expect(initial.hourlyRate).toBe('7000');
    expect(initial.diagnosticFee).toBe('1000');
  });

  it('n’ajoute que les compétences nouvelles du catalogue', () => {
    const values = {
      ...onboardingInitial('Paul', undefined, DECLARED),
      skills: {
        eclairage: 'expert' as const,
        'plomberie-generale': 'junior' as const,
        inconnue: 'junior' as const,
      },
    };
    const plumbing = CATALOG.find((skill) => skill.slug === 'plomberie-generale')!;
    expect(skillsToAdd(values, CATALOG, DECLARED)).toEqual([
      { skillId: plumbing.id, level: 'junior' },
    ]);
  });
});

describe('TechOnboardingContainer', () => {
  it('enregistre identité, profil et zone puis termine', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet('/technician/profile').reply(200, identity);
    mock.onGet('/technician/skills').reply(200, mySkills);
    mock.onGet('/skills').reply(200, catalog);
    mock.onPut('/auth/profile').reply(200, profileUpdated);
    mock.onPut('/technician/profile').reply(200, identityUpdated);
    mock.onPost('/technician/skills').reply(200, skillAdded);
    mock.onPut('/technician/location').reply(200, locationUpdated);
    const store = createSessionStore();
    store.getState().setAuthenticated(buildSessionUser('technicien', { name: 'Paul' }));
    const onDone = jest.fn();
    await renderWithProviders(<TechOnboardingContainer onBack={jest.fn()} onDone={onDone} />, {
      api,
      sessionStore: store,
      translations: [profileTranslations],
    });
    const user = userEvent.setup();

    await screen.findByTestId('installation-technicien');
    for (let step = 0; step < 4; step += 1) {
      await user.press(screen.getByRole('button', { name: 'Continuer' }));
    }
    await user.press(screen.getByRole('button', { name: 'Soumettre pour validation' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(mock.history.put.map((request) => request.url)).toEqual([
      '/auth/profile',
      '/technician/profile',
      '/technician/location',
    ]);
    expect(JSON.parse(mock.history.put[2]!.data as string)).toMatchObject({ latitude: 3.848 });
  });
});
