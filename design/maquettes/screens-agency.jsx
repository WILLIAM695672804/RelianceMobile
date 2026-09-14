// screens-agency.jsx — agency dashboard, team, job assignment

const AGENCY_TEAM = [
{ id: 'a1', name: 'Armand B.', trade: 'Plombier', tier: 'gold', status: 'En mission', jobsToday: 2 },
{ id: 'a2', name: 'Solange M.', trade: 'Électricienne', tier: 'diamond', status: 'Disponible', jobsToday: 1 },
{ id: 'a3', name: 'Jean-Paul K.', trade: 'Sécurité', tier: 'silver', status: 'Disponible', jobsToday: 0 },
{ id: 'a4', name: 'Yves T.', trade: 'Informaticien', tier: 'gold', status: 'En mission', jobsToday: 3 },
{ id: 'a5', name: 'Nadine F.', trade: 'Climatisation', tier: 'platinum', status: 'Congé', jobsToday: 0 },
{ id: 'a6', name: 'Éric N.', trade: 'Plombier', tier: 'bronze', status: 'Disponible', jobsToday: 1 }];


const PENDING_JOBS = [
{ id: 'j1', client: 'Mireille A.', service: 'Fuite d’eau', zone: 'Bastos', urgent: true },
{ id: 'j2', client: 'Paul E.', service: 'Installation prise', zone: 'Mvan', urgent: false },
{ id: 'j3', client: 'Carine D.', service: 'Caméra de surveillance', zone: 'Nlongkak', urgent: false }];


const TIER_COLOR = { bronze: '#A0663A', silver: '#9AA5B1', gold: '#D6A93B', platinum: '#5B8FC7', diamond: '#3B82D6' };

function AgencyDashboardScreen({ theme, onTeam, onAssign }) {
  return (
    <div style={{ height: '100%', paddingTop: 60, background: theme.bg, paddingBottom: 90, overflowY: 'auto' }}>
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontSize: 13, color: theme.textMuted }}>Agence</div>
        <h1 style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 800, margin: 0 }}>Reliance Pro Services</h1>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '0 20px 20px' }}>
        <Card theme={theme} style={{ flex: 1 }}><div style={{ fontSize: 12, color: theme.textMuted }}>Techniciens</div><div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 22 }}>{AGENCY_TEAM.length}</div></Card>
        <Card theme={theme} style={{ flex: 1 }}><div style={{ fontSize: 12, color: theme.textMuted }}>Missions en attente</div><div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 22 }}>{PENDING_JOBS.length}</div></Card>
      </div>

      <Section title="Missions à assigner" action={<span onClick={onAssign} style={{ fontSize: 13, color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Tout voir</span>}>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PENDING_JOBS.map((j) =>
          <div key={j.id} onClick={() => onAssign && onAssign(j.id)} style={{ padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{j.service}</div>
                {j.urgent && <Pill bg="#E5484D18" color="#E5484D">Urgent</Pill>}
              </div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{j.client} · {j.zone}</div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Équipe" action={<span onClick={onTeam} style={{ fontSize: 13, color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Gérer</span>}>
        <div style={{ display: 'flex', gap: 10, padding: '0 20px', overflowX: 'auto' }}>
          {AGENCY_TEAM.slice(0, 4).map((t) =>
          <div key={t.id} style={{ textAlign: 'center', flexShrink: 0 }}>
              <Avatar name={t.name} size={48} color={TIER_COLOR[t.tier]} />
              <div style={{ fontSize: 11, marginTop: 6, width: 56 }}>{t.name.split(' ')[0]}</div>
            </div>
          )}
        </div>
      </Section>
    </div>);

}

function AgencyTeamScreen({ theme, onBack, onTech }) {
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Équipe" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AGENCY_TEAM.map((t) =>
        <div key={t.id} onClick={() => onTech && onTech(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
            <Avatar name={t.name} size={44} color={TIER_COLOR[t.tier]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{t.trade} · {t.jobsToday} mission(s) aujourd'hui</div>
            </div>
            <Pill bg={t.status === 'Disponible' ? '#0EA5E918' : t.status === 'En mission' ? theme.accent + '18' : '#8A8F9818'}
              color={t.status === 'Disponible' ? '#0EA5E9' : t.status === 'En mission' ? theme.accent : '#8A8F98'}>
              {t.status}
            </Pill>
          </div>
        )}
      </div>
    </div>);

}

function AssignJobScreen({ theme, onBack, onAssign }) {
  const [selected, setSelected] = React.useState(null);
  const available = AGENCY_TEAM.filter((t) => t.status === 'Disponible');
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Assigner la mission" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 20, flex: 1 }}>
        <Card theme={theme} padding={14} style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{PENDING_JOBS[0].service}</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>{PENDING_JOBS[0].client} · {PENDING_JOBS[0].zone}</div>
        </Card>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: theme.textMuted, marginBottom: 10 }}>Techniciens disponibles</div>
        {available.map((t) =>
        <div key={t.id} onClick={() => setSelected(t.id)} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14,
          border: `2px solid ${selected === t.id ? theme.accent : theme.border}`, marginBottom: 8, cursor: 'pointer'
        }}>
            <Avatar name={t.name} size={38} color={TIER_COLOR[t.tier]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{t.trade}</div>
            </div>
            {selected === t.id && <Icon name="check" size={18} color={theme.accent} />}
          </div>
        )}
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onAssign}>Assigner</Button>
      </div>
    </div>);

}

Object.assign(window, { AgencyDashboardScreen, AgencyTeamScreen, AssignJobScreen });