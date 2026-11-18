import { useState } from 'react';

import { normalizeError } from '@/core/errors';

import { useNotificationSettings, useUpdateNotificationSettings } from '../hooks/useNotifications';
import type { ChannelMap, NotificationChannel } from '../schemas/notificationSchemas';
import { NotificationSettingsView } from '../ui/NotificationSettingsView';

export interface NotificationSettingsContainerProps {
  onBack: () => void;
}

/** Préférences par canal : brouillon local, enregistré d'un seul envoi. */
export function NotificationSettingsContainer({ onBack }: NotificationSettingsContainerProps) {
  const settings = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const [draft, setDraft] = useState<ChannelMap | null>(null);
  const [outcome, setOutcome] = useState<'saved' | 'failed' | null>(null);
  const channels = draft ?? settings.data;

  const save = async () => {
    if (!draft) return;
    try {
      await update.mutateAsync(draft);
      setDraft(null);
      setOutcome('saved');
    } catch {
      setOutcome('failed');
    }
  };

  return (
    <NotificationSettingsView
      status={settings.isPending ? 'loading' : settings.isError ? 'error' : 'ready'}
      channels={channels ?? { in_app: true, push: true, email: true, sms: true }}
      errorKind={settings.isError ? normalizeError(settings.error).kind : undefined}
      dirty={draft !== null}
      saving={update.isPending}
      outcome={outcome}
      onToggle={(channel: NotificationChannel, value: boolean) => {
        setOutcome(null);
        setDraft({ ...(channels as ChannelMap), [channel]: value });
      }}
      onSave={() => void save()}
      onRetry={() => void settings.refetch()}
      onBack={onBack}
    />
  );
}
