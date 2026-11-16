import { create } from 'zustand';

import type { RegistrableRole } from '../schemas/authSchemas';

interface ChosenRoleState {
  /** Rôle choisi à l'accueil ; oriente le lien d'inscription vers le bon parcours web. */
  role: RegistrableRole;
  choose: (role: RegistrableRole) => void;
}

/** Rôle choisi à l'écran d'accueil (mémoire seule : il ne survit pas au redémarrage). */
export const useChosenRole = create<ChosenRoleState>((set) => ({
  role: 'client',
  choose: (role) => set({ role }),
}));
