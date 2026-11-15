import { router } from 'expo-router';

import { searchHistory } from '@/bootstrap/instance';
import { SearchScreen } from '@/features/directory';

/** Recherche de techniciens, ouverte depuis la barre de l'accueil client. */
export function SearchRoute() {
  return (
    <SearchScreen
      history={searchHistory}
      onBack={() => router.back()}
      onOpen={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
