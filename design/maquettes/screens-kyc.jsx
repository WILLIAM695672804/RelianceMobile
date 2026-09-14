// screens-kyc.jsx — KYC verification flow + technician onboarding

function FormField({ label, theme, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>{label}</div>
      <input {...props} style={{
        width: '100%', padding: '13px 14px', borderRadius: 12, border: `1px solid ${theme.border}`,
        background: theme.surfaceMuted, fontSize: 15, color: theme.text, outline: 'none'
      }} />
    </div>);

}

function KYCStartScreen({ theme, onStart, onBack }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Vérification d'identité" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: 90, height: 90, borderRadius: 26, background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Icon name="shield" size={42} color={theme.accent} />
        </div>
        <h2 style={{ fontFamily: theme.fonts.display, fontSize: 20, margin: '0 0 10px' }}>Vérifiez votre identité</h2>
        <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.6 }}>Conformément à la réglementation BEAC, nous devons vérifier votre pièce d'identité avant d'activer votre compte technicien.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 24, textAlign: 'left' }}>
          {['Carte nationale d’identité ou passeport', 'Photo selfie de vérification', 'Validation sous 24 à 48h'].map((s) =>
          <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon name="check" size={16} color={theme.accent} /><span style={{ fontSize: 13 }}>{s}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onStart}>Commencer la vérification</Button>
      </div>
    </div>);

}

function KYCScanScreen({ theme, onBack, onNext }) {
  return (
    <div style={{ height: '100%', background: '#0B1220', display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Scan de la pièce" dark onBack={onBack} accent="#fff" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <div style={{ width: '100%', aspectRatio: '1.58', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={36} color="rgba(255,255,255,0.6)" />
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 13, padding: '0 30px' }}>Placez votre carte d'identité dans le cadre, bien éclairée et lisible.</p>
      <div style={{ padding: '20px 24px 40px' }}>
        <Button accent="#1F5BC4" full size="lg" onClick={onNext}>Capturer</Button>
      </div>
    </div>);

}

function KYCSelfieScreen({ theme, onBack, onNext }) {
  return (
    <div style={{ height: '100%', background: '#0B1220', display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Photo selfie" dark onBack={onBack} accent="#fff" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 240, height: 240, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={48} color="rgba(255,255,255,0.6)" />
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 13, padding: '0 30px' }}>Positionnez votre visage dans le cercle et regardez l'objectif.</p>
      <div style={{ padding: '20px 24px 40px' }}>
        <Button accent="#1F5BC4" full size="lg" onClick={onNext}>Prendre la photo</Button>
      </div>
    </div>);

}

function KYCPendingScreen({ theme, onDone }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 84, height: 84, borderRadius: '50%', background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Icon name="clock" size={38} color={theme.accent} />
      </div>
      <h2 style={{ fontFamily: theme.fonts.display, fontSize: 20, margin: '0 0 8px' }}>Vérification en cours</h2>
      <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 28 }}>Votre dossier est en cours d'examen. Vous recevrez une notification sous 24 à 48h.</p>
      <Button variant="ghost" full onClick={onDone}>Retour à l'accueil</Button>
    </div>);

}

function KYCRejectedScreen({ theme, onRetry }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#E5484D22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Icon name="close" size={38} color="#E5484D" />
      </div>
      <h2 style={{ fontFamily: theme.fonts.display, fontSize: 20, margin: '0 0 8px' }}>Vérification refusée</h2>
      <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 28 }}>Le document fourni était illisible ou incomplet. Veuillez recommencer avec des photos plus nettes.</p>
      <Button accent={theme.accent} full size="lg" onClick={onRetry}>Réessayer</Button>
    </div>);

}

function TechOnbProfile({ theme }) {
  return (
    <div>
      <h3 style={{ fontFamily: theme.fonts.display }}>Votre profil</h3>
      <FormField label="Nom complet" theme={theme} placeholder="Armand Biya" />
      <FormField label="Téléphone" theme={theme} placeholder="+237 6XX XXX XXX" />
    </div>);

}
function TechOnbSkills({ theme }) {
  return (
    <div>
      <h3 style={{ fontFamily: theme.fonts.display }}>Vos compétences</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SERVICE_CATEGORIES.map((c) => <Pill key={c.key} bg={theme.surfaceMuted}>{c.label}</Pill>)}
      </div>
    </div>);

}
function TechOnbRates({ theme }) {
  return (
    <div>
      <h3 style={{ fontFamily: theme.fonts.display }}>Vos tarifs</h3>
      <FormField label="Tarif horaire (FCFA)" theme={theme} placeholder="5 000" />
      <FormField label="Frais de déplacement (FCFA)" theme={theme} placeholder="2 000" />
    </div>);

}
function TechOnbZone({ theme }) {
  return (
    <div>
      <h3 style={{ fontFamily: theme.fonts.display }}>Zone d'intervention</h3>
      <MapPlaceholder theme={theme} height={200} />
    </div>);

}
function TechOnbReview({ theme }) {
  return (
    <div>
      <h3 style={{ fontFamily: theme.fonts.display }}>Récapitulatif</h3>
      <p style={{ fontSize: 14, color: theme.textMuted }}>Vérifiez vos informations avant de soumettre votre candidature.</p>
    </div>);

}

function TechOnboardingScreen({ theme, onBack, onDone }) {
  const [step, setStep] = React.useState(0);
  const steps = [TechOnbProfile, TechOnbSkills, TechOnbRates, TechOnbZone, TechOnbReview];
  const Current = steps[step];
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Devenir technicien" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: '16px 20px', display: 'flex', gap: 6 }}>
        {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? theme.accent : theme.border }} />)}
      </div>
      <div style={{ flex: 1, padding: '10px 20px' }}><Current theme={theme} /></div>
      <div style={{ padding: 20 }}>
        <Button accent={theme.accent} full size="lg" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onDone && onDone()}>
          {step < steps.length - 1 ? 'Continuer' : 'Soumettre ma candidature'}
        </Button>
      </div>
    </div>);

}

Object.assign(window, { KYCStartScreen, KYCScanScreen, KYCSelfieScreen, KYCPendingScreen, KYCRejectedScreen, TechOnboardingScreen });