import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import technicians from '@/test/fixtures/directory/technicians.json';
import agencyUpdated from '@/test/fixtures/agency/agency-updated.json';
import members from '@/test/fixtures/agency/members.json';
import myAgency from '@/test/fixtures/agency/my-agency.json';
import { renderWithProviders } from '@/test/render';

import { agencyTranslations } from '../i18n';
import { AgencyScreen } from './AgencyScreen';
import { AgencyTeamScreen } from './AgencyTeamScreen';

const AGENCY = myAgency.data;
const FIRST_MEMBER = members.data[0]!;
const CANDIDATE = technicians.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('AgencyScreen (E07)', () => {
  it('présente la fiche de l’agence et ouvre l’équipe', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/my-agency').reply(200, myAgency);
    const onOpenTeam = jest.fn();
    await renderWithProviders(<AgencyScreen onOpenTeam={onOpenTeam} />, {
      api,
      translations: [agencyTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText(AGENCY.name)).toBeOnTheScreen();
    expect(screen.getByText(`Équipe : ${AGENCY.members.length} membre(s)`)).toBeOnTheScreen();
    expect(screen.getByText(`Présentation : ${AGENCY.description}`)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Gérer l’équipe' }));
    expect(onOpenTeam).toHaveBeenCalledWith(AGENCY.id);
  });

  it('propose la création quand aucune agence n’est rattachée', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/my-agency').reply(200, { data: null, message: 'Aucune agence' });
    mock.onPost('/agencies').reply(201, agencyUpdated);
    await renderWithProviders(<AgencyScreen onOpenTeam={jest.fn()} />, {
      api,
      translations: [agencyTranslations],
    });
    const user = userEvent.setup();

    expect(
      await screen.findByText(
        'Vous n’avez pas encore d’agence : créez-la pour constituer votre équipe.',
      ),
    ).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Nom de l’agence'), 'Agence de démonstration');
    await user.press(screen.getByRole('button', { name: 'Créer l’agence' }));

    expect(await screen.findByText('Agence créée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      name: 'Agence de démonstration',
    });
  });

  it('refuse une fiche sans nom et enregistre une modification', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/my-agency').reply(200, myAgency);
    mock.onPut(`/agencies/${AGENCY.id}`).reply(200, agencyUpdated);
    await renderWithProviders(<AgencyScreen onOpenTeam={jest.fn()} />, {
      api,
      translations: [agencyTranslations],
    });
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Modifier la fiche' }));
    await fireEvent.changeText(screen.getByLabelText('Nom de l’agence'), ' ');
    await user.press(screen.getByRole('button', { name: 'Enregistrer la fiche' }));
    expect(await screen.findByText('Indiquez le nom de l’agence.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Nom de l’agence'), 'Agence révisée');
    await user.press(screen.getByRole('button', { name: 'Enregistrer la fiche' }));

    expect(await screen.findByText('Fiche enregistrée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.put[0]?.data as string)).toMatchObject({
      name: 'Agence révisée',
    });
  });
});

describe('AgencyTeamScreen', () => {
  it('liste l’équipe et ses rôles', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/agencies/${AGENCY.id}/members`).reply(200, members);
    mock.onGet('/technicians').reply(200, technicians);
    await renderWithProviders(<AgencyTeamScreen agencyId={AGENCY.id} />, {
      api,
      translations: [agencyTranslations],
    });

    expect((await screen.findAllByText(FIRST_MEMBER.user.name)).length).toBeGreaterThan(0);
    expect(screen.getByText('Administrateur')).toBeOnTheScreen();
    expect(screen.getByText('Technicien')).toBeOnTheScreen();
  });

  it('rattache un technicien choisi dans l’annuaire', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/agencies/${AGENCY.id}/members`).reply(200, { data: [] });
    mock.onGet('/technicians').reply(200, technicians);
    mock.onPost(`/agencies/${AGENCY.id}/members`).reply(201, { message: 'Membre ajouté' });
    await renderWithProviders(<AgencyTeamScreen agencyId={AGENCY.id} />, {
      api,
      translations: [agencyTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Aucun membre pour le moment.')).toBeOnTheScreen();
    const [addButton] = await screen.findAllByRole('button', {
      name: `Ajouter : ${CANDIDATE.name}`,
    });
    await user.press(addButton!);

    expect(await screen.findByText('Technicien rattaché à l’agence.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      user_id: CANDIDATE.id,
      role: 'member',
    });
  });

  it('retire un membre après confirmation', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/agencies/${AGENCY.id}/members`).reply(200, members);
    mock.onGet('/technicians').reply(200, technicians);
    mock
      .onDelete(`/agencies/${AGENCY.id}/members/${members.data[1]!.user_id}`)
      .reply(200, { message: 'Membre retiré' });
    await renderWithProviders(<AgencyTeamScreen agencyId={AGENCY.id} />, {
      api,
      translations: [agencyTranslations],
    });
    const user = userEvent.setup();

    const buttons = await screen.findAllByRole('button', { name: /^Retirer : / });
    await user.press(buttons[buttons.length - 1]!);
    await user.press(screen.getByRole('button', { name: 'Confirmer' }));

    expect(await screen.findByText('Membre retiré.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  });

  it('affiche le message du serveur pour un membre déjà rattaché', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/agencies/${AGENCY.id}/members`).reply(200, { data: [] });
    mock.onGet('/technicians').reply(200, technicians);
    mock
      .onPost(`/agencies/${AGENCY.id}/members`)
      .reply(422, { message: "L'utilisateur est déjà membre" });
    await renderWithProviders(<AgencyTeamScreen agencyId={AGENCY.id} />, {
      api,
      translations: [agencyTranslations],
    });
    const user = userEvent.setup();

    const [addButton] = await screen.findAllByRole('button', {
      name: `Ajouter : ${CANDIDATE.name}`,
    });
    await user.press(addButton!);

    expect(await screen.findByText("L'utilisateur est déjà membre")).toBeOnTheScreen();
  });
});
