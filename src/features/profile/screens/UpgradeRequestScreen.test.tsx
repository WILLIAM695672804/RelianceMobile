import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import upgradeAlreadyTechnician from '@/test/fixtures/profile/upgrade-already-technician.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { UpgradeRequestScreen } from './UpgradeRequestScreen';

const MOTIVATION = 'Électricien depuis dix ans à Douala.';

async function setup() {
  const onDone = jest.fn();
  const rendered = await renderWithProviders(<UpgradeRequestScreen onDone={onDone} />, {
    translations: [profileTranslations],
  });
  return { ...rendered, mock: new MockAdapter(rendered.api), onDone, user: userEvent.setup() };
}

const submit = () => screen.getByRole('button', { name: 'Envoyer la demande' });

describe('UpgradeRequestScreen', () => {
  it('exige une motivation suffisante', async () => {
    const { mock, user } = await setup();

    await fireEvent.changeText(screen.getByLabelText('Motivation'), 'Trop court');
    await user.press(submit());

    expect(
      await screen.findByText('La motivation doit contenir au moins 20 caractères.'),
    ).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('envoie la demande et confirme sa prise en compte', async () => {
    const { mock, onDone, user } = await setup();
    mock
      .onPost('/auth/request-upgrade')
      .reply(200, { message: "Demande d'upgrade soumise. Un administrateur va la valider." });

    await fireEvent.changeText(screen.getByLabelText('Motivation'), MOTIVATION);
    await fireEvent.changeText(screen.getByLabelText('Présentation (facultative)'), 'Bio');
    await user.press(submit());

    expect(
      await screen.findByText('Demande envoyée. Vous serez informé de la décision.'),
    ).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      motivation: MOTIVATION,
      bio: 'Bio',
    });
    await user.press(screen.getByRole('button', { name: 'Retour' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('affiche le refus métier du serveur', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/request-upgrade').reply(422, upgradeAlreadyTechnician);

    await fireEvent.changeText(screen.getByLabelText('Motivation'), MOTIVATION);
    await user.press(submit());

    await waitFor(() => expect(screen.getByText('Vous êtes déjà technicien')).toBeOnTheScreen());
  });
});
