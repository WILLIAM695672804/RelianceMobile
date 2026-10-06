import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components';

import { JOB_TIMELINE, timelineIndexOf } from '../model/jobStatus';

/** Frise de suivi d'une mission : chaque étape est annoncée comme faite ou à venir. */
export function MissionTimeline({ status }: { status: string }) {
  const { t } = useTranslation();
  const current = timelineIndexOf(status);
  return (
    <View style={styles.timeline}>
      {JOB_TIMELINE.map((step, index) => {
        const done = current >= 0 && index <= current;
        const label = t(`missions:status.${step}`);
        return (
          <Text
            key={step}
            tone={done ? 'primary' : 'muted'}
            accessibilityLabel={t(
              done ? 'missions:cockpit.stepDone' : 'missions:cockpit.stepTodo',
              {
                label,
              },
            )}
          >
            {label}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 2 },
});
