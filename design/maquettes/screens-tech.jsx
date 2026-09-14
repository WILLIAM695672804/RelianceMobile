// screens-tech.jsx — technician home, inbox, profile/role switcher

function TechHomeScreen({ theme, onJob, onPlanning }) {
  const jobs = [
  { id: 'j1', client: 'Mireille A.', service: 'Fuite d’eau', time: '10:30', status: 'Nouveau' },
  { id: 'j2', client: 'Paul E.', service: 'Installation prise', time: '14:00', status: 'Confirmé' }];

  return (
    <div style={{ height: '100%', paddingTop: 60, background: theme.bg, paddingBottom: 90 }}>
      <div style={{ padding: '0 20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>Bonjour Armand 👋</div>
          <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 20 }}>Vos missions</div>
        </div>
        <Avatar name="Armand B." size={40} color={theme.accent} />
      </div>

      <div style={{ display: 'flex', gap: 12, padding: '0 20px 20px' }}>
        <Card theme={theme} style={{ flex: 1 }}><div style={{ fontSize: 12, color: theme.textMuted }}>Aujourd'hui</div><div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 22 }}>3</div></Card>
        <Card theme={theme} style={{ flex: 1 }}><div style={{ fontSize: 12, color: theme.textMuted }}>Gains du mois</div><div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 22 }}>210k</div></Card>
      </div>

      <Section title="Missions du jour" action={<span onClick={onPlanning} style={{ fontSize: 13, color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Planning</span>}>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map((j) =>
          <div key={j.id} onClick={() => onJob && onJob(j.id)} style={{ padding: 16, borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.surface, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{j.service}</div>
                <Pill bg={theme.accent + '18'} color={theme.accent}>{j.status}</Pill>
              </div>
              <div style={{ fontSize: 13, color: theme.textMuted }}>{j.client} · {j.time}</div>
            </div>
          )}
        </div>
      </Section>
    </div>);

}

function InboxScreen({ theme, onOpenChat }) {
  const chats = [
  { id: 'c1', name: 'Mireille A.', last: 'D’accord, à tout à l’heure !', time: '9:44', unread: 2 },
  { id: 'c2', name: 'Paul E.', last: 'Le devis me convient.', time: 'Hier', unread: 0 },
  { id: 'c3', name: 'Support Reliance', last: 'Votre KYC a été validé.', time: 'Lun.', unread: 0 }];

  return (
    <div style={{ height: '100%', paddingTop: 60, background: theme.bg, paddingBottom: 90 }}>
      <div style={{ padding: '0 20px 16px' }}>
        <h1 style={{ fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 800, margin: 0 }}>Messages</h1>
      </div>
      <div style={{ padding: '0 20px' }}>
        {chats.map((c) =>
        <div key={c.id} onClick={() => onOpenChat && onOpenChat(c.id)} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${theme.divider}`, cursor: 'pointer' }}>
            <Avatar name={c.name} size={46} color={theme.accent} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{c.time}</div>
              </div>
              <div style={{ fontSize: 13, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last}</div>
            </div>
            {c.unread > 0 &&
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: theme.accent, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</div>
            }
          </div>
        )}
      </div>
    </div>);

}

function ProfileScreen({ theme, role = 'tech', onSwitchRole, onNav }) {
  const sections = [
  { title: 'Compte', items: [{ icon: 'user', label: 'Informations personnelles' }, { icon: 'shield', label: 'Vérification KYC' }, { icon: 'wallet', label: 'Portefeuille' }] },
  { title: 'Activité', items: [{ icon: 'calendar', label: 'Planning' }, { icon: 'badge', label: 'Réputation & badges' }, { icon: 'star', label: 'Avis reçus' }] },
  { title: 'Préférences', items: [{ icon: 'bell', label: 'Notifications' }, { icon: 'settings', label: 'Paramètres' }] }];

  return (
    <div style={{ height: '100%', paddingTop: 60, background: theme.bg, paddingBottom: 90, overflowY: 'auto' }}>
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <Avatar name="Armand B." size={72} color={theme.accent} />
        <h2 style={{ fontFamily: theme.fonts.display, fontSize: 19, margin: '12px 0 2px' }}>Armand B.</h2>
        <Pill bg={theme.accent + '18'} color={theme.accent}>{role === 'tech' ? 'Technicien' : role === 'agency' ? 'Agence' : 'Client'}</Pill>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <TweakRadio value={role} onChange={onSwitchRole} options={[{ value: 'client', label: 'Client' }, { value: 'tech', label: 'Technicien' }, { value: 'agency', label: 'Agence' }]} />
      </div>

      {sections.map((s) =>
      <Section key={s.title} title={s.title}>
          <div style={{ padding: '0 20px' }}>
            <IOSList dark={theme._t.dark}>
              {s.items.map((it) => <IOSListRow key={it.label} icon={<Icon name={it.icon} size={18} color={theme.accent} />} label={it.label} onClick={() => onNav && onNav(it.label)} dark={theme._t.dark} />)}
            </IOSList>
          </div>
        </Section>
      )}

      <div style={{ padding: '0 20px' }}>
        <IOSList dark={theme._t.dark}>
          <IOSListRow icon={<Icon name="close" size={18} color="#E5484D" />} label="Déconnexion" danger dark={theme._t.dark} />
        </IOSList>
      </div>
    </div>);

}

Object.assign(window, { TechHomeScreen, InboxScreen, ProfileScreen });