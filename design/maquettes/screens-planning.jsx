// screens-planning.jsx — Planning tech (Étape 5)

// ── Calendrier hebdomadaire ────────────────────────────────────────────
function PlanningWeekScreen({ theme, onBack, onSlot, onLeave, onAvailability }) {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const fullDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const today = 2; // Mercredi pour la démo

  const events = [
    { day: 0, start: 9, end: 11, title: 'Mme Owono', sub: 'Plomberie · Bastos', kind: 'mission' },
    { day: 0, start: 14, end: 15.5, title: 'M. Kamga', sub: 'Diagnostic', kind: 'mission' },
    { day: 1, start: 8, end: 12, title: 'Indisponible', sub: 'Formation', kind: 'block' },
    { day: 2, start: 10, end: 12, title: 'Mme Tchatchouang', sub: 'Réparation chauffe-eau', kind: 'mission', live: true },
    { day: 2, start: 15, end: 17, title: 'M. Bidoung', sub: 'Devis sur place', kind: 'mission' },
    { day: 3, start: 9, end: 18, title: 'Congé', sub: 'Famille', kind: 'leave' },
    { day: 4, start: 8, end: 10, title: 'M. Etoa', sub: 'Diagnostic', kind: 'pending' },
    { day: 4, start: 13, end: 15, title: 'Mme Mballa', sub: 'Plomberie', kind: 'mission' },
    { day: 5, start: 10, end: 13, title: 'Disponible (urgences)', sub: '', kind: 'open' },
  ];

  const startHour = 7;
  const endHour = 20;
  const hourHeight = 38;

  const eventColor = (kind) => {
    if (kind === 'mission') return { bg: theme.accent, color: '#fff', dot: '#fff' };
    if (kind === 'pending') return { bg: '#ffe8cc', color: '#653e00', dot: '#825100' };
    if (kind === 'leave') return { bg: `${REL.colors.accents.green}1A`, color: REL.colors.accents.green, dot: REL.colors.accents.green, dashed: true };
    if (kind === 'block') return { bg: `${theme.text}10`, color: theme.text, dot: theme.text, dashed: true };
    if (kind === 'open') return { bg: `${REL.colors.accents.blue}26`, color: REL.colors.accents.blue, dot: REL.colors.accents.blue, dashed: true };
    return { bg: theme.surface, color: theme.text, dot: theme.text };
  };

  const stats = [
    { lbl: 'Missions', val: '5', delta: '+2' },
    { lbl: 'Heures', val: '14h', delta: '/40h' },
    { lbl: 'Gains', val: '87k', delta: 'XAF', mono: true },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Mon planning</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: theme.fonts.display }}>Sem. {12 + weekOffset} · Mars 2026</div>
        </div>
        <button onClick={onLeave} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={18}/></button>
      </div>

      {/* Stats strip */}
      <div style={{ padding: '4px 16px 12px', display: 'flex', gap: 8 }}>
        {stats.map(s => (
          <Card key={s.lbl} theme={theme} padding={10} radius={12} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.lbl}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: theme.fonts.display }}>{s.val}</span>
              <span style={{ fontSize: 10, color: theme.textMuted, fontFamily: s.mono ? theme.fonts.mono : theme.fonts.body }}>{s.delta}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Week navigator */}
      <div style={{ padding: '0 8px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: 'none', color: theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={16}/></button>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 4 }}>
          <div/>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{d}</div>
              <div style={{
                marginTop: 2, width: 26, height: 26, borderRadius: '50%',
                margin: '2px auto 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === today ? theme.accent : 'transparent',
                color: i === today ? '#fff' : theme.text,
                fontSize: 13, fontWeight: 600, fontFamily: theme.fonts.display,
              }}>{16 + i}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setWeekOffset(weekOffset + 1)} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: 'none', color: theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronR" size={16}/></button>
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 0, position: 'relative', minHeight: hourHeight * (endHour - startHour) }}>
          {/* Hour labels */}
          <div style={{ position: 'relative' }}>
            {Array.from({ length: endHour - startHour }, (_, i) => i + startHour).map(h => (
              <div key={h} style={{ height: hourHeight, position: 'relative', paddingTop: 4 }}>
                <div style={{ fontSize: 9, color: theme.textMuted, fontFamily: theme.fonts.mono }}>{h}h</div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((_, dayIdx) => (
            <div key={dayIdx} style={{ position: 'relative', borderLeft: `1px solid ${theme.divider}` }}>
              {/* Hour grid lines */}
              {Array.from({ length: endHour - startHour }, (_, i) => (
                <div key={i} style={{ height: hourHeight, borderBottom: `1px solid ${theme.divider}` }}/>
              ))}

              {/* Today highlight */}
              {dayIdx === today && (
                <div style={{ position: 'absolute', inset: 0, background: `${theme.accent}06`, pointerEvents: 'none' }}/>
              )}

              {/* Now line */}
              {dayIdx === today && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: (11.6 - startHour) * hourHeight, height: 2, background: theme.accent, zIndex: 5 }}>
                  <div style={{ position: 'absolute', left: -3, top: -3, width: 8, height: 8, borderRadius: '50%', background: theme.accent }}/>
                </div>
              )}

              {/* Events */}
              {events.filter(e => e.day === dayIdx).map((e, i) => {
                const c = eventColor(e.kind);
                const top = (e.start - startHour) * hourHeight;
                const height = (e.end - e.start) * hourHeight - 2;
                return (
                  <button key={i} onClick={() => onSlot && onSlot(e)} style={{
                    position: 'absolute', left: 2, right: 2, top, height,
                    background: c.bg, color: c.color,
                    borderRadius: 6, padding: '4px 5px',
                    border: c.dashed ? `1.5px dashed ${c.color}` : 'none',
                    textAlign: 'left', cursor: 'pointer',
                    overflow: 'hidden',
                    fontFamily: theme.fonts.body,
                  }}>
                    {e.live && (
                      <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 2px rgba(255,255,255,0.4)', animation: 'pinglive 1.5s infinite' }}/>
                    )}
                    <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.1, marginBottom: 1, opacity: 0.85 }}>{e.start}h{e.start % 1 ? '30' : ''}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                    {height > 36 && e.sub && <div style={{ fontSize: 9, opacity: 0.75, lineHeight: 1.2, marginTop: 1 }}>{e.sub}</div>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <style>{`@keyframes pinglive { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
      </div>

      {/* Legend / actions */}
      <div style={{ padding: '10px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: theme.accent }}/>
          <span style={{ fontSize: 11, color: theme.textMuted }}>Confirmé</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: REL.colors.accents.amber }}/>
          <span style={{ fontSize: 11, color: theme.textMuted }}>En attente</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, border: `1.5px dashed ${REL.colors.accents.green}` }}/>
          <span style={{ fontSize: 11, color: theme.textMuted }}>Off</span>
        </div>
        <div style={{ flex: 1 }}/>
        <button onClick={onAvailability} style={{ padding: '6px 12px', borderRadius: 999, background: theme.text, color: theme.bg, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Disponibilités</button>
      </div>
    </div>
  );
}

// ── Demande de congé ───────────────────────────────────────────────────
function LeaveRequestScreen({ theme, onBack, onSubmit }) {
  const [reason, setReason] = React.useState('vacation');
  const [start, setStart] = React.useState(20);
  const [end, setEnd] = React.useState(24);
  const [allDay, setAllDay] = React.useState(true);

  const reasons = [
    { id: 'vacation', label: 'Congé', icon: 'sun' },
    { id: 'sick', label: 'Maladie', icon: 'heart' },
    { id: 'training', label: 'Formation', icon: 'badge' },
    { id: 'other', label: 'Autre', icon: 'info' },
  ];

  const days = end - start + 1;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Bloquer mon agenda</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ flex: 1, padding: '12px 24px 24px', overflow: 'auto' }}>
        {/* Reason */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Motif</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
          {reasons.map(r => {
            const sel = reason === r.id;
            return (
              <button key={r.id} onClick={() => setReason(r.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
                <Card theme={theme} padding={14} radius={12} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderColor: sel ? theme.accent : theme.border,
                  background: sel ? `${theme.accent}08` : theme.surface,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: sel ? theme.accent : `${theme.text}10`, color: sel ? '#fff' : theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={r.icon} size={16}/>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Dates */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Période</div>
        <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 12 }}>
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.divider}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Début</span>
            <span style={{ fontSize: 14, fontWeight: 600, fontFamily: theme.fonts.display }}>{start} mars 2026</span>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.divider}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Fin</span>
            <span style={{ fontSize: 14, fontWeight: 600, fontFamily: theme.fonts.display }}>{end} mars 2026</span>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Toute la journée</span>
            <button onClick={() => setAllDay(!allDay)} style={{ width: 44, height: 26, borderRadius: 13, background: allDay ? theme.accent : theme.border, border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.15s' }}>
              <div style={{ position: 'absolute', top: 3, left: allDay ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        </Card>

        {/* Mini calendar */}
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: 'center', fontFamily: theme.fonts.display }}>Mars 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 10, color: theme.textMuted, fontWeight: 600, textAlign: 'center', marginBottom: 6 }}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const isInRange = day >= start && day <= end;
              const isStart = day === start;
              const isEnd = day === end;
              return (
                <button key={day}
                  onClick={() => {
                    if (day < start || (day === start && day === end)) setStart(day);
                    else setEnd(day);
                  }}
                  style={{
                    aspectRatio: '1/1', borderRadius: isStart || isEnd ? 8 : 4,
                    background: isInRange ? (isStart || isEnd ? theme.accent : `${theme.accent}33`) : 'transparent',
                    color: isStart || isEnd ? '#fff' : isInRange ? theme.accent : theme.text,
                    border: 'none', fontSize: 12, fontWeight: isStart || isEnd ? 700 : 500, cursor: 'pointer',
                    fontFamily: theme.fonts.body,
                  }}>{day}</button>
              );
            })}
          </div>
        </Card>

        {/* Note */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Note (optionnel)</div>
        <textarea placeholder="Visible uniquement par vous" rows={2} style={{
          width: '100%', boxSizing: 'border-box',
          background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12,
          padding: '12px 14px', fontSize: 14, color: theme.text, outline: 'none',
          fontFamily: theme.fonts.body, resize: 'vertical', marginBottom: 16,
        }}/>

        {/* Impact */}
        <Card theme={theme} padding={14} radius={14} style={{ background: `${REL.colors.accents.amber}10`, border: `1px solid ${REL.colors.accents.amber}40` }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Icon name="info" size={18} color={REL.colors.accents.amber}/>
            <div style={{ flex: 1, fontSize: 12, lineHeight: 1.5 }}>
              <b>{days} jours bloqués.</b> Vous serez invisible pour les nouvelles demandes durant cette période. Les missions confirmées sont conservées.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
        <Button size="lg" variant="ghost" dark={theme._t.dark} onClick={onBack} style={{ flex: 1 }}>Annuler</Button>
        <Button size="lg" style={{ flex: 2, background: theme.accent, color: theme.onPrimary }} onClick={onSubmit}>Bloquer ces {days} jours</Button>
      </div>
    </div>
  );
}

// ── Réglages disponibilité ─────────────────────────────────────────────
function AvailabilityScreen({ theme, onBack, onSave }) {
  const [available, setAvailable] = React.useState(true);
  const [pause, setPause] = React.useState(false);
  const [maxPerDay, setMaxPerDay] = React.useState(4);
  const [travelTime, setTravelTime] = React.useState(20);

  const [hours, setHours] = React.useState({
    Lun: { on: true, start: '08:00', end: '18:00' },
    Mar: { on: true, start: '08:00', end: '18:00' },
    Mer: { on: true, start: '08:00', end: '18:00' },
    Jeu: { on: true, start: '08:00', end: '18:00' },
    Ven: { on: true, start: '08:00', end: '18:00' },
    Sam: { on: true, start: '09:00', end: '14:00' },
    Dim: { on: false, start: '00:00', end: '00:00' },
  });

  const toggleDay = (d) => setHours({ ...hours, [d]: { ...hours[d], on: !hours[d].on } });

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Mes disponibilités</div>
        <button onClick={onSave} style={{ background: 'transparent', border: 'none', color: theme.accent, fontSize: 14, fontWeight: 600, padding: '0 4px' }}>Enregistrer</button>
      </div>

      <div style={{ flex: 1, padding: '8px 24px 24px', overflow: 'auto' }}>
        {/* Master switch */}
        <Card theme={theme} padding={16} radius={16} style={{ marginBottom: 16, background: available ? `${REL.colors.accents.green}10` : theme.surface, border: `1.5px solid ${available ? REL.colors.accents.green : theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: available ? REL.colors.accents.green : theme.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={available ? 'check' : 'close'} size={20} strokeWidth={2.5}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.fonts.display }}>{available ? 'Disponible' : 'Indisponible'}</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{available ? 'Visible aux clients' : 'Invisible aux nouvelles demandes'}</div>
            </div>
            <button onClick={() => setAvailable(!available)} style={{ width: 50, height: 30, borderRadius: 15, background: available ? REL.colors.accents.green : theme.border, border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.15s' }}>
              <div style={{ position: 'absolute', top: 3, left: available ? 23 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        </Card>

        {/* Quick pause */}
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${REL.colors.accents.amber}1A`, color: REL.colors.accents.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="clock" size={16}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Pause de 2h</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>Snooze rapide pour un déjeuner ou une course</div>
          </div>
          <button onClick={() => setPause(!pause)} style={{ width: 44, height: 26, borderRadius: 13, background: pause ? theme.accent : theme.border, border: 'none', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 3, left: pause ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }}/>
          </button>
        </Card>

        {/* Weekly hours */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Horaires hebdomadaires</div>
        <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 24, overflow: 'hidden' }}>
          {Object.keys(hours).map((d, i, arr) => (
            <div key={d} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
              <button onClick={() => toggleDay(d)} style={{ width: 36, height: 36, borderRadius: '50%',
                background: hours[d].on ? theme.accent : 'transparent',
                color: hours[d].on ? '#fff' : theme.textMuted,
                border: hours[d].on ? 'none' : `1.5px dashed ${theme.border}`,
                fontSize: 11, fontWeight: 700, fontFamily: theme.fonts.display, cursor: 'pointer',
              }}>{d.slice(0, 1).toUpperCase()}</button>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{d}</div>
              {hours[d].on ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: theme.fonts.mono }}>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: theme.bg, border: `1px solid ${theme.border}` }}>{hours[d].start}</span>
                  <span style={{ color: theme.textMuted }}>—</span>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: theme.bg, border: `1px solid ${theme.border}` }}>{hours[d].end}</span>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: theme.textMuted, fontStyle: 'italic' }}>Repos</span>
              )}
            </div>
          ))}
        </Card>

        {/* Capacity */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Capacité</div>
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Missions max / jour</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.accent, fontFamily: theme.fonts.display }}>{maxPerDay}</span>
          </div>
          <input type="range" min="1" max="10" value={maxPerDay} onChange={e => setMaxPerDay(parseInt(e.target.value))} style={{ width: '100%', accentColor: theme.accent }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.textMuted, marginTop: 4 }}>
            <span>1</span><span>10</span>
          </div>
        </Card>

        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Temps de trajet entre missions</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.accent, fontFamily: theme.fonts.display }}>{travelTime} min</span>
          </div>
          <input type="range" min="10" max="60" step="5" value={travelTime} onChange={e => setTravelTime(parseInt(e.target.value))} style={{ width: '100%', accentColor: theme.accent }}/>
        </Card>

        <Card theme={theme} padding={14} radius={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="bolt" size={18} color={REL.colors.accents.amber}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Recevoir des urgences (24/7)</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>+30 % majoration sur les missions de nuit</div>
          </div>
          <button style={{ width: 44, height: 26, borderRadius: 13, background: theme.accent, border: 'none', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: 3, left: 21, width: 20, height: 20, borderRadius: '50%', background: '#fff' }}/>
          </button>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { PlanningWeekScreen, LeaveRequestScreen, AvailabilityScreen });
