import { router } from 'expo-router';

import { TechnicianDirectoryScreen } from '@/features/directory';

/** Onglet « Annuaire » : annuaire relié au profil public du groupe `app/(annuaire)`. */
export function DirectoryRoute() {
  return (
    <TechnicianDirectoryScreen
      onOpen={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
