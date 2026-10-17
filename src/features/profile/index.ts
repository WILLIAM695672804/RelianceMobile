/**
 * Feature `profile` — profil (E08), modification du profil et de l'avatar (E09), mot de passe,
 * adresses, demande de passage technicien et paramètres (E26).
 *
 * Dépend de l'API publique de `@/features/auth` (compte, double authentification, déconnexion).
 * @packageDocumentation
 */

export { profileKeys } from './hooks/profileKeys';
export { useSkillCatalog } from './hooks/useSkillCatalog';
export {
  useAddTechnicianSkill,
  useMyTechnicianSkills,
  useRemoveTechnicianSkill,
  useTechnicianIdentity,
  useTechnicianStats,
  useUpdateServiceArea,
  useUpdateTechnicianProfile,
} from './hooks/useTechnician';
export {
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useSetDefaultLocation,
} from './hooks/useLocations';
export {
  useChangePassword,
  useRequestUpgrade,
  useUpdateProfile,
  useUploadAvatar,
} from './hooks/useProfileMutations';
export { profileTranslations } from './i18n';
export {
  completedSteps,
  SETUP_STEPS,
  setupStepsFor,
  type SetupSnapshot,
  type SetupStep,
  type SetupStepKey,
} from './model/setupSteps';
export { groupSkillsByCategory, type SkillGroup } from './model/skillGroups';
export {
  ChangePasswordScreen,
  type ChangePasswordScreenProps,
} from './screens/ChangePasswordScreen';
export { EditProfileScreen, type EditProfileScreenProps } from './screens/EditProfileScreen';
export { LocationsScreen } from './screens/LocationsScreen';
export {
  destinationsFor,
  ProfileScreen,
  type ProfileDestination,
  type ProfileScreenProps,
} from './screens/ProfileScreen';
export { ServiceAreaScreen } from './screens/ServiceAreaScreen';
export { SettingsScreen, type SettingsScreenProps } from './screens/SettingsScreen';
export { TechnicianProfileScreen } from './screens/TechnicianProfileScreen';
export {
  TechnicianSetupScreen,
  type TechnicianSetupScreenProps,
} from './screens/TechnicianSetupScreen';
export { TechnicianSkillsScreen } from './screens/TechnicianSkillsScreen';
export { TechnicianStatsScreen } from './screens/TechnicianStatsScreen';
export {
  UpgradeRequestScreen,
  type UpgradeRequestScreenProps,
} from './screens/UpgradeRequestScreen';
export type {
  Location,
  LocationPayload,
  ProfilePayload,
  UpgradePayload,
} from './schemas/profileSchemas';
export type { Skill } from './schemas/skillSchemas';
export type {
  ServiceAreaPayload,
  ServicePerimeter,
  TechnicianIdentity,
  TechnicianSkill,
  TechnicianStats,
} from './schemas/technicianSchemas';
