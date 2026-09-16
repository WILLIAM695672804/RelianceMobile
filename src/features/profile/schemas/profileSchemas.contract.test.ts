import { describeError, normalizeError } from '@/core/errors';
import { httpError } from '@/test/httpError';
import avatarUpdated from '@/test/fixtures/profile/avatar-updated.json';
import locationCreated from '@/test/fixtures/profile/location-created.json';
import locationDeleted from '@/test/fixtures/profile/location-deleted.json';
import locations from '@/test/fixtures/profile/locations.json';
import passwordInvalid from '@/test/fixtures/profile/password-invalid.json';
import passwordValidationError from '@/test/fixtures/profile/password-validation-error.json';
import profileUpdated from '@/test/fixtures/profile/profile-updated.json';
import upgradeAlreadyTechnician from '@/test/fixtures/profile/upgrade-already-technician.json';

import {
  avatarResponseSchema,
  locationCreatedResponseSchema,
  locationListSchema,
  messageResponseSchema,
  profileUpdateResponseSchema,
} from './profileSchemas';

const t = (key: string) => `[${key}]`;

describe('contrat des réponses du profil', () => {
  it('PUT /auth/profile 200 : utilisateur mis à jour, secrets écartés', () => {
    const parsed = profileUpdateResponseSchema.parse(profileUpdated);
    expect(parsed.message).toBe('Profil mis à jour');
    expect(parsed.user.email).toBe('technicien@example.test');
    expect(parsed.user).not.toHaveProperty('two_factor_secret');
  });

  it('POST /auth/profile/avatar 200 : URL de l’avatar', () => {
    expect(avatarResponseSchema.parse(avatarUpdated).avatar_url).toMatch(
      /^http:\/\/api\.test\/storage\//,
    );
  });

  it('PUT /auth/profile/password 400 : message métier affiché tel quel', () => {
    const error = normalizeError(httpError(400, passwordInvalid));
    expect(describeError(error, t)).toBe("L'ancien mot de passe est incorrect.");
  });

  it('PUT /auth/profile/password 422 : erreurs de champ', () => {
    const error = normalizeError(httpError(422, passwordValidationError));
    expect(Object.keys(error.fieldErrors)).toEqual(
      expect.arrayContaining(['current_password', 'new_password']),
    );
  });

  it('GET /locations, POST /locations 201, DELETE /locations/{id}', () => {
    const created = locationCreatedResponseSchema.parse(locationCreated);
    expect(created.location).toMatchObject({ label: 'Capture', is_default: false });
    expect(locationListSchema.parse(locations).map((location) => location.id)).toContain(
      created.location.id,
    );
    expect(messageResponseSchema.parse(locationDeleted).message).toBe('Adresse supprimée');
  });

  it('POST /auth/request-upgrade 422 métier : message sans erreur de champ', () => {
    const error = normalizeError(httpError(422, upgradeAlreadyTechnician));
    expect(error.fieldErrors).toEqual({});
    expect(describeError(error, t)).toBe('Vous êtes déjà technicien');
  });
});
