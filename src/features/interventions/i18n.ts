import type { TranslationResources } from '@/core/i18n';

const fr = {
  report: {
    title: 'Rapport d’intervention',
    readTitle: 'Rapport du technicien',
    statuses: {
      planned: 'Planifiée',
      in_progress: 'En cours',
      completed: 'Terminée',
    },
    sections: {
      work: 'Travail effectué',
      materials: 'Matériels employés',
      duration: 'Durée',
      notes: 'Observations',
    },
    fields: {
      work: 'Travail effectué',
      materials: 'Matériels employés (une ligne par pièce)',
      hours: 'Durée en heures',
      notes: 'Observations (facultatif)',
    },
    submit: 'Clôturer l’intervention',
    submitted: 'Rapport enregistré.',
    noReport: 'Le technicien n’a pas encore déposé son rapport.',
    materialsLine: 'Matériel employé : {{list}}',
    noMaterials: 'Aucun matériel déclaré.',
    errors: {
      workRequired: 'Décrivez le travail effectué.',
      workTooLong: 'Le texte est trop long.',
      materialsTooLong: 'La liste est trop longue.',
      hoursInvalid: 'Indiquez une durée en heures, par exemple 1.5.',
      notesTooLong: 'Les observations sont trop longues.',
    },
  },
};

const en: typeof fr = {
  report: {
    title: 'Job report',
    readTitle: 'Technician report',
    statuses: {
      planned: 'Planned',
      in_progress: 'In progress',
      completed: 'Completed',
    },
    sections: {
      work: 'Work performed',
      materials: 'Materials used',
      duration: 'Duration',
      notes: 'Notes',
    },
    fields: {
      work: 'Work performed',
      materials: 'Materials used (one per line)',
      hours: 'Duration in hours',
      notes: 'Notes (optional)',
    },
    submit: 'Close the job',
    submitted: 'Report saved.',
    noReport: 'The technician has not filed a report yet.',
    materialsLine: 'Materials used: {{list}}',
    noMaterials: 'No material declared.',
    errors: {
      workRequired: 'Describe the work performed.',
      workTooLong: 'The text is too long.',
      materialsTooLong: 'The list is too long.',
      hoursInvalid: 'Enter a duration in hours, for example 1.5.',
      notesTooLong: 'The notes are too long.',
    },
  },
};

/** Ressources du namespace `interventions`. */
export const interventionsTranslations: TranslationResources = {
  fr: { interventions: fr },
  en: { interventions: en },
};
