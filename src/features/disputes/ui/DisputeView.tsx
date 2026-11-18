import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import type { UploadFile } from '@/core/api';
import { useTheme } from '@/core/theme';
import { formatAmount } from '@/shared/format';
import {
  Avatar,
  Banner,
  Button,
  Field,
  Icon,
  RadioRow,
  Screen,
  SectionLabel,
  Text,
  TopBar,
  type IconName,
} from '@/shared/ui';

import type { DisputeReason } from '../schemas/disputeSchemas';

/** Motif proposé : sa clé est un motif reconnu par le serveur. */
export interface DisputeReasonOption {
  key: DisputeReason;
  label: string;
  hint: string;
  icon: IconName;
}

export interface DisputeValues {
  reason: DisputeReason;
  details: string;
  photos: UploadFile[];
}

export interface DisputeViewProps {
  mission: { technicianName: string; detail: string; reference: string; held: number | null };
  reasons: readonly DisputeReasonOption[];
  submitting?: boolean;
  formError?: string | null;
  /** Absent, la rubrique des preuves n'est pas proposée (le serveur ne les reçoit pas). */
  onPickPhoto?: () => Promise<UploadFile | null>;
  onCancel: () => void;
  onSubmit: (values: DisputeValues) => void;
}

/** Ouverture d'un litige (maquette `DisputeScreen`), présentation pure. */
export function DisputeView(props: DisputeViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reason, setReason] = useState<DisputeReason | null>(null);
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<UploadFile[]>([]);

  const addPhoto = async () => {
    const file = props.onPickPhoto ? await props.onPickPhoto() : null;
    if (file) setPhotos((current) => [...current, file]);
  };

  return (
    <Screen
      testID="litige"
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={t('disputes:open.cancel')}
              variant="ghost"
              size="lg"
              full
              onPress={props.onCancel}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              label={t('disputes:open.submit')}
              size="lg"
              full
              disabled={!reason}
              loading={props.submitting}
              onPress={() => reason && props.onSubmit({ reason, details: details.trim(), photos })}
            />
          </View>
        </View>
      }
    >
      <TopBar title={t('disputes:open.title')} align="center" onBack={props.onCancel} />
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 16 }}>
        <Banner tone="danger" icon="shield" message={t('disputes:open.secured')} />
        {props.formError ? <Banner tone="danger" message={props.formError} /> : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Avatar name={props.mission.technicianName} size={40} />
          <View style={{ flex: 1 }}>
            <Text variant="labelStrong">
              {props.mission.technicianName} · {props.mission.detail}
            </Text>
            <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
              {props.mission.held != null
                ? t('disputes:open.missionHeld', {
                    reference: props.mission.reference,
                    amount: formatAmount(props.mission.held),
                  })
                : props.mission.reference}
            </Text>
          </View>
        </View>

        <View>
          <SectionLabel label={t('disputes:open.reason')} />
          <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
            {props.reasons.map((item) => (
              <RadioRow
                key={item.key}
                label={item.label}
                hint={item.hint}
                icon={item.icon}
                color={theme.colors.danger}
                selected={reason === item.key}
                onPress={() => setReason(item.key)}
              />
            ))}
          </View>
        </View>

        <Field
          label={t('disputes:open.details')}
          value={details}
          onChangeText={setDetails}
          placeholder={t('disputes:open.detailsPlaceholder')}
          multiline
        />

        {props.onPickPhoto ? (
          <View>
            <SectionLabel label={t('disputes:open.evidence')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((photo, index) => (
                <Pressable
                  key={`${photo.uri}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={t('disputes:open.removeEvidence', { number: index + 1 })}
                  onPress={() =>
                    setPhotos((current) => current.filter((_, position) => position !== index))
                  }
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 10,
                      backgroundColor: theme.colors.surfaceHigh,
                    }}
                  />
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('disputes:open.addEvidence')}
                onPress={() => void addPhoto()}
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: theme.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Icon name="plus" size={18} tone="muted" />
                <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                  {t('disputes:open.add')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Text variant="caption" tone="muted" style={{ fontSize: 11, lineHeight: 16 }}>
          {t('disputes:open.notice')}
        </Text>
      </View>
    </Screen>
  );
}
