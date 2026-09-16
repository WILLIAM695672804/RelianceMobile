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
export {
  ForgotPasswordScreen,
  type ForgotPasswordScreenProps,
} from './screens/ForgotPasswordScreen';
export { LoginScreen, type LoginScreenProps } from './screens/LoginScreen';
export { RegisterScreen, type RegisterScreenProps } from './screens/RegisterScreen';
export type { LoginPayload, ResetPasswordPayload, TwoFactorSetup } from './api/authApi';
export type { RegisterPayload, RegistrableRole } from './schemas/authSchemas';
