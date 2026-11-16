import { ProtoTabs } from '@/prototype/ProtoTabs';

export default function ClientTabs() {
  return (
    <ProtoTabs
      items={[
        { key: 'index', label: 'Accueil', icon: 'home' },
        { key: 'map', label: 'Carte', icon: 'map' },
        { key: 'inbox', label: 'Messages', icon: 'chat' },
        { key: 'wallet', label: 'Wallet', icon: 'wallet' },
        { key: 'profile', label: 'Profil', icon: 'user' },
      ]}
      fab={{ label: 'Nouvelle demande', href: '/prototype/new-request' }}
    />
  );
}
