import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { Button, Card, FormTextField, Screen, StateView, Text } from '@/shared/components';

import { useCreateAgency, useMyAgency, useUpdateAgency } from '../hooks/useAgency';
import {
  agencyFormSchema,
  toAgencyPayload,
  type Agency,
  type AgencyFormValues,
} from '../schemas/agencySchemas';

export interface AgencyScreenProps {
  /** Ouverture de l'équipe de l'agence. */
  onOpenTeam: (agencyId: string) => void;
}

/** E07 — Espace agence : fiche, équipe et création initiale. */
export function AgencyScreen({ onOpenTeam }: AgencyScreenProps) {
  const { t } = useTranslation();
  const agency = useMyAgency();

  const renderContent = () => {
    if (agency.isPending) return <StateView status="loading" />;
    if (agency.isError) {
      return (
        <StateView status="error" error={agency.error} onRetry={() => void agency.refetch()} />
      );
    }
    if (agency.data === null) return <AgencyCreation />;
    return <AgencyOverview agency={agency.data} onOpenTeam={onOpenTeam} />;
  };

  return (
    <Screen
      title={t('agency:overview.title')}
      scroll
      onRefresh={() => void agency.refetch()}
      refreshing={agency.isRefetching}
    >
      {renderContent()}
    </Screen>
  );
}

/** Formulaire partagé par la création et la mise à jour de la fiche. */
function AgencyForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
}: {
  initial: AgencyFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: AgencyFormValues) => Promise<void>;
}) {
  const { t } = useTranslation();
  const form = useForm({ resolver: zodResolver(agencyFormSchema), defaultValues: initial });

  return (
    <Card>
      <FormTextField control={form.control} name="name" label={t('agency:form.name')} />
      <FormTextField
        control={form.control}
        name="description"
        label={t('agency:form.description')}
        multiline
      />
      <FormTextField control={form.control} name="address" label={t('agency:form.address')} />
      <FormTextField
        control={form.control}
        name="phone"
        label={t('agency:form.phone')}
        keyboardType="phone-pad"
      />
      <FormTextField
        control={form.control}
        name="email"
        label={t('agency:form.email')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        label={submitLabel}
        onPress={() => void form.handleSubmit(onSubmit)()}
        loading={pending}
      />
    </Card>
  );
}

const EMPTY_FORM: AgencyFormValues = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
};

function AgencyCreation() {
  const { t } = useTranslation();
  const createAgency = useCreateAgency();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: AgencyFormValues) => {
    setNotice(null);
    setError(null);
    try {
      await createAgency.mutateAsync(toAgencyPayload(values));
      setNotice(t('agency:form.created'));
    } catch (cause) {
      const appError = normalizeError(cause);
      setError(appError.serverMessage ?? describeError(appError, t));
    }
  };

  return (
    <>
      <Text tone="muted">{t('agency:overview.none')}</Text>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <Text variant="subtitle">{t('agency:form.createTitle')}</Text>
      <AgencyForm
        initial={EMPTY_FORM}
        submitLabel={t('agency:form.create')}
        pending={createAgency.isPending}
        onSubmit={submit}
      />
    </>
  );
}

function AgencyOverview({
  agency,
  onOpenTeam,
}: {
  agency: Agency;
  onOpenTeam: (agencyId: string) => void;
}) {
  const { t } = useTranslation();
  const updateAgency = useUpdateAgency(agency.id);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: AgencyFormValues) => {
    setNotice(null);
    setError(null);
    try {
      await updateAgency.mutateAsync(toAgencyPayload(values));
      setEditing(false);
      setNotice(t('agency:form.saved'));
    } catch (cause) {
      const appError = normalizeError(cause);
      setError(appError.serverMessage ?? describeError(appError, t));
    }
  };

  return (
    <>
      <Card>
        <Text variant="subtitle">{agency.name}</Text>
        <Text tone="muted">{t('agency:overview.members', { count: agency.members.length })}</Text>
        <Text>
          {agency.description
            ? t('agency:overview.description', { description: agency.description })
            : t('agency:overview.noDescription')}
        </Text>
        {agency.address ? (
          <Text tone="muted">{t('agency:overview.address', { address: agency.address })}</Text>
        ) : null}
        {agency.contact_phone ? (
          <Text tone="muted">{t('agency:overview.phone', { phone: agency.contact_phone })}</Text>
        ) : null}
        {agency.contact_email ? (
          <Text tone="muted">{t('agency:overview.email', { email: agency.contact_email })}</Text>
        ) : null}
      </Card>
      {notice ? <Text tone="primary">{notice}</Text> : null}
      {error ? <Text tone="danger">{error}</Text> : null}
      <Button label={t('agency:overview.openTeam')} onPress={() => onOpenTeam(agency.id)} />
      <Button
        label={t(editing ? 'agency:overview.cancelEdit' : 'agency:overview.edit')}
        onPress={() => setEditing((open) => !open)}
        variant="secondary"
      />
      {editing ? (
        <>
          <Text variant="subtitle">{t('agency:form.editTitle')}</Text>
          <AgencyForm
            initial={{
              name: agency.name,
              description: agency.description ?? '',
              address: agency.address ?? '',
              phone: agency.contact_phone ?? '',
              email: agency.contact_email ?? '',
            }}
            submitLabel={t('agency:form.save')}
            pending={updateAgency.isPending}
            onSubmit={submit}
          />
        </>
      ) : null}
    </>
  );
}
