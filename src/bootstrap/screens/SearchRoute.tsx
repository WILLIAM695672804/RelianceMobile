import { router } from 'expo-router';

import { searchHistory } from '@/bootstrap/instance';
import { SearchContainer } from '@/features/directory';

/** Recherche de techniciens, ouverte depuis la barre de l'accueil client. */
export function SearchRoute() {
  return (
    <SearchContainer
      history={searchHistory}
      onBack={() => router.back()}
      onOpen={(id) => router.push({ pathname: '/technicians/[id]', params: { id } })}
    />
  );
}
