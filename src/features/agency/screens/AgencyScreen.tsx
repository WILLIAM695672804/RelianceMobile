import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { describeError, normalizeError } from '@/core/errors';
import { View } from 'react-native';

import { FormField } from '@/shared/forms';
import {
  Banner,
  Button,
  Card,
  ListRow,
  QueryGate,
  Screen,
  Section,
  Text,
  TopBar,
} from '@/shared/ui';

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

  return (
    <Screen
      withTabBar
      testID="espace-agence"
      onRefresh={() => void agency.refetch()}
      refreshing={agency.isRefetching}
    >
      <TopBar title={t('agency:overview.title')} />
      <QueryGate queries={[agency]}>
        {() =>
          agency.data === null || agency.data === undefined ? (
            <AgencyCreation />
          ) : (
            <AgencyOverview agency={agency.data} onOpenTeam={onOpenTeam} />
          )
        }
      </QueryGate>
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
    <Card padding={16}>
      <View style={{ gap: 14 }}>
        <FormField control={form.control} name="name" label={t('agency:form.name')} icon="badge" />
        <FormField
          control={form.control}
          name="description"
          label={t('agency:form.description')}
          multiline
        />
        <FormField
          control={form.control}
          name="address"
          label={t('agency:form.address')}
          icon="pin"
        />
        <FormField
          control={form.control}
          name="phone"
          label={t('agency:form.phone')}
          icon="phone"
          keyboardType="phone-pad"
        />
        <FormField
          control={form.control}
          name="email"
          label={t('agency:form.email')}
          icon="inbox"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          label={submitLabel}
          size="lg"
          full
          onPress={() => void form.handleSubmit(onSubmit)()}
          loading={pending}
        />
      </View>
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
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      <Text variant="label" tone="muted">
        {t('agency:overview.none')}
      </Text>
      {notice ? <Banner tone="success" message={notice} /> : null}
      {error ? <Banner tone="danger" message={error} /> : null}
      <Text variant="section">{t('agency:form.createTitle')}</Text>
      <AgencyForm
        initial={EMPTY_FORM}
        submitLabel={t('agency:form.create')}
        pending={createAgency.isPending}
        onSubmit={submit}
      />
    </View>
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

  const facts = [
    agency.address
      ? { icon: 'pin' as const, label: t('agency:overview.address', { address: agency.address }) }
      : null,
    agency.contact_phone
      ? {
          icon: 'phone' as const,
          label: t('agency:overview.phone', { phone: agency.contact_phone }),
        }
      : null,
    agency.contact_email
      ? {
          icon: 'inbox' as const,
          label: t('agency:overview.email', { email: agency.contact_email }),
        }
      : null,
  ].filter((fact): fact is { icon: 'pin' | 'phone' | 'inbox'; label: string } => Boolean(fact));

  return (
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      <Card padding={16}>
        <Text variant="title">{agency.name}</Text>
        <Text variant="label" tone="muted" style={{ marginTop: 4 }}>
          {t('agency:overview.members', { count: agency.members.length })}
        </Text>
        <Text style={{ marginTop: 8 }}>
          {agency.description
            ? t('agency:overview.description', { description: agency.description })
            : t('agency:overview.noDescription')}
        </Text>
      </Card>
      {facts.length > 0 ? (
        <Card padding={0}>
          {facts.map((fact, index) => (
            <ListRow key={fact.label} icon={fact.icon} divider={index > 0} title={fact.label} />
          ))}
        </Card>
      ) : null}
      {notice ? <Banner tone="success" message={notice} /> : null}
      {error ? <Banner tone="danger" message={error} /> : null}
      <Button
        label={t('agency:overview.openTeam')}
        icon="user"
        size="lg"
        full
        onPress={() => onOpenTeam(agency.id)}
      />
      <Button
        label={t(editing ? 'agency:overview.cancelEdit' : 'agency:overview.edit')}
        variant="soft"
        full
        onPress={() => setEditing((open) => !open)}
      />
      {editing ? (
        <Section title={t('agency:form.editTitle')}>
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
        </Section>
      ) : null}
    </View>
  );
}
