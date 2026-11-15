import { useTranslation } from 'react-i18next';

import type { AppErrorKind } from '@/core/errors';

import { EmptyState, type EmptyStateTone } from './EmptyState';
import type { IconName } from './Icon';

interface Presentation {
  icon: IconName;
  tone: EmptyStateTone;
  title: string;
  /** Clé du texte détaillé ; à défaut, le message de la catégorie (`errors:<kind>`). */
  body?: string;
  action: string;
  offerSupport: boolean;
}

/** Présentation des variantes de la maquette `EmptyStatesScreen` selon la catégorie d'erreur. */
function presentationOf(kind: AppErrorKind): Presentation {
  switch (kind) {
    case 'network':
    case 'timeout':
      return {
        icon: 'close',
        tone: 'warning',
        title: 'errors:states.offlineTitle',
        body: 'errors:states.offlineBody',
        action: 'errors:states.retry',
        offerSupport: false,
      };
    case 'rateLimited':
      return {
        icon: 'clock',
        tone: 'warning',
        title: 'errors:states.limitTitle',
        action: 'errors:states.limitAction',
        offerSupport: false,
      };
    case 'server':
    case 'contract':
    case 'unknown':
    case 'csrf':
      return {
        icon: 'close',
        tone: 'danger',
        title: 'errors:states.serverTitle',
        action: 'errors:states.retry',
        offerSupport: true,
      };
    default:
      return {
        icon: 'info',
        tone: 'neutral',
        title: 'errors:states.genericTitle',
        action: 'errors:states.retry',
        offerSupport: false,
      };
  }
}

export interface ErrorStateProps {
  kind: AppErrorKind;
  /** Message propre à l'écran ; à défaut, le texte de la catégorie. */
  message?: string;
  onRetry?: () => void;
  /** Fourni, propose « Contacter le support » pour les pannes du serveur. */
  onSupport?: () => void;
  testID?: string;
}

/** État d'erreur plein écran, déduit de la catégorie d'`AppError`. */
export function ErrorState({ kind, message, onRetry, onSupport, testID }: ErrorStateProps) {
  const { t } = useTranslation();
  const presentation = presentationOf(kind);
  return (
    <EmptyState
      testID={testID}
      icon={presentation.icon}
      tone={presentation.tone}
      title={t(presentation.title)}
      message={message ?? t(presentation.body ?? `errors:${kind}`)}
      actionLabel={onRetry ? t(presentation.action) : undefined}
      onAction={onRetry}
      secondaryLabel={
        presentation.offerSupport && onSupport ? t('errors:states.support') : undefined
      }
      onSecondary={presentation.offerSupport ? onSupport : undefined}
    />
  );
}
