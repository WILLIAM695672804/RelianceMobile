import { completedSteps, SETUP_STEPS, setupStepsFor } from './setupSteps';

const empty = {
  bio: null,
  skillCount: 0,
  radiusKm: null,
  kycApproved: false,
  timeSlotCount: 0,
};

describe('setupStepsFor', () => {
  it('rend les cinq étapes dans l’ordre des maquettes', () => {
    expect(setupStepsFor(empty).map((step) => step.key)).toEqual([...SETUP_STEPS]);
  });

  it('ne tient rien pour acquis sur un compte neuf', () => {
    expect(setupStepsFor(empty).every((step) => !step.done)).toBe(true);
  });

  it('marque le profil achevé dès que la présentation est rédigée', () => {
    const steps = setupStepsFor({ ...empty, bio: 'Électricien depuis dix ans' });

    expect(steps.find((step) => step.key === 'professional')?.done).toBe(true);
  });

  it('écarte une présentation vide de sens', () => {
    expect(
      setupStepsFor({ ...empty, bio: '   ' }).find((step) => step.key === 'professional')?.done,
    ).toBe(false);
  });

  it('exige au moins une compétence, un rayon et un créneau', () => {
    const steps = setupStepsFor({
      ...empty,
      skillCount: 2,
      radiusKm: 15,
      timeSlotCount: 1,
    });

    expect(steps.find((step) => step.key === 'skills')?.done).toBe(true);
    expect(steps.find((step) => step.key === 'zone')?.done).toBe(true);
    expect(steps.find((step) => step.key === 'planning')?.done).toBe(true);
  });

  it('écarte un rayon nul', () => {
    expect(setupStepsFor({ ...empty, radiusKm: 0 }).find((step) => step.key === 'zone')?.done).toBe(
      false,
    );
  });

  it('compte les étapes achevées', () => {
    expect(completedSteps(setupStepsFor(empty))).toBe(0);
    expect(
      completedSteps(
        setupStepsFor({
          bio: 'x',
          skillCount: 1,
          radiusKm: 10,
          kycApproved: true,
          timeSlotCount: 1,
        }),
      ),
    ).toBe(5);
  });
});
