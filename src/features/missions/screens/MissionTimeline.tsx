import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/theme';
import { Icon, Text } from '@/shared/ui';

import { JOB_TIMELINE, timelineIndexOf } from '../model/jobStatus';

/**
 * Frise de suivi d'une mission : colonne de pastilles reliées par un trait, chaque étape
 * étant annoncée comme faite, courante ou à venir.
 */
export function MissionTimeline({ status }: { status: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const current = timelineIndexOf(status);
  return (
    <View style={styles.timeline}>
      {JOB_TIMELINE.map((step, index) => {
        const done = current >= 0 && index < current;
        const isCurrent = index === current;
        const reached = done || isCurrent;
        const label = t(`missions:status.${step}`);
        const last = index === JOB_TIMELINE.length - 1;
        return (
          <View key={step} style={styles.row}>
            <View style={styles.gutter}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: reached ? theme.colors.primary : theme.colors.surfaceMuted,
                    borderColor: reached ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Icon
                  name={done ? 'check' : isCurrent ? 'clock' : 'minus'}
                  size={13}
                  color={reached ? theme.colors.onPrimary : theme.colors.textMuted}
                />
              </View>
              {last ? null : (
                <View
                  style={[
                    styles.link,
                    { backgroundColor: done ? theme.colors.primary : theme.colors.divider },
                  ]}
                />
              )}
            </View>
            <Text
              tone={reached ? 'primary' : 'muted'}
              variant={isCurrent ? 'labelStrong' : 'label'}
              style={styles.label}
              accessibilityLabel={t(
                reached ? 'missions:cockpit.stepDone' : 'missions:cockpit.stepTodo',
                { label },
              )}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 0 },
  row: { flexDirection: 'row', gap: 12 },
  gutter: { alignItems: 'center', width: 24 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { width: 2, flex: 1, minHeight: 12 },
  label: { flex: 1, paddingBottom: 12 },
});
