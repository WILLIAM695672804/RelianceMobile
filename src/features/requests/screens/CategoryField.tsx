import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { groupSkillsByCategory, useSkillCatalog } from '@/features/profile';
import { ListItem, StateView, Text } from '@/shared/components';

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
      <View key={group.category}>
        <Text variant="subtitle">{group.category}</Text>
        {group.skills.map((skill) => (
          <ListItem
            key={skill.id}
            label={skill.name}
            onPress={() => {
              onChange(skill.slug);
              setExpanded(false);
            }}
          />
        ))}
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
});
