import {
  locationFormSchema,
  passwordFormSchema,
  profileFormSchema,
  toLocationPayload,
  toProfilePayload,
  toUpgradePayload,
  upgradeFormSchema,
} from './profileSchemas';

const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('profileFormSchema', () => {
  it('exige un nom et une adresse valide', () => {
    expect(
      firstMessage(profileFormSchema.safeParse({ name: ' ', email: 'a@b.test', phone: '' })),
    ).toBe('profile:validation.required');
    expect(
      firstMessage(profileFormSchema.safeParse({ name: 'Awa', email: 'awa', phone: '' })),
    ).toBe('profile:validation.email');
  });
});

describe('toProfilePayload', () => {
  const initial = { name: 'Awa', email: 'awa@example.test', phone: '690000000' };

  it('n’envoie que les champs modifiés', () => {
    expect(toProfilePayload({ ...initial, name: 'Awa Diallo' }, initial)).toEqual({
      name: 'Awa Diallo',
    });
    expect(toProfilePayload(initial, initial)).toEqual({});
  });

  it('n’envoie pas un téléphone effacé, que le backend refuse', () => {
    expect(toProfilePayload({ ...initial, phone: '' }, initial)).toEqual({});
  });
});

describe('passwordFormSchema', () => {
  it('exige huit caractères et une confirmation identique', () => {
    const base = {
      current_password: 'ancien',
      new_password: 'nouveau-mdp',
      new_password_confirmation: 'nouveau-mdp',
    };
    expect(passwordFormSchema.safeParse(base).success).toBe(true);
    expect(
      firstMessage(
        passwordFormSchema.safeParse({
          ...base,
          new_password: 'court',
          new_password_confirmation: 'court',
        }),
      ),
    ).toBe('profile:validation.passwordLength');
    const mismatch = passwordFormSchema.safeParse({
      ...base,
      new_password_confirmation: 'autre-mdp',
    });
    expect(mismatch.error?.issues[0]).toMatchObject({
      path: ['new_password_confirmation'],
      message: 'profile:validation.passwordMismatch',
    });
  });
});

describe('adresses', () => {
  it('exige un libellé de 50 caractères au plus et une adresse', () => {
    expect(
      firstMessage(
        locationFormSchema.safeParse({
          label: 'x'.repeat(51),
          address: 'Rue 1',
          city: '',
          is_default: false,
        }),
      ),
    ).toBe('profile:validation.tooLong');
    expect(
      firstMessage(
        locationFormSchema.safeParse({ label: 'Maison', address: '', city: '', is_default: false }),
      ),
    ).toBe('profile:validation.required');
  });

  it('omet la ville vide', () => {
    expect(
      toLocationPayload({ label: 'Maison', address: 'Rue 1', city: '', is_default: true }),
    ).toEqual({
      label: 'Maison',
      address: 'Rue 1',
      is_default: true,
    });
    expect(
      toLocationPayload({ label: 'Maison', address: 'Rue 1', city: 'Douala', is_default: false })
        .city,
    ).toBe('Douala');
  });
});

describe('passage technicien', () => {
  it('exige une motivation de vingt caractères', () => {
    expect(firstMessage(upgradeFormSchema.safeParse({ motivation: 'Trop court', bio: '' }))).toBe(
      'profile:validation.motivationLength',
    );
  });

  it('omet la présentation vide', () => {
    const motivation = 'Électricien depuis dix ans à Douala.';
    expect(toUpgradePayload({ motivation, bio: '' })).toEqual({ motivation });
    expect(toUpgradePayload({ motivation, bio: 'Bio' })).toEqual({ motivation, bio: 'Bio' });
  });
});
