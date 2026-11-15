// screens-tech.jsx — Technician role screens + inbox + profile

function TechHomeScreen({ theme }) {
  const incoming = [
    { id: 'r1', client: 'Marie Kouam', cat: 'Fuite WC', dist: 1.4, eta: 12, price: 8000, time: 'Maintenant' },
    { id: 'r2', client: 'Joseph Tchakounté', cat: 'Chauffe-eau', dist: 3.2, eta: 25, price: 15000, time: 'Aujourd\'hui' },
  ];
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%', paddingBottom: 100 }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name="Paul Mvondo" color={REL.colors.accents.red} size={42}/>
          <div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Salut,</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Paul M. <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} size="sm">En ligne</Pill></div>
          </div>
        </div>
        <button style={{ width: 42, height: 42, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={20}/></button>
      </div>

      {/* Today stats */}
      <div style={{ padding: '12px 20px 8px' }}>
        <div style={{ position: 'relative', borderRadius: 22, padding: 20, background: theme._t.dark ? '#16161b' : '#2b2a36', color: '#fff', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: theme.accent, opacity: 0.4 }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.5 }}>Aujourd'hui</div>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1, marginTop: 4 }}>32 500 <span style={{ fontSize: 14, opacity: 0.6 }}>XAF</span></div>
            <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
              {[
                { v: '4', lbl: 'missions' },
                { v: '5.0', lbl: 'note moy.' },
                { v: '2h12', lbl: 'temps' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fonts.display }}>{s.v}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Section title={`Demandes entrantes (${incoming.length})`} action={<Pill bg={`${REL.colors.accents.amber}1A`} color={REL.colors.accents.amber} size="sm" icon={<Icon name="clock" size={11}/>}>3 min</Pill>}>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incoming.map(r => (
            <Card key={r.id} theme={theme} padding={0} radius={18}>
              <div style={{ padding: 14, borderBottom: `1px solid ${theme.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Avatar name={r.client} color="#888" size={36}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.client}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted }}>{r.cat} · {r.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.display }}>{r.price.toLocaleString('fr')}</div>
                    <div style={{ fontSize: 10, color: theme.textMuted }}>XAF</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: theme.textMuted }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="pin" size={11}/>{r.dist} km</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={11}/>{r.eta} min</span>
                </div>
              </div>
              <div style={{ padding: 10, display: 'flex', gap: 6 }}>
                <Button size="sm" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }}>Refuser</Button>
                <Button size="sm" style={{ flex: 2, background: theme.accent, color: theme.onPrimary }}>Accepter la mission</Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Planning aujourd'hui">
        <div style={{ padding: '0 20px' }}>
          <Card theme={theme} padding={0} radius={16}>
            {[
              { time: '09:00', title: 'Tsinga · Marie K.', sub: 'Robinet cuisine', done: true },
              { time: '11:30', title: 'Bastos · Joseph T.', sub: 'Chauffe-eau', done: true },
              { time: '14:30', title: 'Bastos · Yves K.', sub: 'Fuite siphon', active: true },
              { time: '17:00', title: 'Mvog-Ada · Aïcha N.', sub: 'Diagnostic' },
            ].map((s, i, arr) => (
              <div key={i} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
                <div style={{ width: 50, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: theme.fonts.display, color: s.active ? theme.accent : theme.text }}>{s.time}</div>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: theme.border }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.done ? theme.textMuted : theme.text, textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{s.sub}</div>
                </div>
                {s.active && <Pill bg={`${theme.accent}1A`} color={theme.accent} size="sm">En cours</Pill>}
                {s.done && <Icon name="check" size={16} color={REL.colors.accents.green} strokeWidth={2.5}/>}
              </div>
            ))}
          </Card>
        </div>
      </Section>
    </div>
  );
}

// ── Inbox / Notifications + conversations list ──────────────────────────
function InboxScreen({ theme, onChat }) {
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%', paddingBottom: 100 }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '12px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.7 }}>Messages</h1>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text }}><Icon name="search" size={18}/></button>
      </div>

      <div style={{ padding: '8px 20px' }}>
        <div style={{ display: 'flex', gap: 6, padding: 4, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, marginBottom: 16 }}>
          {['Tous','Actifs','Archive'].map((t, i) => (
            <button key={t} style={{ flex: 1, padding: 8, borderRadius: 9, background: i === 0 ? theme.text : 'transparent', color: i === 0 ? theme.bg : theme.textMuted, border: 'none', fontSize: 12, fontWeight: 600 }}>{t}</button>
          ))}
        </div>

        <Card theme={theme} padding={0} radius={16}>
          {[
            { name: 'Paul Mvondo', last: 'C\'est un siphon standard, j\'ai la pièce.', time: '14:24', unread: 2, color: REL.colors.accents.red, online: true },
            { name: 'Aïcha Nkoa', last: 'Devis accepté ✓', time: '12:08', color: REL.colors.accents.blue },
            { name: 'Reliance · Support', last: 'Votre vérification KYC est validée', time: 'Hier', color: '#2b2a36' },
            { name: 'Esther Atangana', last: 'Merci pour la mission, à bientôt !', time: 'Hier', color: REL.colors.accents.green },
            { name: 'Marc Eyenga', last: 'Photo reçue, j\'examine ça', time: '22 avr', color: '#4918c8' },
          ].map((c, i, arr) => (
            <div key={i} onClick={onChat} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}`, cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={c.name} color={c.color} size={48}/>
                {c.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: '50%', background: REL.colors.accents.green, border: `2.5px solid ${theme.surface}` }}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: c.unread ? theme.accent : theme.textMuted, fontWeight: c.unread ? 600 : 400 }}>{c.time}</div>
                </div>
                <div style={{ fontSize: 12, color: c.unread ? theme.text : theme.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last}</span>
                  {c.unread && <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: theme.accent, color: theme.onPrimary, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Profile ─────────────────────────────────────────────────────────────
function ProfileScreen({ theme, role, onSwitchRole }) {
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%', paddingBottom: 100 }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '12px 24px 8px' }}>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.7 }}>Profil</h1>
      </div>

      <div style={{ padding: '12px 20px 16px' }}>
        <Card theme={theme} padding={20} radius={22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={role === 'tech' ? 'Paul Mvondo' : 'Yves Kamga'} color={theme.accent} size={64}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{role === 'tech' ? 'Paul Mvondo' : 'Yves Kamga'}</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>yves.k@reliance.cm</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} size="sm" icon={<Icon name="shield" size={10}/>}>KYC</Pill>
                <Pill bg={`${theme.accent}1A`} color={theme.accent} size="sm">Membre Pro</Pill>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Role switcher */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ padding: 4, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, display: 'flex', gap: 4 }}>
          {[
            { id: 'client', label: 'Mode client', icon: 'user' },
            { id: 'tech', label: 'Mode technicien', icon: 'wrench' },
          ].map(r => (
            <button key={r.id} onClick={() => onSwitchRole(r.id)} style={{
              flex: 1, padding: '10px 12px', borderRadius: 11,
              background: role === r.id ? theme.text : 'transparent',
              color: role === r.id ? theme.bg : theme.textMuted,
              border: 'none', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer',
            }}>
              <Icon name={r.icon} size={14}/>{r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      {[
        { title: 'Compte', items: [
          { label: 'Informations personnelles', icon: 'user' },
          { label: 'Sécurité & 2FA', icon: 'shield', badge: 'À activer' },
          { label: 'Vérification KYC', icon: 'check', done: true },
          { label: 'Adresses & zones', icon: 'pin' },
        ]},
        { title: 'Activité', items: [
          { label: 'Historique missions', icon: 'list' },
          { label: 'Mes avis', icon: 'star' },
          { label: 'Badges & niveaux', icon: 'badge' },
        ]},
        { title: 'Préférences', items: [
          { label: 'Notifications', icon: 'bell' },
          { label: 'Langue · Français', icon: 'sparkle' },
          { label: 'Mode sombre', icon: theme._t.dark ? 'moon' : 'sun', toggle: theme._t.dark },
        ]},
      ].map(group => (
        <Section key={group.title} title={group.title}>
          <div style={{ padding: '0 20px' }}>
            <Card theme={theme} padding={0} radius={16}>
              {group.items.map((it, i) => (
                <div key={i} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i === group.items.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${theme.accent}14`, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={it.icon} size={16}/></div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{it.label}</div>
                  {it.badge && <Pill bg={`${REL.colors.accents.amber}1A`} color={REL.colors.accents.amber} size="sm">{it.badge}</Pill>}
                  {it.done && <Icon name="check" size={16} color={REL.colors.accents.green} strokeWidth={2.5}/>}
                  {it.toggle !== undefined ? (
                    <div style={{ width: 36, height: 22, borderRadius: 11, background: it.toggle ? theme.accent : theme.border, padding: 2, display: 'flex', justifyContent: it.toggle ? 'flex-end' : 'flex-start' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff' }}/>
                    </div>
                  ) : <Icon name="chevronR" size={14} color={theme.textMuted}/>}
                </div>
              ))}
            </Card>
          </div>
        </Section>
      ))}

      <div style={{ padding: '8px 20px 20px', textAlign: 'center', fontSize: 12, color: theme.textMuted }}>
        Reliance v1.0.0 · Yaoundé · © 2026
      </div>
    </div>
  );
}

Object.assign(window, { TechHomeScreen, InboxScreen, ProfileScreen });
