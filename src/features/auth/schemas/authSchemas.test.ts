import {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  toRegisterPayload,
  twoFactorCodeSchema,
  type RegisterFormValues,
} from './authSchemas';

const messagesOf = (result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) =>
  Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join('.'), issue.message]),
  );

const validRegistration: RegisterFormValues = {
  role: 'client',
  name: 'Awa Diallo',
  email: 'awa@example.test',
  phone: '',
  password: 'motdepasse',
  password_confirmation: 'motdepasse',
  agency_name: '',
  address: '',
  description: '',
  bio: '',
};

describe('loginFormSchema', () => {
  it('normalise l’adresse et accepte des identifiants renseignés', () => {
    expect(loginFormSchema.parse({ email: '  awa@example.test ', password: 'x' })).toEqual({
      email: 'awa@example.test',
      password: 'x',
    });
  });

  it('signale les champs vides et l’adresse invalide par des clés de traduction', () => {
    expect(messagesOf(loginFormSchema.safeParse({ email: '', password: '' }))).toEqual({
      email: 'auth:validation.required',
      password: 'auth:validation.required',
    });
    expect(messagesOf(loginFormSchema.safeParse({ email: 'awa', password: 'x' }))).toEqual({
      email: 'auth:validation.email',
    });
  });
});

describe('registerFormSchema', () => {
  it('accepte une inscription client minimale', () => {
    expect(registerFormSchema.safeParse(validRegistration).success).toBe(true);
  });

  it('exige 8 caractères et une confirmation identique', () => {
    expect(
      messagesOf(
        registerFormSchema.safeParse({
          ...validRegistration,
          password: 'court',
          password_confirmation: 'court',
        }),
      ),
    ).toEqual({
      password: 'auth:validation.passwordLength',
    });
    expect(
      messagesOf(
        registerFormSchema.safeParse({
          ...validRegistration,
          password_confirmation: 'autre-chose',
        }),
      ),
    ).toEqual({
      password_confirmation: 'auth:validation.passwordMismatch',
    });
  });

  it('exige le nom d’agence pour le rôle agence uniquement', () => {
    expect(
      messagesOf(registerFormSchema.safeParse({ ...validRegistration, role: 'agence' })),
    ).toEqual({
      agency_name: 'auth:validation.required',
    });
  });

  it('borne le téléphone à 50 caractères', () => {
    expect(
      messagesOf(registerFormSchema.safeParse({ ...validRegistration, phone: '1'.repeat(51) })),
    ).toEqual({
      phone: 'auth:validation.tooLong',
    });
  });
});

describe('toRegisterPayload', () => {
  it('omet les champs facultatifs vides et ceux des autres rôles', () => {
    expect(
      toRegisterPayload({ ...validRegistration, bio: 'ignorée', agency_name: 'ignoré' }),
    ).toEqual({
      role: 'client',
      name: 'Awa Diallo',
      email: 'awa@example.test',
      password: 'motdepasse',
      password_confirmation: 'motdepasse',
    });
  });

  it('transmet les champs d’agence', () => {
    expect(
      toRegisterPayload({
        ...validRegistration,
        role: 'agence',
        phone: '690000000',
        agency_name: 'Batimat',
        address: 'Douala',
      }),
    ).toEqual({
      role: 'agence',
      name: 'Awa Diallo',
      email: 'awa@example.test',
      phone: '690000000',
      password: 'motdepasse',
      password_confirmation: 'motdepasse',
      agency_name: 'Batimat',
      address: 'Douala',
    });
  });

  it('transmet la présentation du technicien', () => {
    expect(
      toRegisterPayload({ ...validRegistration, role: 'technicien', bio: 'Électricien' }),
    ).toMatchObject({
      role: 'technicien',
      bio: 'Électricien',
    });
  });
});

describe('forgotPasswordFormSchema et twoFactorCodeSchema', () => {
  it('valide l’adresse électronique', () => {
    expect(forgotPasswordFormSchema.safeParse({ email: 'awa@example.test' }).success).toBe(true);
    expect(forgotPasswordFormSchema.safeParse({ email: 'awa' }).success).toBe(false);
  });

  it('exige un code à six chiffres', () => {
    expect(twoFactorCodeSchema.safeParse({ code: '123456' }).success).toBe(true);
    expect(messagesOf(twoFactorCodeSchema.safeParse({ code: '12345a' }))).toEqual({
      code: 'auth:validation.twoFactorCode',
    });
  });
});
