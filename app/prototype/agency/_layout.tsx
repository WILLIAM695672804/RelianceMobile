import { ProtoTabs } from '@/prototype/ProtoTabs';

export default function AgencyTabs() {
  return (
    <ProtoTabs
      items={[
        { key: 'index', label: 'Agence', icon: 'grid' },
        { key: 'team', label: 'Équipe', icon: 'user' },
        { key: 'inbox', label: 'Messages', icon: 'chat' },
        { key: 'profile', label: 'Profil', icon: 'settings' },
      ]}
    />
  );
}
