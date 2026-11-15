/**
 * Feature `auth` — connexion (E02), inscription (E03), mot de passe oublié (E04),
 * vérification de l'adresse électronique et double authentification.
 *
 * La session elle-même (restauration, expiration, déconnexion) relève de `@/core/session` ;
 * cette feature n'en expose que les opérations déclenchées par l'utilisateur.
 * @packageDocumentation
 */

export { authKeys } from './hooks/authKeys';
export { useAccount } from './hooks/useAccount';
export {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useForgotPassword,
  useGenerateTwoFactor,
  useLogin,
  useLogout,
  useRegister,
  useResendVerification,
  useResetPassword,
} from './hooks/useAuthMutations';
export { authTranslations } from './i18n';
export { createOnboardingFlag, type OnboardingFlag } from './model/onboardingSeen';
export {
  ForgotPasswordScreen,
  type ForgotPasswordScreenProps,
} from './screens/ForgotPasswordScreen';
export { LoginScreen, type LoginScreenProps } from './screens/LoginScreen';
export { OnboardingScreen, type OnboardingScreenProps } from './screens/OnboardingScreen';
export { RegisterScreen, type RegisterScreenProps } from './screens/RegisterScreen';
export type { LoginPayload, ResetPasswordPayload, TwoFactorSetup } from './api/authApi';
export type { RegisterPayload, RegistrableRole } from './schemas/authSchemas';
export { LoginView, type LoginStep, type LoginViewProps } from './ui/LoginView';
export { OnboardingView, type OnboardingViewProps } from './ui/OnboardingView';
export { RoleSelectView, type RoleSelectViewProps } from './ui/RoleSelectView';
export { ForgotPasswordView, type ForgotPasswordViewProps } from './ui/ForgotPasswordView';
