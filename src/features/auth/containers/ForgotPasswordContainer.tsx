import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';

import { useForgotPassword } from '../hooks/useAuthMutations';
import { ForgotPasswordView } from '../ui/ForgotPasswordView';

export interface ForgotPasswordContainerProps {
  onBack: () => void;
}

/** Demande du lien de réinitialisation, branchée sur l'API. */
export function ForgotPasswordContainer({ onBack }: ForgotPasswordContainerProps) {
  const { t } = useTranslation();
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>();

  const submit = async (email: string) => {
    setFormError(null);
    setEmailError(undefined);
    try {
      await forgot.mutateAsync(email);
      setSent(true);
    } catch (error) {
      const appError = normalizeError(error);
      const fieldMessage =
        appError.kind === 'validation' ? appError.fieldErrors.email?.[0] : undefined;
      if (fieldMessage) setEmailError(fieldMessage);
      else setFormError(describeError(appError, t));
    }
  };

  return (
    <ForgotPasswordView
      status={sent ? 'sent' : 'form'}
      submitting={forgot.isPending}
      formError={formError}
      emailError={emailError}
      onSubmit={(email) => void submit(email)}
      onBack={onBack}
    />
  );
}
