import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useKycDocuments } from '@/features/kyc';
import { useCalendar } from '@/features/planning';
import {
  Card,
  ListItem,
  Screen,
  SectionHeader,
  StateView,
  StepIndicator,
  Text,
  type IconName,
} from '@/shared/components';

import { useTechnicianIdentity } from '../hooks/useTechnician';
import {
  completedSteps,
  setupStepsFor,
  type SetupStepKey,
  type SetupStep,
} from '../model/setupSteps';

const STEP_ICONS: Record<SetupStepKey, IconName> = {
  professional: 'badge',
  skills: 'wrench',
  zone: 'map',
  kyc: 'file',
  planning: 'calendar',
};

export interface TechnicianSetupScreenProps {
  /** Ouverture de l'écran d'une étape. */
  onOpen: (step: SetupStepKey) => void;
  onBack?: () => void;
}

/**
 * Parcours d'installation du technicien. La maquette impose un assistant en cinq écrans ;
 * ces cinq écrans existent et restent utilisables séparément. Le parcours en expose donc
 * l'état d'avancement sans enfermer l'utilisateur dans une séquence.
 */
export function TechnicianSetupScreen({ onOpen, onBack }: TechnicianSetupScreenProps) {
  const { t } = useTranslation();
  const identity = useTechnicianIdentity();
  const documents = useKycDocuments();
  const calendar = useCalendar();

  const steps = setupStepsFor({
    bio: identity.data?.bio,
    skillCount: identity.data?.skills.length ?? 0,
    radiusKm: identity.data?.service_perimeter?.radius,
    kycApproved: identity.data?.kyc_approved === true,
    timeSlotCount: calendar.data?.recurring_slots.length ?? 0,
  });
  const done = completedSteps(steps);

  const renderStep = (step: SetupStep) => (
    <ListItem
      key={step.key}
      label={t(`profile:setup.steps.${step.key}.title`)}
      detail={t(step.done ? 'profile:setup.doneLabel' : `profile:setup.steps.${step.key}.hint`)}
      icon={STEP_ICONS[step.key]}
      trailing={
        <Text variant="label" tone={step.done ? 'success' : 'muted'}>
          {t(step.done ? 'profile:setup.doneMark' : 'profile:setup.todoMark')}
        </Text>
      }
      onPress={() => onOpen(step.key)}
      testID={`setup-step-${step.key}`}
    />
  );

  return (
    <Screen
      title={t('profile:setup.title')}
      onBack={onBack}
      onRefresh={() => {
        void identity.refetch();
        void documents.refetch();
        void calendar.refetch();
      }}
      refreshing={identity.isRefetching}
    >
      {identity.isPending ? <StateView status="loading" /> : null}
      {identity.isError ? (
        <StateView status="error" error={identity.error} onRetry={() => void identity.refetch()} />
      ) : null}
      {identity.isSuccess ? (
        <>
          <Card tone={done === steps.length ? 'primary' : 'surface'}>
            <View style={styles.header}>
              <Text variant="subtitle" style={styles.flex}>
                {t('profile:setup.progress', { done, total: steps.length })}
              </Text>
            </View>
            <StepIndicator steps={steps.length} current={done - 1} testID="setup-progress" />
            <Text tone="muted">
              {t(done === steps.length ? 'profile:setup.complete' : 'profile:setup.hint')}
            </Text>
          </Card>
          <SectionHeader title={t('profile:setup.stepsTitle')} />
          {steps.map(renderStep)}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
});
