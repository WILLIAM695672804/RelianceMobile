import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { groupSkillsByCategory, useSkillCatalog } from '@/features/profile';
import { Chip, Icon, ListItem, StateView, Text } from '@/shared/components';

import { iconForCategory } from '../model/categoryIcons';

export interface CategoryFieldProps {
  /** Slug de la compétence retenue, chaîne vide sinon. */
  value: string;
  onChange: (slug: string) => void;
  /** Message déjà traduit. */
  error?: string;
}

/** Choix de la catégorie d'une demande dans le catalogue des compétences, groupé par domaine. */
export function CategoryField({ value, onChange, error }: CategoryFieldProps) {
  const { t } = useTranslation();
  const catalog = useSkillCatalog();
  const [expanded, setExpanded] = useState(false);
  const selected = catalog.data?.find((skill) => skill.slug === value);

  const renderOptions = () => {
    if (catalog.isPending) return <StateView status="loading" />;
    if (catalog.isError) {
      return (
        <StateView status="error" error={catalog.error} onRetry={() => void catalog.refetch()} />
      );
    }
    return groupSkillsByCategory(catalog.data, t('requests:form.otherCategory')).map((group) => (
      <View key={group.category} style={styles.group}>
        <View style={styles.groupHeader}>
          <Icon name={iconForCategory(group.category)} size={18} tone="primary" />
          <Text variant="label">{group.category}</Text>
        </View>
        <View style={styles.chips}>
          {group.skills.map((skill) => (
            <Chip
              key={skill.id}
              label={skill.name}
              selected={skill.slug === value}
              onPress={() => {
                onChange(skill.slug);
                setExpanded(false);
              }}
            />
          ))}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.field}>
      <Text variant="caption" tone="muted">
        {t('requests:form.category')}
      </Text>
      <ListItem
        label={selected?.name ?? t('requests:form.chooseCategory')}
        detail={selected?.category ?? undefined}
        icon={iconForCategory(selected?.category)}
        onPress={() => setExpanded((current) => !current)}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
      {expanded ? renderOptions() : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  group: { gap: 8, paddingTop: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
