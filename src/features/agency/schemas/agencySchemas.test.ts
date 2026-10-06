import agency from '@/test/fixtures/agency/agency.json';
import agencyUpdated from '@/test/fixtures/agency/agency-updated.json';
import members from '@/test/fixtures/agency/members.json';
import myAgency from '@/test/fixtures/agency/my-agency.json';

import {
  agencyFormSchema,
  agencyResponseSchema,
  memberFormSchema,
  membersResponseSchema,
  myAgencyResponseSchema,
  toAgencyPayload,
  writtenAgencyResponseSchema,
} from './agencySchemas';

describe('agencySchemas', () => {
  it('lit l’agence et ses membres, sans conserver les comptes bruts', () => {
    const parsed = myAgencyResponseSchema.parse(myAgency).data;

    expect(parsed?.id).toBe(myAgency.data.id);
    expect(parsed?.members[0]).toEqual({
      id: myAgency.data.members[0]!.id,
      name: myAgency.data.members[0]!.name,
      avatar_url: null,
      verified: myAgency.data.members[0]!.verified,
    });
    expect(parsed?.members[0]).not.toHaveProperty('email');
  });

  it('accepte une absence d’agence', () => {
    expect(myAgencyResponseSchema.parse({ data: null, message: 'Aucune agence' }).data).toBeNull();
  });

  it('lit une agence détaillée et une écriture', () => {
    expect(agencyResponseSchema.parse(agency).data.name).toBe(agency.data.name);
    const written = writtenAgencyResponseSchema.parse(agencyUpdated);
    expect(written.message).toBe(agencyUpdated.message);
    expect(written.data.description).toBe(agencyUpdated.data.description);
  });

  it('lit l’équipe avec les rôles', () => {
    const list = membersResponseSchema.parse(members).data;

    expect(list).toHaveLength(members.data.length);
    expect(list[0]?.role).toBe(members.data[0]!.role);
    expect(list[0]?.user?.name).toBe(members.data[0]!.user.name);
  });

  it('valide la fiche de l’agence', () => {
    const valid = {
      name: 'Agence de démonstration',
      description: 'Électricité et plomberie',
      address: 'Yaoundé',
      phone: '600000000',
      email: 'contact@example.test',
    };
    expect(agencyFormSchema.safeParse(valid).success).toBe(true);
    expect(agencyFormSchema.safeParse({ ...valid, name: ' ' }).error?.issues[0]?.message).toBe(
      'agency:form.errors.nameRequired',
    );
    expect(
      agencyFormSchema.safeParse({ ...valid, email: 'invalide' }).error?.issues[0]?.message,
    ).toBe('agency:form.errors.emailInvalid');
    expect(toAgencyPayload(valid)).toEqual({
      name: 'Agence de démonstration',
      description: 'Électricité et plomberie',
      address: 'Yaoundé',
      phone: '600000000',
      email: 'contact@example.test',
    });
    expect(
      toAgencyPayload({ name: 'Agence', description: '', address: '', phone: '', email: '' }),
    ).toEqual({ name: 'Agence', description: null, address: null, phone: null, email: null });
  });

  it('valide l’ajout d’un membre', () => {
    expect(memberFormSchema.safeParse({ userId: 'u1', role: 'member' }).success).toBe(true);
    expect(
      memberFormSchema.safeParse({ userId: '', role: 'member' }).error?.issues[0]?.message,
    ).toBe('agency:team.errors.technicianRequired');
  });
});
