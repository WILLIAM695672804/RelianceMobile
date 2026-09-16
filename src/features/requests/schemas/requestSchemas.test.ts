import requestCreated from '@/test/fixtures/requests/request-created.json';
import requests from '@/test/fixtures/requests/requests.json';
import { buildServiceRequest } from '@/test/fixtures/serviceRequests';

import {
  mapRequestFieldErrors,
  requestEnvelopeSchema,
  requestFormSchema,
  requestPageSchema,
  toCreateRequestPayload,
} from './requestSchemas';

const photo = { uri: 'file:///cache/fuite.jpg', name: 'fuite.jpg', type: 'image/jpeg' };
const place = { latitude: 4.05, longitude: 9.76, label: 'Akwa, Douala', city: 'Douala' };
const validForm = {
  categorySlug: 'reparation-fuite',
  title: '  Fuite sous l’évier ',
  description: 'De l’eau coule sous l’évier de la cuisine depuis ce matin.',
  photos: [photo],
  place,
};

describe('requestSchemas', () => {
  it('lit une demande créée et convertit le prix indicatif', () => {
    const request = requestEnvelopeSchema.parse(requestCreated).data;

    expect(request.id).toBe(requestCreated.data.id);
    expect(request.photos).toEqual(requestCreated.data.photos);
    expect(typeof request.analysis?.suggested_price).toBe('number');
  });

  it('lit la page des demandes du client', () => {
    const page = requestPageSchema.parse(requests);

    expect(page.data).toHaveLength(requests.data.length);
    expect(page.meta.total).toBe(requests.meta.total);
  });

  it('tolère un statut inconnu et les champs facultatifs absents', () => {
    const request = requestEnvelopeSchema.parse({
      data: buildServiceRequest({
        status: 'disputed',
        category: null,
        address: null,
        photos: null,
        analysis: null,
        counterpart: undefined,
      }),
    }).data;

    expect(request.status).toBe('disputed');
    expect(request.photos).toEqual([]);
  });

  it('valide le formulaire complet', () => {
    expect(requestFormSchema.safeParse(validForm).success).toBe(true);
  });

  it('signale chaque champ invalide par une clé de traduction', () => {
    const result = requestFormSchema.safeParse({
      categorySlug: '',
      title: ' ',
      description: 'Trop court',
      photos: [],
      place: null,
    });

    expect(result.success).toBe(false);
    const messages = Object.fromEntries(
      (result.error?.issues ?? []).map((issue) => [issue.path.join('.'), issue.message]),
    );
    expect(messages).toEqual({
      categorySlug: 'requests:form.errors.categoryRequired',
      title: 'requests:form.errors.titleRequired',
      description: 'requests:form.errors.descriptionTooShort',
      photos: 'requests:form.errors.photosRequired',
      place: 'requests:form.errors.placeRequired',
    });
  });

  it('refuse plus de cinq photos et une description trop longue', () => {
    const result = requestFormSchema.safeParse({
      ...validForm,
      description: 'x'.repeat(1001),
      photos: Array.from({ length: 6 }, () => photo),
    });

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'requests:form.errors.descriptionTooLong',
      'requests:form.errors.photosTooMany',
    ]);
  });

  it('toCreateRequestPayload prépare l’envoi', () => {
    expect(toCreateRequestPayload(validForm)).toEqual({
      title: 'Fuite sous l’évier',
      description: validForm.description,
      categorySlug: 'reparation-fuite',
      latitude: 4.05,
      longitude: 9.76,
      addressLabel: 'Akwa, Douala',
      city: 'Douala',
      photos: [photo],
    });
    expect(() => toCreateRequestPayload({ ...validForm, place: null })).toThrow();
  });

  it('mapRequestFieldErrors rattache les erreurs du serveur aux champs du formulaire', () => {
    expect(
      mapRequestFieldErrors({
        category_slug: ['Catégorie inconnue.'],
        latitude: ['Latitude requise.'],
        longitude: ['Longitude requise.'],
        'photos.0': ['Photo trop lourde.'],
        inconnu: ['Ignoré.'],
      }),
    ).toEqual({
      categorySlug: 'Catégorie inconnue.',
      place: 'Latitude requise.',
      photos: 'Photo trop lourde.',
    });
  });
});
