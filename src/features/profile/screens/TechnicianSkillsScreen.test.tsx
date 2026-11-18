import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import catalogue from '@/test/fixtures/profile/skills.json';
import skillAdded from '@/test/fixtures/technician/skill-added.json';
import skillRemoved from '@/test/fixtures/technician/skill-removed.json';
import mySkills from '@/test/fixtures/technician/skills.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { TechnicianSkillsScreen } from './TechnicianSkillsScreen';

const NBSP = ' ';
const firstSkill = mySkills.data[0]!;
/** Compétence du catalogue non encore déclarée par le technicien. */
const freeSkill = catalogue.data.find(
  (skill) => !mySkills.data.some((owned) => owned.id === skill.id),
)!;

async function setup(owned: unknown = mySkills) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technician/skills').reply(200, owned);
  mock.onGet('/skills').reply(200, catalogue);
  await renderWithProviders(<TechnicianSkillsScreen />, {
    api,
    translations: [profileTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('TechnicianSkillsScreen', () => {
  it('liste les compétences déclarées avec niveau et tarifs', async () => {
    await setup();

    expect(await screen.findByText(firstSkill.name)).toBeOnTheScreen();
    expect(
      screen.getByText(`Niveau 3 · 7${NBSP}000${NBSP}FCFA de l’heure · 0 an(s) d’expérience`, {
        exact: false,
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(`Frais de déplacement : 1${NBSP}000${NBSP}FCFA`, { exact: false }),
    ).toBeOnTheScreen();
  });

  it('signale l’absence de compétence déclarée', async () => {
    await setup({ status: 'success', data: [] });

    expect(
      await screen.findByText(
        'Aucune compétence déclarée : ajoutez-en pour recevoir des propositions.',
      ),
    ).toBeOnTheScreen();
  });

  it('ajoute une compétence choisie dans le catalogue', async () => {
    const { mock, user } = await setup();
    mock.onPost('/technician/skills').reply(200, skillAdded);
    await screen.findByText(firstSkill.name);

    await user.press(screen.getByRole('button', { name: 'Choisir une compétence' }));
    await user.press(await screen.findByRole('button', { name: freeSkill.name }));
    await user.press(screen.getByRole('button', { name: 'Niveau 4' }));
    await fireEvent.changeText(screen.getByLabelText('Années d’expérience'), '8');
    await fireEvent.changeText(screen.getByLabelText('Tarif horaire (FCFA)'), '7500');
    await fireEvent.changeText(screen.getByLabelText('Frais de déplacement (FCFA)'), '1000');
    await user.press(screen.getByRole('button', { name: 'Ajouter la compétence' }));

    expect(await screen.findByText('Compétence enregistrée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      skill_id: freeSkill.id,
      proficiency: 4,
      experience_years: 8,
      hourly_rate: 7500,
      travel_fee: 1000,
    });
  });

  it('refuse un tarif non entier et rattache les erreurs du serveur', async () => {
    const { mock, user } = await setup();
    await screen.findByText(firstSkill.name);

    await user.press(screen.getByRole('button', { name: 'Choisir une compétence' }));
    await user.press(await screen.findByRole('button', { name: freeSkill.name }));
    await fireEvent.changeText(screen.getByLabelText('Tarif horaire (FCFA)'), '7 500');
    await user.press(screen.getByRole('button', { name: 'Ajouter la compétence' }));

    expect(await screen.findByText('Indiquez un tarif entier en FCFA.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);

    mock.onPost('/technician/skills').reply(422, {
      message: 'Invalide',
      errors: { hourly_rate: ['Tarif refusé par le serveur.'] },
    });
    await fireEvent.changeText(screen.getByLabelText('Tarif horaire (FCFA)'), '7500');
    await user.press(screen.getByRole('button', { name: 'Ajouter la compétence' }));

    expect(await screen.findByText('Tarif refusé par le serveur.')).toBeOnTheScreen();
  });

  it('retire une compétence après confirmation', async () => {
    const { mock, user } = await setup();
    mock.onDelete(`/technician/skills/${firstSkill.id}`).reply(200, skillRemoved);
    await screen.findByText(firstSkill.name);

    await user.press(screen.getByRole('button', { name: `Retirer : ${firstSkill.name}` }));
    expect(
      screen.getByText(`La compétence « ${firstSkill.name} » sera retirée de votre profil.`),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Retirer' }));

    expect(await screen.findByText('Compétence retirée.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  });
});
