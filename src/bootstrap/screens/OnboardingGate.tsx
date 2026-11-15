import { useState, type ReactNode } from 'react';

import { OnboardingScreen, type OnboardingFlag } from '@/features/auth';

export interface OnboardingGateProps {
  flag: OnboardingFlag;
  children: ReactNode;
}

/**
 * Interpose le fil d'accueil devant l'espace invité, au premier lancement seulement.
 * La maquette enchaîne `onboarding → role-select → login` ; le rôle étant choisi à
 * l'inscription, le fil mène directement à la connexion.
 */
export function OnboardingGate({ flag, children }: OnboardingGateProps) {
  const [seen, setSeen] = useState(() => flag.seen());

  if (seen) return <>{children}</>;
  return (
    <OnboardingScreen
      onDone={() => {
        flag.markSeen();
        setSeen(true);
      }}
    />
  );
}
