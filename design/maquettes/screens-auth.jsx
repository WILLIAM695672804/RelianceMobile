// screens-auth.jsx — onboarding, role select, login

const ONBOARDING_SLIDES = [
{ icon: 'wrench', title: 'Trouvez le bon technicien', body: 'Plomberie, électricité, sécurité, climatisation — des professionnels vérifiés près de chez vous à Yaoundé.' },
{ icon: 'shield', title: 'Paiement sécurisé par séquestre', body: 'Votre argent est bloqué jusqu’à validation de l’intervention. Aucun risque, aucune avance non protégée.' },
{ icon: 'star', title: 'Suivez chaque intervention', body: 'Diagnostic, devis, intervention, facture — tout est tracé en temps réel dans l’application.' }];


function Field({ label, theme, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>{label}</div>
      <input {...props} style={{
        width: '100%', padding: '13px 14px', borderRadius: 12, border: `1px solid ${theme.border}`,
        background: theme.surfaceMuted, fontSize: 15, color: theme.text, outline: 'none'
      }} />
    </div>);

}

function OnboardingScreen({ theme, onNext, onSkip }) {
  const [i, setI] = React.useState(0);
  const slide = ONBOARDING_SLIDES[i];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 60, background: theme.bg }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px' }}>
        <button onClick={onSkip} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: 14, cursor: 'pointer' }}>Passer</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Icon name={slide.icon} size={44} color={theme.accent} />
        </div>
        <h1 style={{ fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 14px' }}>{slide.title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: theme.textMuted, margin: 0 }}>{slide.body}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {ONBOARDING_SLIDES.map((_, idx) =>
        <div key={idx} style={{ width: idx === i ? 22 : 7, height: 7, borderRadius: 4, background: idx === i ? theme.accent : theme.border, transition: 'all .2s' }} />
        )}
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <Button accent={theme.accent} full size="lg" iconRight={<Icon name="arrowR" size={18} color="#fff" />}
          onClick={() => i < ONBOARDING_SLIDES.length - 1 ? setI(i + 1) : onNext && onNext()}>
          {i < ONBOARDING_SLIDES.length - 1 ? 'Suivant' : 'Commencer'}
        </Button>
      </div>
    </div>);

}

function RoleSelectScreen({ theme, onSelect }) {
  const roles = [
  { key: 'client', icon: 'home', title: 'Je suis client', body: 'Je cherche un technicien pour un service à domicile.' },
  { key: 'tech', icon: 'wrench', title: 'Je suis technicien', body: 'Je propose mes services et gère mes interventions.' },
  { key: 'agency', icon: 'grid', title: 'Je suis une agence', body: 'Je gère une équipe de techniciens et leurs missions.' }];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '80px 20px 40px', background: theme.bg }}>
      <h1 style={{ fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>Qui êtes-vous ?</h1>
      <p style={{ color: theme.textMuted, fontSize: 14, margin: '0 0 28px' }}>Choisissez votre profil pour personnaliser votre expérience.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {roles.map((r) =>
        <div key={r.key} onClick={() => onSelect && onSelect(r.key)} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18,
          border: `1px solid ${theme.border}`, background: theme.surface, cursor: 'pointer'
        }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={r.icon} size={26} color={theme.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.4 }}>{r.body}</div>
            </div>
            <Icon name="chevronR" size={18} color={theme.textMuted} />
          </div>
        )}
      </div>
    </div>);

}

function LoginScreen({ theme, onLogin }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '90px 24px 40px', background: theme.bg }}>
      <h1 style={{ fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Connexion</h1>
      <p style={{ color: theme.textMuted, fontSize: 14, margin: '0 0 28px' }}>Accédez à votre compte Reliance.</p>
      <Field label="Numéro de téléphone" theme={theme} placeholder="+237 6XX XXX XXX" />
      <Field label="Mot de passe" theme={theme} type="password" placeholder="••••••••" />
      <div style={{ textAlign: 'right', marginBottom: 22 }}>
        <span style={{ fontSize: 13, color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Mot de passe oublié ?</span>
      </div>
      <Button accent={theme.accent} full size="lg" onClick={onLogin}>Se connecter</Button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0' }}>
        <div style={{ flex: 1, height: 1, background: theme.border }} />
        <span style={{ fontSize: 12, color: theme.textMuted }}>ou</span>
        <div style={{ flex: 1, height: 1, background: theme.border }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" full icon={<Icon name="google" size={18} />}>Google</Button>
        <Button variant="ghost" full icon={<Icon name="apple" size={18} />}>Apple</Button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: theme.textMuted }}>
        Pas encore de compte ? <span style={{ color: theme.accent, fontWeight: 700, cursor: 'pointer' }}>Créer un compte</span>
      </div>
    </div>);

}

Object.assign(window, { OnboardingScreen, RoleSelectScreen, LoginScreen, ONBOARDING_SLIDES });