// screens-auth.jsx — Onboarding, role select, login

const ONBOARDING_SLIDES = [
  {
    eyebrow: 'Reliance · 01',
    title: 'Le bon technicien.\nEn un geste.',
    body: "Décris ta panne, on te propose les 3 à 5 meilleurs profils près de chez toi en moins de 60 secondes.",
    accent: 'red',
  },
  {
    eyebrow: 'Reliance · 02',
    title: 'Paiement bloqué.\nZéro mauvaise surprise.',
    body: 'Ton paiement reste sécurisé en escrow. Le technicien n\'est payé qu\'une fois le travail validé.',
    accent: 'blue',
  },
  {
    eyebrow: 'Reliance · 03',
    title: 'Suivi en direct.\nDe A à Z.',
    body: "Diagnostic, devis, intervention, garantie — chaque étape visible dans l'app, avec messagerie intégrée.",
    accent: 'amber',
  },
];

function OnboardingScreen({ theme, onDone, onSkip }) {
  const [idx, setIdx] = React.useState(0);
  const slide = ONBOARDING_SLIDES[idx];
  const accentHex = REL.colors.accents[slide.accent];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.text, position: 'relative' }}>
      <CustomStatusBar dark={theme._t.dark} />

      {/* Skip */}
      <div style={{ position: 'absolute', top: 60, right: 20, zIndex: 5 }}>
        <button onClick={onSkip} style={{
          background: 'transparent', border: 'none', color: theme.textMuted,
          fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 6,
          fontFamily: theme.fonts.body,
        }}>Passer</button>
      </div>

      {/* Visual canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px 12px' }}>
        {/* Big rotating accent shapes */}
        <div style={{
          position: 'absolute', top: 80, right: -90, width: 360, height: 360, borderRadius: '50%',
          background: accentHex, opacity: theme._t.dark ? 0.55 : 1,
          filter: 'blur(0px)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: 200, left: -60, width: 220, height: 220, borderRadius: '50%',
          background: theme._t.dark ? '#16161b' : '#2b2a36', zIndex: 1,
        }} />
        {/* Pixel-grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.35,
          backgroundImage: `radial-gradient(${theme._t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '14px 14px', zIndex: 2,
        }} />
        {/* Floating "card" */}
        <div style={{
          position: 'absolute', top: 240, left: 30, right: 30, padding: 16, borderRadius: 18,
          background: theme.surface, border: `1px solid ${theme.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)', zIndex: 3,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accentHex, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icon name={['flash','shield','clock'][idx]} size={22} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{['Match en 47s','Escrow activé','Phase 2/4 — diagnostic'][idx]}</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{['Quartier Bastos · plomberie','12 500 XAF gelés','Paul est en route — 8 min'][idx]}</div>
          </div>
          <Icon name="chevronR" size={16} color={theme.textMuted} />
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ background: theme.surface, borderRadius: '32px 32px 0 0', padding: '28px 28px 36px', position: 'relative', zIndex: 4 }}>
        <div style={{ fontFamily: theme.fonts.body, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>{slide.eyebrow}</div>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 30, lineHeight: 1.05, fontWeight: 700, letterSpacing: -1, whiteSpace: 'pre-line' }}>{slide.title}</h1>
        <p style={{ marginTop: 14, marginBottom: 24, fontSize: 14, lineHeight: 1.55, color: theme.textMuted, textWrap: 'pretty' }}>{slide.body}</p>

        {/* Dot indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 24 : 6, height: 6, borderRadius: 3,
                background: i === idx ? theme.text : theme.border, transition: 'all 0.25s', cursor: 'pointer',
              }} />
            ))}
          </div>
          <button onClick={() => idx === ONBOARDING_SLIDES.length - 1 ? onDone() : setIdx(idx + 1)} style={{
            width: 60, height: 60, borderRadius: '50%',
            background: theme.text, color: theme.bg, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="arrowR" size={22} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleSelectScreen({ theme, onSelect }) {
  const roles = [
    { id: 'client', title: 'Je suis client', sub: 'Trouver un technicien qualifié', accent: REL.colors.accents.red, icon: 'user' },
    { id: 'tech', title: 'Je suis technicien', sub: 'Trouver des missions près de moi', accent: REL.colors.accents.blue, icon: 'wrench' },
    { id: 'agency', title: 'Je suis agence', sub: 'Gérer une équipe de pros', accent: REL.colors.accents.amber, icon: 'grid' },
  ];
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark} />
      <div style={{ padding: '28px 24px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: '#efeaff', color: REL.colors.accents.red, fontSize: 11, fontWeight: 600, marginBottom: 18 }}>
          <span style={{ width: 6, height: 6, background: REL.colors.accents.red, borderRadius: '50%' }} />
          RELIANCE · YAOUNDÉ
        </div>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 32, lineHeight: 1.05, fontWeight: 700, letterSpacing: -1 }}>
          Bienvenue.<br/>
          <span style={{ color: theme.textMuted }}>Tu es ici pour…</span>
        </h1>
      </div>

      <div style={{ flex: 1, padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {roles.map(r => (
          <button key={r.id} onClick={() => onSelect(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
            background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 20,
            cursor: 'pointer', color: theme.text, fontFamily: theme.fonts.body,
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: r.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={r.icon} size={28} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: theme.textMuted }}>{r.sub}</div>
            </div>
            <Icon name="arrowR" size={20} color={theme.textMuted} />
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 24px 36px', textAlign: 'center', fontSize: 13, color: theme.textMuted }}>
        Déjà membre ? <span style={{ color: theme.text, fontWeight: 600 }}>Connexion</span>
      </div>
    </div>
  );
}

function LoginScreen({ theme, onLogin, onBack }) {
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark} />
      <div style={{ padding: '8px 16px' }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: '50%', background: theme.surface,
          border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: theme.text,
        }}><Icon name="chevronL" size={18} /></button>
      </div>
      <div style={{ padding: '8px 28px 24px' }}>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 32, lineHeight: 1.1, fontWeight: 700, letterSpacing: -0.8 }}>
          Connexion
        </h1>
        <p style={{ marginTop: 6, marginBottom: 0, color: theme.textMuted, fontSize: 14 }}>Heureux de te revoir.</p>
      </div>

      <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field theme={theme} label="Adresse email" icon="user" value={email} onChange={setEmail} placeholder="ton@email.cm" />
        <Field theme={theme} label="Mot de passe" icon="shield" value={pwd} onChange={setPwd} placeholder="••••••••" type="password" rightIcon="eye" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textMuted, cursor: 'pointer' }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${theme.border}`, background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={12} color={theme.accent} strokeWidth={2.5}/>
            </span>
            Rester connecté
          </label>
          <span style={{ color: theme.accent, fontWeight: 500 }}>Mot de passe oublié ?</span>
        </div>

        <Button variant="dark" dark={theme._t.dark} size="lg" full onClick={onLogin} style={{ marginTop: 8, background: theme.accent, color: theme.onPrimary }}>
          Se connecter
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0', color: theme.textMuted, fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: theme.border }} />
          ou continuer avec
          <div style={{ flex: 1, height: 1, background: theme.border }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {['google','apple','phone'].map(p => (
            <button key={p} style={{
              height: 50, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text, cursor: 'pointer',
            }}><Icon name={p} size={20} /></button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 24px 36px', textAlign: 'center', fontSize: 13, color: theme.textMuted }}>
        Pas encore membre ? <span style={{ color: theme.text, fontWeight: 600 }}>Créer un compte</span>
      </div>
    </div>
  );
}

function Field({ theme, label, icon, value, onChange, placeholder, type = 'text', rightIcon }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: theme.textMuted, letterSpacing: 0.2 }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '0 14px', height: 52,
      }}>
        {icon && <Icon name={icon} size={18} color={theme.textMuted} />}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: theme.text, fontFamily: theme.fonts.body }}
        />
        {rightIcon && <Icon name={rightIcon} size={18} color={theme.textMuted} />}
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, RoleSelectScreen, LoginScreen, ONBOARDING_SLIDES });
