// screens-agency.jsx — Étape 8 : Rôle Agence (dashboard, équipe, affectation)

const AGENCY_TEAM = [
  { id: 't1', name: 'Paul Mvondo', role: 'Plombier', tier: 'gold', online: true, jobs: 47, rating: 4.9, today: 3, accent: '#5f3add' },
  { id: 't2', name: 'Yves Kamga', role: 'Électricien', tier: 'platinum', online: true, jobs: 89, rating: 4.95, today: 4, accent: '#5f3add' },
  { id: 't3', name: 'Aurélien Eyene', role: 'Électricien · Sécurité', tier: 'gold', online: true, jobs: 64, rating: 4.85, today: 2, accent: '#5f3add' },
  { id: 't4', name: 'Marie-Claire Ngo', role: 'Informatique', tier: 'silver', online: false, jobs: 22, rating: 4.7, today: 0, accent: '#5f3add', away: 'Off · 2j' },
  { id: 't5', name: 'Junior Bidoung', role: 'Plombier (apprenti)', tier: 'bronze', online: true, jobs: 8, rating: 4.6, today: 1, accent: '#5f3add' },
  { id: 't6', name: 'Sandra Mballa', role: 'Climatisation', tier: 'silver', online: false, jobs: 31, rating: 4.8, today: 0, accent: '#5f3add', away: 'Pause · 1h' },
];

const PENDING_JOBS = [
  { id: 'j1', client: 'M. Tchatchouang', service: 'Fuite chauffe-eau', zone: 'Bastos', urgent: true, when: 'Maintenant', estimate: 18000 },
  { id: 'j2', client: 'Mme Owono', service: 'Disjoncteur principal', zone: 'Mvog-Ada', urgent: false, when: '14h00', estimate: 25000 },
  { id: 'j3', client: 'M. Bidoung', service: 'Câblage caméra', zone: 'Tsinga', urgent: false, when: 'Demain 09h', estimate: 45000 },
];

const TIER_COLOR = { bronze: '#5f3add', silver: '#5f3add', gold: '#5f3add', platinum: '#5f3add', reliance: '#5f3add' };

// ── Dashboard agence ─────────────────────────────────────────────────
function AgencyDashboardScreen({ theme, onTeam, onAssign, onSettings }) {
  const stats = [
    { lbl: 'Missions du jour', val: '14', sub: '+3 vs hier', good: true },
    { lbl: 'Équipe active', val: '4/6', sub: '67%', neutral: true },
    { lbl: 'CA aujourd\'hui', val: '342', unit: 'k XAF', sub: '+12%', good: true },
    { lbl: 'Note moyenne', val: '4.85', sub: '★ 30j', good: true },
  ];

  const alerts = [
    { kind: 'urgent', icon: 'bolt', label: '2 demandes urgentes non assignées', color: '#5f3add', count: 2 },
    { kind: 'kyc', icon: 'shield', label: 'KYC de Junior B. expire dans 14j', color: '#5f3add' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      {/* Header */}
      <div style={{ padding: '10px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.text, color: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>BR</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Agence · Yaoundé</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fonts.display, letterSpacing: -0.3, display: 'flex', alignItems: 'center', gap: 6 }}>
              BTP Reliance Express
              <Icon name="shield" size={14} color={REL.colors.accents.green}/>
            </div>
          </div>
          <button onClick={onSettings} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cog" size={18}/></button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 100px' }}>
        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {stats.map((s, i) => {
            const big = i === 2;
            return (
              <Card key={s.lbl} theme={theme} padding={14} radius={14} style={big ? { gridColumn: 'span 2', background: theme.text, color: theme.bg, border: 'none' } : {}}>
                <div style={{ fontSize: 10, color: big ? 'rgba(255,255,255,0.6)' : theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.lbl}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: big ? 38 : 26, fontWeight: 700, fontFamily: theme.fonts.display, letterSpacing: -1, lineHeight: 1 }}>{s.val}</span>
                  {s.unit && <span style={{ fontSize: 12, color: big ? 'rgba(255,255,255,0.55)' : theme.textMuted, fontFamily: theme.fonts.mono }}>{s.unit}</span>}
                </div>
                <div style={{ fontSize: 11, color: s.good ? REL.colors.accents.green : (big ? 'rgba(255,255,255,0.6)' : theme.textMuted), marginTop: 4, fontWeight: 500 }}>
                  {s.good && '↑ '}{s.sub}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Alerts */}
        {alerts.map(a => (
          <Card key={a.kind} theme={theme} padding={12} radius={12} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, background: `${a.color}10`, border: `1px solid ${a.color}40` }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: a.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={a.icon} size={15}/>
            </div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{a.label}</div>
            {a.count && <Pill bg={a.color} color="#fff" size="md">{a.count}</Pill>}
            <Icon name="chevronR" size={16} color={theme.textMuted}/>
          </Card>
        ))}

        {/* Pending jobs to assign */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Affectations</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: theme.fonts.display }}>À distribuer</div>
          </div>
          <button onClick={onAssign} style={{ padding: '6px 12px', borderRadius: 999, background: theme.surface, border: `1px solid ${theme.border}`, fontSize: 12, fontWeight: 600, color: theme.text, cursor: 'pointer' }}>Voir tout</button>
        </div>
        {PENDING_JOBS.map(j => (
          <Card key={j.id} theme={theme} padding={12} radius={12} style={{ marginBottom: 8, cursor: 'pointer' }}>
            <button onClick={onAssign} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {j.urgent && <div style={{ width: 4, height: 36, borderRadius: 2, background: REL.colors.accents.red }}/>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{j.service}</span>
                    {j.urgent && <Pill bg={`${REL.colors.accents.red}1A`} color={REL.colors.accents.red} size="sm">URGENT</Pill>}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{j.client} · {j.zone} · {j.when}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: theme.fonts.mono }}>{j.estimate.toLocaleString('fr-FR')}</div>
                  <div style={{ fontSize: 9, color: theme.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>XAF est.</div>
                </div>
                <Icon name="chevronR" size={16} color={theme.textMuted}/>
              </div>
            </button>
          </Card>
        ))}

        {/* Team strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Équipe</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: theme.fonts.display }}>Statut en direct</div>
          </div>
          <button onClick={onTeam} style={{ padding: '6px 12px', borderRadius: 999, background: theme.surface, border: `1px solid ${theme.border}`, fontSize: 12, fontWeight: 600, color: theme.text, cursor: 'pointer' }}>Gérer</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {AGENCY_TEAM.slice(0, 4).map(m => (
            <Card key={m.id} theme={theme} padding={10} radius={12}>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Avatar name={m.name} color={m.accent} size={36}/>
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: m.online ? REL.colors.accents.green : theme.border, border: `2px solid ${theme.surface}` }}/>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.role}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 10 }}>
                <Icon name="clock" size={10} color={theme.textMuted}/>
                <span style={{ color: theme.textMuted, fontWeight: 600 }}>{m.today}</span>
                <span style={{ color: theme.textMuted, opacity: 0.6 }}>·</span>
                <Icon name="star" size={10} color={REL.colors.accents.amber}/>
                <span style={{ fontWeight: 600 }}>{m.rating}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Liste équipe ─────────────────────────────────────────────────────
function AgencyTeamScreen({ theme, onBack, onMember, onAdd }) {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'online', label: 'En ligne' },
    { id: 'plomberie', label: 'Plomberie' },
    { id: 'elec', label: 'Élec' },
    { id: 'pending', label: 'KYC' },
  ];
  const visible = filter === 'online' ? AGENCY_TEAM.filter(m => m.online) : AGENCY_TEAM;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Équipe</div>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: theme.fonts.display }}>{AGENCY_TEAM.length} techniciens</div>
        </div>
        <button onClick={onAdd} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.accent, color: theme.onPrimary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${theme.accent}55` }}><Icon name="plus" size={18} strokeWidth={2.5}/></button>
      </div>

      {/* Search */}
      <div style={{ padding: '4px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <Icon name="search" size={16} color={theme.textMuted}/>
          <input placeholder="Rechercher un membre…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: theme.text }}/>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '4px 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {filters.map(f => {
          const sel = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: sel ? theme.text : theme.surface,
              color: sel ? theme.bg : theme.text,
              border: `1px solid ${sel ? theme.text : theme.border}`,
              whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
            }}>{f.label}</button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>
        {visible.map(m => (
          <button key={m.id} onClick={() => onMember && onMember(m)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', marginBottom: 8 }}>
            <Card theme={theme} padding={12} radius={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={m.name} color={m.accent} size={44}/>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 13, height: 13, borderRadius: '50%', background: m.online ? REL.colors.accents.green : theme.border, border: `2px solid ${theme.surface}` }}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</span>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: TIER_COLOR[m.tier], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, fontFamily: theme.fonts.display }}>{m.tier[0].toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{m.role}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: 11 }}>
                    {m.online ? (
                      <>
                        <span style={{ color: REL.colors.accents.green, fontWeight: 600 }}>● En ligne</span>
                        <span style={{ color: theme.textMuted }}>{m.today} aujourd'hui</span>
                      </>
                    ) : (
                      <span style={{ color: theme.textMuted }}>{m.away}</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                    <Icon name="star" size={12} color={REL.colors.accents.amber}/>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: theme.fonts.display }}>{m.rating}</span>
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2, fontFamily: theme.fonts.mono }}>{m.jobs} missions</div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Affecter un job à un tech ────────────────────────────────────────
function AssignJobScreen({ theme, onBack, onAssign }) {
  const job = PENDING_JOBS[0];
  const [selected, setSelected] = React.useState(null);
  const [autoMode, setAutoMode] = React.useState(false);

  const ranked = AGENCY_TEAM
    .filter(m => m.role.toLowerCase().includes('plomb') || m.role.toLowerCase().includes('apprenti'))
    .map(m => ({
      ...m,
      distance: [1.4, 3.1, 2.8, 5.2, 0.9][Math.floor(Math.random() * 5)],
      score: m.online ? Math.round(60 + m.rating * 8) : 30,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Affecter la mission</div>
        <div style={{ width: 40 }}/>
      </div>

      {/* Job summary */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card theme={theme} padding={14} radius={14} style={{ background: `${REL.colors.accents.red}10`, border: `1.5px solid ${REL.colors.accents.red}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Pill bg={REL.colors.accents.red} color="#fff" size="sm">URGENT</Pill>
            <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>Reçu il y a 4 min</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: theme.fonts.display, marginBottom: 4 }}>{job.service}</div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 8 }}>{job.client} · {job.zone} · {job.when}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
            <div>
              <div style={{ color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Devis estimé</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.mono, color: theme.text, marginTop: 2 }}>{job.estimate.toLocaleString('fr-FR')} XAF</div>
            </div>
            <div>
              <div style={{ color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Commission agence</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.mono, color: REL.colors.accents.green, marginTop: 2 }}>+{Math.round(job.estimate * 0.15).toLocaleString('fr-FR')} XAF</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Auto switch */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card theme={theme} padding={12} radius={12} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${theme.accent}1A`, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bolt" size={15}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Affectation automatique</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>Reliance choisit le meilleur match</div>
          </div>
          <button onClick={() => setAutoMode(!autoMode)} style={{ width: 44, height: 26, borderRadius: 13, background: autoMode ? theme.accent : theme.border, border: 'none', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 3, left: autoMode ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }}/>
          </button>
        </Card>
      </div>

      {/* Ranked candidates */}
      <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{ranked.length} candidats</div>
        <div style={{ fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Triés par match</span>
          <Icon name="info" size={11}/>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 12px' }}>
        {ranked.map((m, i) => {
          const sel = selected === m.id;
          return (
            <button key={m.id} onClick={() => setSelected(m.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', marginBottom: 8 }}>
              <Card theme={theme} padding={12} radius={14} style={{
                borderColor: sel ? theme.accent : theme.border,
                background: sel ? `${theme.accent}08` : theme.surface,
                borderWidth: sel ? 2 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar name={m.name} color={m.accent} size={40}/>
                    {i === 0 && <div style={{ position: 'absolute', top: -4, left: -4, width: 18, height: 18, borderRadius: '50%', background: REL.colors.accents.amber, color: '#ffffff', fontSize: 9, fontWeight: 700, fontFamily: theme.fonts.display, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                      {m.online && <span style={{ width: 6, height: 6, borderRadius: '50%', background: REL.colors.accents.green }}/>}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>{m.role} · {m.distance} km</div>
                    {/* Match score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}>
                        <div style={{ width: `${m.score}%`, height: '100%', background: m.score > 80 ? REL.colors.accents.green : m.score > 60 ? REL.colors.accents.amber : theme.textMuted, borderRadius: 2 }}/>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: theme.fonts.mono, color: m.score > 80 ? REL.colors.accents.green : theme.text, minWidth: 28, textAlign: 'right' }}>{m.score}%</span>
                    </div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${sel ? theme.accent : theme.border}`, background: sel ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <Icon name="check" size={12} color="#fff" strokeWidth={3}/>}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 16px 32px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <Button size="lg" full disabled={!selected && !autoMode} onClick={onAssign} style={{
          background: (selected || autoMode) ? theme.accent : theme.border,
          color: '#fff',
          opacity: (selected || autoMode) ? 1 : 0.6,
        }}>
          {autoMode ? 'Lancer auto' : selected ? 'Affecter à ce technicien' : 'Choisir un technicien'}
        </Button>
      </div>
    </div>
  );
}

Object.assign(window, { AgencyDashboardScreen, AgencyTeamScreen, AssignJobScreen });
