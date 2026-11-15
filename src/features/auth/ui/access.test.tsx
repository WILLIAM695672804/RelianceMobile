import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test/render';

import { authTranslations } from '../i18n';

import { LoginView, type LoginViewProps } from './LoginView';
import { OnboardingView } from './OnboardingView';
import { RoleSelectView } from './RoleSelectView';

const translations = [authTranslations];

describe('OnboardingView', () => {
  it('présente la première diapositive et avance jusqu’à la fin du fil', async () => {
    const user = userEvent.setup();
    const onFinish = jest.fn();
    await renderWithProviders(<OnboardingView onFinish={onFinish} onSkip={jest.fn()} />, {
      translations,
    });
    expect(screen.getByText('Reliance · 01')).toBeOnTheScreen();
    expect(
      screen.getByRole('header', { name: 'Le bon technicien.\nEn un geste.' }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Reliance · 02')).toBeOnTheScreen();
    expect(screen.getByText('Séquestre activé')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Reliance · 03')).toBeOnTheScreen();
    expect(onFinish).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Commencer' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('saute directement à une diapositive et permet de passer', async () => {
    const user = userEvent.setup();
    const onSkip = jest.fn();
    await renderWithProviders(<OnboardingView onFinish={jest.fn()} onSkip={onSkip} />, {
      translations,
    });
    await user.press(screen.getByRole('button', { name: 'Aller à la diapositive 3' }));
    expect(screen.getByText('Reliance · 03')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Aller à la diapositive 3' })).toBeSelected();

    await user.press(screen.getByRole('button', { name: 'Passer' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

describe('RoleSelectView', () => {
  it('relaie le rôle choisi et l’accès à la connexion', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onSignIn = jest.fn();
    await renderWithProviders(<RoleSelectView onSelect={onSelect} onSignIn={onSignIn} />, {
      translations,
    });
    expect(screen.getByRole('header', { name: 'Bienvenue.' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Je suis technicien' }));
    expect(onSelect).toHaveBeenCalledWith('technicien');
    await user.press(screen.getByRole('button', { name: 'Je suis une agence' }));
    expect(onSelect).toHaveBeenLastCalledWith('agence');

    await user.press(screen.getByRole('button', { name: 'Connexion' }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});

describe('LoginView', () => {
  async function setup(overrides: Partial<LoginViewProps> = {}) {
    const props: LoginViewProps = {
      step: 'credentials',
      submitting: false,
      onSubmitCredentials: jest.fn(),
      onSubmitCode: jest.fn(),
      onBackToCredentials: jest.fn(),
      onForgotPassword: jest.fn(),
      onRegister: jest.fn(),
      onBack: jest.fn(),
      ...overrides,
    };
    const result = await renderWithProviders(<LoginView {...props} />, { translations });
    return { props, ...result };
  }

  it('n’autorise la connexion qu’une fois les deux champs remplis, puis transmet les identifiants', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    const submit = screen.getByRole('button', { name: 'Se connecter' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Adresse électronique'), 'client.capture@example.test');
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText('Mot de passe'), 'password123');
    expect(submit).toBeEnabled();

    await user.press(submit);
    expect(props.onSubmitCredentials).toHaveBeenCalledWith({
      email: 'client.capture@example.test',
      password: 'password123',
    });
  });

  it('refuse une adresse invalide sans rien transmettre', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    await user.type(screen.getByLabelText('Adresse électronique'), 'pas-une-adresse');
    await user.type(screen.getByLabelText('Mot de passe'), 'x');
    await user.press(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByText('Adresse électronique invalide.')).toBeOnTheScreen();
    expect(props.onSubmitCredentials).not.toHaveBeenCalled();
  });

  it('affiche l’expiration de session, l’erreur générale et les erreurs du serveur', async () => {
    await setup({
      sessionExpired: true,
      formError: 'Adresse électronique ou mot de passe incorrect.',
      fieldErrors: { email: 'Ce compte n’existe pas.' },
    });
    expect(screen.getByText('Adresse électronique ou mot de passe incorrect.')).toBeOnTheScreen();
    expect(screen.getByText('Ce compte n’existe pas.')).toBeOnTheScreen();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('relaie mot de passe oublié, création de compte et retour', async () => {
    const user = userEvent.setup();
    const { props } = await setup();
    await user.press(screen.getByRole('link', { name: 'Mot de passe oublié ?' }));
    await user.press(screen.getByRole('link', { name: 'Créer un compte' }));
    await user.press(screen.getByRole('button', { name: 'Retour' }));
    expect(props.onForgotPassword).toHaveBeenCalledTimes(1);
    expect(props.onRegister).toHaveBeenCalledTimes(1);
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it('demande le code à six chiffres à l’étape de double authentification', async () => {
    const user = userEvent.setup();
    const { props } = await setup({ step: 'twoFactor' });
    expect(screen.getByRole('header', { name: 'Vérification en deux étapes' })).toBeOnTheScreen();
    expect(screen.queryByRole('link', { name: 'Créer un compte' })).toBeNull();

    await user.type(screen.getByLabelText('Code de vérification'), '12');
    await user.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(await screen.findByText('Le code doit comporter six chiffres.')).toBeOnTheScreen();
    expect(props.onSubmitCode).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Code de vérification'));
    await user.type(screen.getByLabelText('Code de vérification'), '123456');
    await user.press(screen.getByRole('button', { name: 'Vérifier' }));
    expect(props.onSubmitCode).toHaveBeenCalledWith('123456');

    await user.press(screen.getAllByRole('button', { name: 'Retour' }).at(-1)!);
    expect(props.onBackToCredentials).toHaveBeenCalledTimes(1);
  });
});
