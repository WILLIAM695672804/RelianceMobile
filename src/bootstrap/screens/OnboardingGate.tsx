import { useState, type ReactNode } from 'react';

import {
  OnboardingView,
  RoleSelectView,
  useChosenRole,
  type OnboardingFlag,
} from '@/features/auth';

export interface OnboardingGateProps {
  flag: OnboardingFlag;
  children: ReactNode;
}

type Stage = 'slides' | 'roles' | 'done';

/**
 * Interpose le fil d'accueil (`onboarding → role-select`) devant l'espace invité, au premier
 * lancement seulement. Le rôle choisi n'oriente que le lien d'inscription web.
 */
export function OnboardingGate({ flag, children }: OnboardingGateProps) {
  const [stage, setStage] = useState<Stage>(() => (flag.seen() ? 'done' : 'slides'));
  const choose = useChosenRole((state) => state.choose);

  const finish = () => {
    flag.markSeen();
    setStage('done');
  };

  if (stage === 'done') return <>{children}</>;
  if (stage === 'slides') {
    return <OnboardingView onFinish={() => setStage('roles')} onSkip={() => setStage('roles')} />;
  }
  return (
    <RoleSelectView
      onSelect={(role) => {
        choose(role);
        finish();
      }}
      onSignIn={finish}
    />
  );
}
