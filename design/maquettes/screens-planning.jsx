// screens-planning.jsx — weekly planning, leave request, availability

function PlanningWeekScreen({ theme, onBack }) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const jobs = { 0: 2, 1: 1, 2: 3, 4: 1 };
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Planning" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ display: 'flex', padding: '16px 20px', gap: 6 }}>
        {days.map((d, i) =>
        <div key={d} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 12, background: i === 2 ? theme.accent : theme.surfaceMuted }}>
            <div style={{ fontSize: 11, color: i === 2 ? '#fff' : theme.textMuted }}>{d}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? '#fff' : theme.text }}>{9 + i}</div>
            {jobs[i] && <div style={{ width: 4, height: 4, borderRadius: '50%', background: i === 2 ? '#fff' : theme.accent, margin: '4px auto 0' }} />}
          </div>
        )}
      </div>
      <Section title="Mercredi 11 septembre">
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
          { time: '09:00', label: 'Diagnostic fuite - Mireille A.' },
          { time: '13:30', label: 'Installation prise - Paul E.' },
          { time: '16:00', label: 'Entretien climatisation - Yves T.' }].
          map((j) =>
          <div key={j.time} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, borderRadius: 14, border: `1px solid ${theme.border}` }}>
              <div style={{ fontFamily: theme.fonts.mono, fontSize: 13, fontWeight: 700, color: theme.accent }}>{j.time}</div>
              <div style={{ fontSize: 13 }}>{j.label}</div>
            </div>
          )}
        </div>
      </Section>
    </div>);

}

function LeaveRequestScreen({ theme, onBack, onSubmit }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Demande de congé" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 20 }}>
        <FormField label="Date de début" theme={theme} placeholder="jj/mm/aaaa" />
        <FormField label="Date de fin" theme={theme} placeholder="jj/mm/aaaa" />
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>Motif</div>
          <textarea style={{ width: '100%', minHeight: 100, padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.surfaceMuted, fontSize: 14, resize: 'none' }} />
        </div>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onSubmit}>Soumettre la demande</Button>
      </div>
    </div>);

}

function AvailabilityScreen({ theme, onBack }) {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const [state, setState] = React.useState({ Lundi: true, Mardi: true, Mercredi: true, Jeudi: true, Vendredi: true, Samedi: false, Dimanche: false });
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Disponibilités" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 20 }}>
        <IOSList dark={theme._t.dark}>
          {days.map((d) =>
          <IOSListRow key={d} label={d} chevron={false} dark={theme._t.dark}
            value={<TweakToggle value={state[d]} onChange={(v) => setState((s) => ({ ...s, [d]: v }))} />} />
          )}
        </IOSList>
      </div>
    </div>);

}

Object.assign(window, { PlanningWeekScreen, LeaveRequestScreen, AvailabilityScreen });