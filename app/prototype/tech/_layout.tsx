import { ProtoTabs } from '@/prototype/ProtoTabs';

export default function TechTabs() {
  return (
    <ProtoTabs
      items={[
        { key: 'index', label: 'Missions', icon: 'home' },
        { key: 'map', label: 'Carte', icon: 'map' },
        { key: 'inbox', label: 'Messages', icon: 'chat' },
        { key: 'wallet', label: 'Gains', icon: 'wallet' },
        { key: 'profile', label: 'Profil', icon: 'user' },
      ]}
    />
  );
}
