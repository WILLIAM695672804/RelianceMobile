import { screen, userEvent } from '@testing-library/react-native';

import { directoryTranslations, MapView, TechProfileView } from '@/features/directory';
import { MatchingView, matchingTranslations } from '@/features/matching';
import { ACTIVE, CATEGORIES, REVIEWS, TECHS, techProfile, WORKS } from '@/prototype/sample';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';

import { ClientHomeView } from './ClientHomeView';
import { NewRequestView } from './NewRequestView';

const translations = [requestsTranslations, directoryTranslations, matchingTranslations];

describe('ClientHomeView', () => {
  it('présente l’accueil et relaie les intentions', async () => {
    const user = userEvent.setup();
    const handlers = {
      onNotifications: jest.fn(),
      onNewRequest: jest.fn(),
      onCategory: jest.fn(),
      onAllCategories: jest.fn(),
      onMap: jest.fn(),
      onTech: jest.fn(),
      onAllTechs: jest.fn(),
      onOpenActive: jest.fn(),
      onChatActive: jest.fn(),
    };
    await renderWithProviders(
      <ClientHomeView
        firstName="Yves K."
        hasUnreadNotifications
        categories={CATEGORIES}
        nearby={{ count: 12, area: 'Bastos · 2 km autour' }}
        recommended={TECHS}
        active={ACTIVE}
        {...handlers}
      />,
      { translations },
    );
    expect(screen.getByText('Yves K.')).toBeOnTheScreen();
    expect(screen.getByTestId('pastille-notifications')).toBeOnTheScreen();
    expect(screen.getByText('12 techniciens disponibles')).toBeOnTheScreen();

    await user.press(screen.getAllByRole('button', { name: 'Nouvelle demande' })[0]!);
    await user.press(screen.getByRole('button', { name: 'Électricité' }));
    await user.press(screen.getByRole('button', { name: 'Paul Mvondo' }));
    await user.press(screen.getByRole('button', { name: 'Écrire à Paul Mvondo' }));
    expect(handlers.onNewRequest).toHaveBeenCalled();
    expect(handlers.onCategory).toHaveBeenCalledWith('electricite');
    expect(handlers.onTech).toHaveBeenCalledWith(TECHS[0]);
    expect(handlers.onChatActive).toHaveBeenCalledWith('d1');
  });
});

describe('NewRequestView', () => {
  it('valide chaque étape avec les règles du serveur puis transmet la demande', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const photo = { uri: 'file:///siphon.jpg', name: 'siphon.jpg', type: 'image/jpeg' };
    await renderWithProviders(
      <NewRequestView
        categories={CATEGORIES}
        place={{ label: 'Bastos, rue 1.842', detail: 'Yaoundé · position détectée' }}
        submitting={false}
        onLocate={jest.fn()}
        onPickPhoto={jest.fn(async () => photo)}
        onSubmit={onSubmit}
        onBack={jest.fn()}
      />,
      { translations },
    );
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText('Étape 1/4')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Plomberie' }));
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText('Étape 2/4')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Intitulé court'), 'Fuite sous l’évier');
    await user.type(screen.getByLabelText('Description détaillée'), 'Trop court');
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText('Étape 2/4')).toBeOnTheScreen();

    await user.type(
      screen.getByLabelText('Description détaillée'),
      ', l’eau coule en continu du siphon.',
    );
    await user.press(screen.getByRole('button', { name: 'Ajouter une photo' }));
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText('Étape 3/4')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Maintenant' }));
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByRole('header', { name: 'Récapitulatif et envoi' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Lancer le rapprochement' }));
    expect(onSubmit).toHaveBeenCalledWith({
      categorySlug: 'plomberie',
      title: 'Fuite sous l’évier',
      description: 'Trop court, l’eau coule en continu du siphon.',
      photos: [photo],
      urgency: 'now',
    });
  });
});

describe('MatchingView', () => {
  it('propose les techniciens et relaie le choix', async () => {
    const user = userEvent.setup();
    const onChoose = jest.fn();
    await renderWithProviders(
      <MatchingView
        status="ready"
        technicians={TECHS}
        onChoose={onChoose}
        onViewProfile={jest.fn()}
        onRetry={jest.fn()}
        onClose={jest.fn()}
      />,
      { translations },
    );
    expect(screen.getByRole('header', { name: '5 techniciens trouvés' })).toBeOnTheScreen();
    expect(screen.getByText('TOP')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Choisir Aïcha Nkoa' }));
    expect(onChoose).toHaveBeenCalledWith(TECHS[1]);
  });

  it('annonce la recherche en cours', async () => {
    await renderWithProviders(
      <MatchingView
        status="searching"
        technicians={[]}
        onChoose={jest.fn()}
        onViewProfile={jest.fn()}
        onRetry={jest.fn()}
        onClose={jest.fn()}
      />,
      { translations },
    );
    expect(screen.getByRole('header', { name: 'Recherche en cours…' })).toBeOnTheScreen();
  });
});

describe('MapView et TechProfileView', () => {
  it('sélectionne un technicien sur la carte et ouvre son profil', async () => {
    const user = userEvent.setup();
    const onViewProfile = jest.fn();
    await renderWithProviders(
      <MapView
        technicians={TECHS}
        searchLabel="Plombier près de Bastos"
        onSearch={jest.fn()}
        onViewProfile={onViewProfile}
      />,
      { translations },
    );
    expect(screen.getByText('5 techniciens proches')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Aïcha Nkoa' }));
    expect(screen.getByRole('button', { name: 'Aïcha Nkoa' })).toBeSelected();
    await user.press(screen.getByRole('button', { name: 'Voir le profil · Aïcha Nkoa' }));
    expect(onViewProfile).toHaveBeenCalledWith(TECHS[1]);
  });

  it('parcourt les onglets du profil et réserve', async () => {
    const user = userEvent.setup();
    const onBook = jest.fn();
    await renderWithProviders(
      <TechProfileView
        tech={techProfile(TECHS[0]!)}
        works={WORKS}
        reviews={REVIEWS}
        onBack={jest.fn()}
        onMessage={jest.fn()}
        onBook={onBook}
      />,
      { translations },
    );
    expect(screen.getByRole('header', { name: 'Paul Mvondo' })).toBeOnTheScreen();
    expect(screen.getByText('Compétences')).toBeOnTheScreen();
    await user.press(screen.getByRole('tab', { name: 'Avis' }));
    expect(screen.getByText('Marie K.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Réserver — 8 000 FCFA' }));
    expect(onBook).toHaveBeenCalledTimes(1);
  });
});
