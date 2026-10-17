import completed from '@/test/fixtures/interventions/intervention-completed.json';
import created from '@/test/fixtures/interventions/intervention-created.json';
import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';

import {
  interventionListResponseSchema,
  interventionResponseSchema,
  reportFormSchema,
  toReportPayload,
} from './interventionSchemas';

describe('interventionSchemas', () => {
  it('lit le détail capturé et convertit la durée décimale', () => {
    const parsed = interventionResponseSchema.parse(intervention).data;

    expect(parsed.status).toBe('completed');
    expect(parsed.duration_hours).toBe(1.5);
    expect(parsed.materials_used).toEqual(intervention.data.materials_used);
    expect(parsed.technician?.name).toBe(intervention.data.technician.name);
  });

  it('lit une intervention créée, sans rapport encore', () => {
    const parsed = interventionResponseSchema.parse(created).data;

    expect(parsed.status).toBe('planned');
    expect(parsed.work_performed).toBeUndefined();
  });

  it('lit la clôture capturée', () => {
    expect(interventionResponseSchema.parse(completed).data.completed_at).not.toBeNull();
  });

  it('lit la liste paginée capturée', () => {
    const page = interventionListResponseSchema.parse(interventions).data;

    expect(page.data).toHaveLength(interventions.data.data.length);
  });

  it('exige le travail effectué', () => {
    const result = reportFormSchema.safeParse({
      workPerformed: '   ',
      materials: '',
      hours: '',
      notes: '',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('interventions:report.errors.workRequired');
  });

  it('refuse une durée non numérique', () => {
    const result = reportFormSchema.safeParse({
      workPerformed: 'Remplacement',
      materials: '',
      hours: 'deux heures',
      notes: '',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('interventions:report.errors.hoursInvalid');
  });

  it('transforme la saisie en corps de requête', () => {
    expect(
      toReportPayload({
        workPerformed: '  Remplacement du disjoncteur  ',
        materials: 'Disjoncteur 16 A\n\n  Gaine  \n',
        hours: '1.5',
        notes: '  ',
      }),
    ).toEqual({
      workPerformed: 'Remplacement du disjoncteur',
      materials: ['Disjoncteur 16 A', 'Gaine'],
      hours: 1.5,
      notes: null,
    });
  });

  it('accepte une durée vide', () => {
    expect(
      toReportPayload({ workPerformed: 'Contrôle', materials: '', hours: '', notes: '' }),
    ).toEqual({ workPerformed: 'Contrôle', materials: [], hours: null, notes: null });
  });
});
