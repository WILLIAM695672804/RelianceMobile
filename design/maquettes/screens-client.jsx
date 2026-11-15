// screens-client.jsx — Client home, search, request flow

const SERVICE_CATEGORIES = [
  { id: 'plomberie', label: 'Plomberie', icon: 'wrench', color: '#5f3add' },
  { id: 'elec',      label: 'Électricité', icon: 'bolt', color: '#5f3add' },
  { id: 'cam',       label: 'Sécurité', icon: 'video', color: '#5f3add' },
  { id: 'gps',       label: 'GPS & Tracking', icon: 'location', color: '#006c49' },
  { id: 'info',      label: 'Informatique', icon: 'laptop', color: '#4918c8' },
  { id: 'maint',     label: 'Maintenance', icon: 'cog', color: '#57556a' },
];

const TECHS = [
  { id: 't1', name: 'Paul Mvondo', skill: 'Plomberie', rating: 4.9, jobs: 312, dist: 1.2, eta: 18, price: 8000, verified: true, color: '#5f3add', x: 65, y: 38 },
  { id: 't2', name: 'Aïcha Nkoa', skill: 'Plomberie', rating: 4.8, jobs: 187, dist: 2.4, eta: 25, price: 7500, verified: true, color: '#5f3add', x: 30, y: 55 },
  { id: 't3', name: 'Jean-Claude B.', skill: 'Plomberie', rating: 4.7, jobs: 95, dist: 3.1, eta: 32, price: 6500, verified: false, color: '#5f3add', x: 78, y: 65 },
  { id: 't4', name: 'Esther Atangana', skill: 'Plomberie', rating: 5.0, jobs: 421, dist: 4.0, eta: 40, price: 9500, verified: true, color: '#006c49', x: 22, y: 30 },
  { id: 't5', name: 'Marc Eyenga', skill: 'Plomberie', rating: 4.6, jobs: 64, dist: 4.8, eta: 45, price: 6000, verified: true, color: '#4918c8', x: 50, y: 78 },
];

function ClientHomeScreen({ theme, onCategory, onTech, onMap, onNewRequest }) {
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%', paddingBottom: 100 }}>
      <CustomStatusBar dark={theme._t.dark} />

      {/* Header */}
      <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name="Yves Kamga" color={REL.colors.accents.red} size={42} />
          <div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Bonjour,</div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>Yves K.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 42, height: 42, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}>
            <Icon name="bell" size={20} />
            <span style={{ position: 'absolute', marginTop: -16, marginLeft: 14, width: 8, height: 8, borderRadius: '50%', background: REL.colors.accents.red }}/>
          </button>
        </div>
      </div>

      {/* Greeting + CTA */}
      <div style={{ padding: '12px 20px 4px' }}>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 28, lineHeight: 1.1, fontWeight: 700, letterSpacing: -0.8 }}>
          Quel souci<br/>aujourd'hui ?
        </h1>
      </div>

      {/* Big request CTA */}
      <div style={{ padding: '14px 20px 16px' }}>
        <button onClick={onNewRequest} style={{
          width: '100%', padding: 18, borderRadius: 20,
          background: theme._t.dark ? '#fff' : '#2b2a36', color: theme._t.dark ? '#2b2a36' : '#fff',
          border: 'none', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          textAlign: 'left', fontFamily: theme.fonts.body,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={24} strokeWidth={2.5} color="#fff"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>Nouvelle demande</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Décris ton problème en 30 secondes</div>
          </div>
          <Icon name="arrowR" size={20}/>
        </button>
      </div>

      {/* Categories grid */}
      <Section title="Domaines d'intervention" action={<span style={{ fontSize: 13, color: theme.accent, fontWeight: 500 }}>Tout voir</span>}>
        <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {SERVICE_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => onCategory(c.id)} style={{
              background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: '16px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', color: theme.text,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}1A`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={c.icon} size={22}/>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: -0.1 }}>{c.label}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Map preview */}
      <Section title="Près de toi" action={<span onClick={onMap} style={{ fontSize: 13, color: theme.accent, fontWeight: 500, cursor: 'pointer' }}>Voir la carte</span>}>
        <div style={{ padding: '0 20px' }}>
          <div onClick={onMap} style={{
            position: 'relative', height: 160, borderRadius: 22, overflow: 'hidden',
            background: theme._t.dark ? '#1F1E1A' : '#E5E1D6', cursor: 'pointer',
          }}>
            <MapPlaceholder theme={theme} compact />
            <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, padding: 12, background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="pin" size={18} color={theme.accent}/>
              <div style={{ flex: 1, fontSize: 12 }}>
                <div style={{ fontWeight: 600 }}>12 techniciens disponibles</div>
                <div style={{ color: theme.textMuted, marginTop: 1 }}>Quartier Bastos · 2 km autour</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Top techs */}
      <Section title="Techniciens recommandés" action={<span style={{ fontSize: 13, color: theme.accent, fontWeight: 500 }}>Voir +</span>}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px', scrollbarWidth: 'none' }}>
          {TECHS.slice(0, 4).map(t => (
            <div key={t.id} onClick={() => onTech(t)} style={{
              minWidth: 200, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 14, cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={t.name} color={t.color} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{t.skill}</div>
                </div>
                {t.verified && <div style={{ width: 18, height: 18, borderRadius: '50%', background: theme.accent, color: theme.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={11} strokeWidth={3}/></div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginBottom: 8 }}>
                <Icon name="star" size={13} color={REL.colors.accents.amber}/>
                <span style={{ fontWeight: 600 }}>{t.rating}</span>
                <span style={{ color: theme.textMuted }}>· {t.jobs} missions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: theme.textMuted, paddingTop: 8, borderTop: `1px solid ${theme.divider}` }}>
                <span>📍 {t.dist} km</span>
                <span style={{ fontWeight: 600, color: theme.text }}>{t.price.toLocaleString('fr')} XAF</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Active intervention */}
      <Section title="En cours">
        <div style={{ padding: '0 20px' }}>
          <Card theme={theme} radius={20} padding={0}>
            <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.divider}` }}>
              <Avatar name="Paul Mvondo" color={REL.colors.accents.red} size={44}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Paul Mvondo</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Fuite cuisine · Phase 2/4</div>
              </div>
              <button style={{ width: 38, height: 38, borderRadius: 12, background: theme.accent, color: theme.onPrimary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chat" size={18}/>
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 2 ? theme.accent : theme.border }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.textMuted }}>
                <span>Diagnostic</span>
                <span style={{ color: theme.text, fontWeight: 600 }}>En route · 8 min</span>
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}

// Reusable map placeholder
function MapPlaceholder({ theme, compact, techs = TECHS, you = { x: 50, y: 50 } }) {
  const dark = theme._t.dark;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark
          ? 'linear-gradient(180deg, #1F1E1A 0%, #16140F 100%)'
          : 'linear-gradient(180deg, #DDD7C5 0%, #C9C0A6 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.45,
        backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px)`,
        backgroundSize: compact ? '20px 20px' : '32px 32px',
      }} />
      {/* Roads */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <path d="M-5 30 Q 30 28 60 50 T 105 60" stroke={dark ? '#212128' : '#B6AB8B'} strokeWidth="3.5" fill="none"/>
        <path d="M20 -5 Q 25 40 45 60 T 60 105" stroke={dark ? '#212128' : '#B6AB8B'} strokeWidth="3" fill="none"/>
        <path d="M-5 75 L 105 80" stroke={dark ? '#212128' : '#B6AB8B'} strokeWidth="2.5" fill="none"/>
        <path d="M70 -5 L 75 105" stroke={dark ? '#17161f' : '#A89D7E'} strokeWidth="1.5" fill="none"/>
        {/* Park */}
        <ellipse cx="80" cy="22" rx="14" ry="10" fill={dark ? '#1A2620' : '#A8C0A0'} opacity="0.7"/>
        <rect x="8" y="62" width="14" height="14" rx="1" fill={dark ? '#1b1b21' : '#B6AB8B'} opacity="0.5"/>
      </svg>
      {/* Tech pins */}
      {techs.map((t, i) => (
        <div key={t.id} style={{
          position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            width: compact ? 24 : 36, height: compact ? 24 : 36, borderRadius: '50%',
            background: t.color, border: '2.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            color: '#fff', fontWeight: 700, fontSize: compact ? 9 : 12,
            fontFamily: REL.font.display,
          }}>
            {t.name.split(' ').map(s => s[0]).slice(0,2).join('')}
          </div>
          <div style={{ width: 2, height: 6, background: t.color, marginTop: -2 }}/>
        </div>
      ))}
      {/* You */}
      <div style={{ position: 'absolute', left: `${you.x}%`, top: `${you.y}%`, transform: 'translate(-50%, -50%)' }}>
        <div style={{
          width: compact ? 14 : 20, height: compact ? 14 : 20, borderRadius: '50%',
          background: theme.accent, border: '3px solid #fff', boxShadow: `0 0 0 6px ${theme.accent}33`,
        }}/>
      </div>
    </div>
  );
}

// ─── Map screen ──────────────────────────────────────────────────────────
function MapScreen({ theme, onTech, onBack }) {
  const [selected, setSelected] = React.useState(TECHS[0]);
  return (
    <div style={{ height: '100%', background: theme.bg, position: 'relative', overflow: 'hidden' }}>
      {/* Full-bleed map */}
      <MapPlaceholder theme={theme} />

      {/* Top status bar overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, color: theme._t.dark ? '#fff' : '#000' }}>
        <CustomStatusBar dark={theme._t.dark} />
      </div>

      {/* Top floating bar */}
      <div style={{ position: 'absolute', top: 56, left: 16, right: 16, zIndex: 10, display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{
          width: 44, height: 44, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text,
        }}><Icon name="chevronL" size={18}/></button>
        <div style={{
          flex: 1, height: 44, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
        }}>
          <Icon name="search" size={16} color={theme.textMuted}/>
          <span style={{ flex: 1, fontSize: 14, color: theme.textMuted }}>Plombier près de Bastos</span>
          <Icon name="filter" size={16} color={theme.text}/>
        </div>
      </div>

      {/* Right floating controls */}
      <div style={{ position: 'absolute', right: 16, bottom: 280, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['plus','minus','location'].map(ic => (
          <button key={ic} style={{
            width: 44, height: 44, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text,
          }}><Icon name={ic} size={18}/></button>
        ))}
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: theme.surface, borderRadius: '24px 24px 0 0',
        padding: '8px 0 90px', boxShadow: '0 -10px 40px rgba(0,0,0,0.12)',
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: theme.border, margin: '0 auto 12px' }}/>
        <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>5 techniciens proches</h3>
          <Pill bg={`${theme.accent}1A`} color={theme.accent} icon={<Icon name="bolt" size={11}/>}>Match auto</Pill>
        </div>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px', scrollbarWidth: 'none' }}>
          {TECHS.map(t => (
            <div key={t.id} onClick={() => { setSelected(t); }} style={{
              minWidth: 240, padding: 14, borderRadius: 16,
              background: selected.id === t.id ? theme.accent : theme.bg,
              border: `1px solid ${selected.id === t.id ? theme.accent : theme.border}`,
              color: selected.id === t.id ? '#fff' : theme.text,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={t.name} color={selected.id === t.id ? '#fff' : t.color} size={38}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>⭐ {t.rating} · {t.dist} km · {t.eta} min</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Tarif diag.</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.price.toLocaleString('fr')} XAF</div>
              </div>
              <button onClick={() => onTech(t)} style={{
                marginTop: 10, width: '100%', padding: 10, borderRadius: 10,
                background: selected.id === t.id ? '#fff' : theme.text,
                color: selected.id === t.id ? theme.accent : theme.bg,
                border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Voir le profil</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Request flow (multi-step) ───────────────────────────────────────────
function NewRequestScreen({ theme, onBack, onMatch }) {
  const [step, setStep] = React.useState(1);
  const [cat, setCat] = React.useState('plomberie');
  const [title, setTitle] = React.useState('Fuite sous évier cuisine');
  const [desc, setDesc] = React.useState("L'eau coule en continu du siphon, j'ai coupé l'arrivée. Besoin d'intervention aujourd'hui si possible.");
  const [urgency, setUrgency] = React.useState('today');

  const totalSteps = 4;
  const next = () => step < totalSteps ? setStep(step + 1) : onMatch();

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      {/* Header */}
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : onBack()} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}>
          <Icon name="chevronL" size={18}/>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 2 }}>Étape {step}/{totalSteps}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? theme.accent : theme.border }}/>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        {step === 1 && (
          <>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, lineHeight: 1.15, fontWeight: 700, letterSpacing: -0.6, marginBottom: 18 }}>
              Quel type de problème ?
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SERVICE_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)} style={{
                  padding: 18, borderRadius: 18,
                  background: cat === c.id ? theme.text : theme.surface, color: cat === c.id ? theme.bg : theme.text,
                  border: `1px solid ${cat === c.id ? theme.text : theme.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: cat === c.id ? theme.accent : `${c.color}1A`, color: cat === c.id ? '#fff' : c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.icon} size={20}/>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'left', letterSpacing: -0.2 }}>{c.label}</div>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, lineHeight: 1.15, fontWeight: 700, letterSpacing: -0.6, marginBottom: 18 }}>Décris le problème</h1>
            <Field theme={theme} label="Intitulé court" icon="edit" value={title} onChange={setTitle} placeholder="Ex: Fuite cuisine"/>
            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: theme.textMuted }}>Description détaillée</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{
                width: '100%', minHeight: 120, background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: 14, padding: 14, fontSize: 14, color: theme.text, fontFamily: theme.fonts.body, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
              }}/>
              <div style={{ marginTop: 6, fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="sparkle" size={12} color={theme.accent}/> Notre IA analysera la difficulté pour estimer le prix
              </div>
            </div>

            {/* Photos */}
            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: theme.textMuted }}>Photos (3 max)</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <ImagePlaceholder label="photo 1" height={80} width={80} radius={12} tone={theme._t.dark ? 'dark' : 'neutral'}/>
                <ImagePlaceholder label="photo 2" height={80} width={80} radius={12} tone={theme._t.dark ? 'dark' : 'neutral'}/>
                <button style={{ width: 80, height: 80, borderRadius: 12, background: theme.surface, border: `1.5px dashed ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, cursor: 'pointer' }}>
                  <Icon name="camera" size={24}/>
                </button>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, lineHeight: 1.15, fontWeight: 700, letterSpacing: -0.6, marginBottom: 18 }}>Où & quand ?</h1>
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 160, marginBottom: 14 }}>
              <MapPlaceholder theme={theme} compact techs={[]} you={{ x: 50, y: 55 }}/>
            </div>
            <Card theme={theme} radius={14} padding={14} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="pin" size={18} color={theme.accent}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Bastos, rue 1.842</div>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>Yaoundé · Position GPS détectée</div>
                </div>
                <span style={{ fontSize: 12, color: theme.accent, fontWeight: 500 }}>Modifier</span>
              </div>
            </Card>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 8, color: theme.textMuted }}>Niveau d'urgence</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'now', label: 'Maintenant', sub: 'Sous 1h · +50%', color: REL.colors.accents.red },
                { id: 'today', label: "Aujourd'hui", sub: 'Avant 18h · standard', color: REL.colors.accents.amber },
                { id: 'flex', label: 'Cette semaine', sub: 'Flexible · -10%', color: REL.colors.accents.green },
              ].map(u => (
                <button key={u.id} onClick={() => setUrgency(u.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
                  background: urgency === u.id ? theme.surface : 'transparent',
                  border: `1.5px solid ${urgency === u.id ? u.color : theme.border}`,
                  color: theme.text, cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${urgency === u.id ? u.color : theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {urgency === u.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: u.color }}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.label}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted }}>{u.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, lineHeight: 1.15, fontWeight: 700, letterSpacing: -0.6, marginBottom: 18 }}>Récap & envoi</h1>
            <Card theme={theme} padding={0} radius={18}>
              <div style={{ padding: 16, borderBottom: `1px solid ${theme.divider}` }}>
                <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Catégorie</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{SERVICE_CATEGORIES.find(c => c.id === cat)?.label}</div>
              </div>
              <div style={{ padding: 16, borderBottom: `1px solid ${theme.divider}` }}>
                <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Problème</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>{desc}</div>
              </div>
              <div style={{ padding: 16, borderBottom: `1px solid ${theme.divider}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="pin" size={16} color={theme.accent}/>
                <span style={{ fontSize: 13 }}>Bastos · Yaoundé</span>
              </div>
              <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Estimation IA</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fonts.display }}>6 000 — 12 000 XAF</div>
                </div>
                <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} size="md" icon={<Icon name="sparkle" size={11}/>}>Difficulté faible</Pill>
              </div>
            </Card>
          </>
        )}
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <Button full size="lg" style={{ background: theme.accent, color: theme.onPrimary }} onClick={next} iconRight={<Icon name="arrowR" size={18}/>}>
          {step === totalSteps ? 'Lancer le matching' : 'Continuer'}
        </Button>
      </div>
    </div>
  );
}

// ── Matching screen (animated wait + results) ─────────────────────────
function MatchingScreen({ theme, onSelect, onBack }) {
  const [phase, setPhase] = React.useState('searching');
  React.useEffect(() => {
    const t = setTimeout(() => setPhase('done'), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}>
          <Icon name="close" size={18}/>
        </button>
      </div>

      {phase === 'searching' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 32 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${theme.accent}`, opacity: 0.4,
                animation: `pulse 2s ${i * 0.6}s infinite ease-out`,
              }}/>
            ))}
            <div style={{ position: 'absolute', inset: 80, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.onPrimary }}>
              <Icon name="sparkle" size={36} strokeWidth={2}/>
            </div>
            <style>{`@keyframes pulse { 0% { transform: scale(0.4); opacity: 0.6; } 100% { transform: scale(1); opacity: 0; } }`}</style>
          </div>
          <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, textAlign: 'center' }}>Recherche en cours…</h1>
          <p style={{ marginTop: 10, fontSize: 14, color: theme.textMuted, textAlign: 'center', maxWidth: 280 }}>Analyse du problème + scan des techniciens disponibles dans 5 km.</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 100px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>5 techniciens trouvés</h1>
            <p style={{ marginTop: 4, marginBottom: 0, fontSize: 13, color: theme.textMuted }}>Triés par compatibilité, distance et note.</p>
          </div>

          {TECHS.map((t, idx) => (
            <Card key={t.id} theme={theme} padding={14} radius={18} style={{ marginBottom: 10, borderColor: idx === 0 ? theme.accent : theme.border, borderWidth: idx === 0 ? 1.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={t.name} color={t.color} size={48}/>
                  {idx === 0 && <div style={{ position: 'absolute', top: -4, right: -4, padding: '2px 6px', borderRadius: 6, background: theme.accent, color: theme.onPrimary, fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>TOP</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>{t.name}</span>
                    {t.verified && <Icon name="check" size={12} color={theme.accent} strokeWidth={3}/>}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span>⭐ {t.rating}</span><span>·</span><span>{t.dist} km</span><span>·</span><span>{t.eta} min</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.display }}>{t.price.toLocaleString('fr')}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>XAF · diag.</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Button size="sm" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }}>Voir profil</Button>
                <Button size="sm" style={{ flex: 1, background: theme.accent, color: theme.onPrimary }} onClick={() => onSelect(t)}>Choisir</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ClientHomeScreen, MapScreen, NewRequestScreen, MatchingScreen, MapPlaceholder, SERVICE_CATEGORIES, TECHS });
