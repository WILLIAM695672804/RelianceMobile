import identity from '@/test/fixtures/technician/identity.json';
import skillValidationError from '@/test/fixtures/technician/skill-validation-error.json';
import skills from '@/test/fixtures/technician/skills.json';
import stats from '@/test/fixtures/technician/stats.json';

import {
  formatCompetences,
  mapServiceAreaFieldErrors,
  mapTechnicianSkillFieldErrors,
  parseCompetences,
  serviceAreaFormSchema,
  technicianIdentityResponseSchema,
  technicianProfileFormSchema,
  technicianSkillFormSchema,
  technicianSkillListResponseSchema,
  technicianStatsSchema,
  toServiceAreaPayload,
  toTechnicianProfilePayload,
  toTechnicianSkillPayload,
} from './technicianSchemas';

describe('schémas du volet technicien', () => {
  it('lit le profil professionnel et normalise les listes absentes', () => {
    const parsed = technicianIdentityResponseSchema.parse(identity).data;

    expect(parsed.id).toBe(identity.data.id);
    expect(parsed.competences).toEqual([]);
    expect(parsed.badges).toEqual([]);
    expect(parsed.service_perimeter?.radius).toBe(identity.data.service_perimeter.radius);
    expect(typeof parsed.skills[0]?.hourly_rate).toBe('number');
  });

  it('lit les compétences tarifées et les statistiques', () => {
    const list = technicianSkillListResponseSchema.parse(skills).data;
    expect(list).toHaveLength(skills.data.length);
    expect(typeof list[0]?.travel_fee).toBe('number');

    const parsed = technicianStatsSchema.parse(stats);
    expect(parsed.missions_total).toBe(stats.missions_total);
    expect(parsed.monthly_missions).toHaveLength(stats.monthly_missions.length);
    expect(parsed.recent_missions).toEqual([]);
  });

  it('accepte des statistiques partielles', () => {
    expect(
      technicianStatsSchema.parse({ missions_total: 0, missions_completed: 0 }).category_breakdown,
    ).toEqual([]);
  });

  it('convertit les savoir-faire saisis en liste et inversement', () => {
    expect(parseCompetences(' Mise aux normes , ,Tableaux ')).toEqual([
      'Mise aux normes',
      'Tableaux',
    ]);
    expect(parseCompetences('')).toEqual([]);
    expect(formatCompetences(['Mise aux normes', 'Tableaux'])).toBe('Mise aux normes, Tableaux');
  });

  it('valide la présentation professionnelle', () => {
    expect(
      technicianProfileFormSchema.safeParse({ bio: 'Électricien.', competences: 'Normes' }).success,
    ).toBe(true);
    expect(
      technicianProfileFormSchema.safeParse({ bio: 'x'.repeat(1001), competences: '' }).error
        ?.issues[0]?.message,
    ).toBe('profile:technician.errors.bioTooLong');
    expect(
      technicianProfileFormSchema.safeParse({ bio: '', competences: 'x'.repeat(51) }).error
        ?.issues[0]?.message,
    ).toBe('profile:technician.errors.competenceTooLong');
    expect(
      toTechnicianProfilePayload({ bio: ' Électricien. ', competences: 'Normes, Tableaux' }),
    ).toEqual({ bio: 'Électricien.', competences: ['Normes', 'Tableaux'] });
  });

  it('valide la zone d’intervention et construit sa charge utile', () => {
    const valid = { address: 'Bastos', city: 'Yaoundé', radiusKm: '25', zones: 'Bastos, Nlongkak' };
    expect(serviceAreaFormSchema.safeParse(valid).success).toBe(true);
    expect(
      serviceAreaFormSchema.safeParse({ ...valid, radiusKm: '0' }).error?.issues[0]?.message,
    ).toBe('profile:zone.errors.radiusInvalid');
    expect(
      serviceAreaFormSchema.safeParse({ ...valid, radiusKm: '900' }).error?.issues[0]?.message,
    ).toBe('profile:zone.errors.radiusTooLarge');

    expect(toServiceAreaPayload(valid, { latitude: 3.848, longitude: 11.5021 })).toEqual({
      latitude: 3.848,
      longitude: 11.5021,
      address: 'Bastos',
      city: 'Yaoundé',
      radius: 25,
      zones: ['Bastos', 'Nlongkak'],
    });
    expect(
      toServiceAreaPayload(
        { address: '', city: '', radiusKm: '10', zones: '' },
        { latitude: 1, longitude: 2 },
      ),
    ).toMatchObject({ address: null, city: null, zones: [] });
  });

  it('valide l’ajout d’une compétence', () => {
    const valid = {
      skillId: 's1',
      proficiency: 4,
      experienceYears: '8',
      hourlyRate: '7500',
      travelFee: '0',
    };
    expect(technicianSkillFormSchema.safeParse(valid).success).toBe(true);
    expect(
      technicianSkillFormSchema.safeParse({ ...valid, skillId: '' }).error?.issues[0]?.message,
    ).toBe('profile:skills.errors.skillRequired');
    expect(
      technicianSkillFormSchema.safeParse({ ...valid, experienceYears: '60' }).error?.issues[0]
        ?.message,
    ).toBe('profile:skills.errors.experienceTooLong');
    expect(
      technicianSkillFormSchema.safeParse({ ...valid, hourlyRate: '7 500' }).error?.issues[0]
        ?.message,
    ).toBe('profile:skills.errors.rateInvalid');

    expect(toTechnicianSkillPayload(valid)).toEqual({
      skillId: 's1',
      proficiency: 4,
      experienceYears: 8,
      hourlyRate: 7500,
      travelFee: 0,
    });
  });

  it('rattache les erreurs du serveur aux champs des formulaires', () => {
    expect(mapTechnicianSkillFieldErrors(skillValidationError.errors)).toEqual({
      skillId: skillValidationError.errors.skill_id,
      proficiency: skillValidationError.errors.proficiency,
      experienceYears: skillValidationError.errors.experience_years,
    });
    expect(
      mapServiceAreaFieldErrors({ radius: ['Rayon invalide.'], city: ['Ville invalide.'] }),
    ).toEqual({ radiusKm: ['Rayon invalide.'], city: ['Ville invalide.'] });
  });
});
