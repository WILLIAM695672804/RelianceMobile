// screens-kyc.jsx — KYC flow + onboarding tech (Étape 2)

// ── KYC: choix du document ─────────────────────────────────────────────
function KYCStartScreen({ theme, onBack, onSelect }) {
  const docs = [
    { id: 'cni', label: 'Carte nationale d\'identité', sub: 'Recto + verso', icon: 'badge', recommend: true },
    { id: 'passport', label: 'Passeport', sub: 'Page principale', icon: 'file' },
    { id: 'permis', label: 'Permis de conduire', sub: 'Recto + verso', icon: 'wallet' },
  ];
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>Étape 1 / 4</div>
        <div style={{ width: 40 }}/>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 24px 8px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === 1 ? theme.accent : theme.border }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 24px 32px', overflow: 'auto' }}>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>Vérifions votre identité</h1>
        <p style={{ margin: '12px 0 24px', color: theme.textMuted, fontSize: 15, lineHeight: 1.5, textWrap: 'pretty' }}>
          Reliance protège ses utilisateurs en vérifiant chaque profil. Vos documents restent privés et chiffrés.
        </p>

        <div style={{ marginTop: 8, marginBottom: 8, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Choisissez un document</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(d => (
            <button key={d.id} onClick={() => onSelect(d.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
              <Card theme={theme} padding={16} radius={16} style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${theme.accent}14`, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={d.icon} size={22}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {d.label}
                    {d.recommend && <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} size="sm">Recommandé</Pill>}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{d.sub}</div>
                </div>
                <Icon name="chevronR" size={16} color={theme.textMuted}/>
              </Card>
            </button>
          ))}
        </div>

        {/* Trust ribbon */}
        <Card theme={theme} padding={14} radius={14} style={{ marginTop: 20, background: theme._t.dark ? '#2b2a36' : '#ffffff', border: `1px dashed ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Icon name="shield" size={18} color={REL.colors.accents.green}/>
            <div style={{ flex: 1, fontSize: 12, lineHeight: 1.5, color: theme.textMuted }}>
              Vos documents sont chiffrés bout-en-bout et examinés sous 24h par notre équipe KYC. Conforme à la réglementation BEAC.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── KYC: scan recto/verso ──────────────────────────────────────────────
function KYCScanScreen({ theme, onBack, onNext }) {
  const [step, setStep] = React.useState('front'); // front | back
  const [front, setFront] = React.useState(false);
  const [back, setBack] = React.useState(false);

  const capture = () => {
    if (step === 'front') { setFront(true); setStep('back'); }
    else { setBack(true); setTimeout(onNext, 600); }
  };

  return (
    <div style={{ height: '100%', background: '#0e0e12', color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CustomStatusBar dark={true}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>Étape 2 / 4 · {step === 'front' ? 'Recto' : 'Verso'}</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 2 ? '#fff' : 'rgba(255,255,255,0.2)' }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* fake camera viewfinder bg */}
        <div style={{ position: 'absolute', inset: 0, background: `
          radial-gradient(at 30% 40%, #2A2A2A 0%, #0e0e12 60%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 4px)
        ` }}/>

        {/* card frame guide */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 300, height: 190, borderRadius: 14,
            border: '2px solid #fff', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            position: 'relative', overflow: 'hidden',
            background: (step === 'front' && front) || (step === 'back' && back) ? `${theme.accent}40` : 'transparent',
            transition: 'background 0.3s',
          }}>
            {/* corner brackets */}
            {[
              { top: 0, left: 0, br: '0 0 0 0', t: 'tl' },
              { top: 0, right: 0, t: 'tr' },
              { bottom: 0, left: 0, t: 'bl' },
              { bottom: 0, right: 0, t: 'br' },
            ].map(c => (
              <div key={c.t} style={{ position: 'absolute', ...c, width: 22, height: 22,
                borderTop: c.t.startsWith('t') ? `3px solid ${theme.accent}` : 'none',
                borderBottom: c.t.startsWith('b') ? `3px solid ${theme.accent}` : 'none',
                borderLeft: c.t.endsWith('l') ? `3px solid ${theme.accent}` : 'none',
                borderRight: c.t.endsWith('r') ? `3px solid ${theme.accent}` : 'none',
              }}/>
            ))}

            {/* simulated card content */}
            <div style={{ position: 'absolute', inset: 12, opacity: 0.18, fontSize: 9, color: '#fff', fontFamily: 'monospace' }}>
              <div style={{ fontWeight: 700, fontSize: 11 }}>RÉPUBLIQUE DU CAMEROUN</div>
              <div style={{ marginTop: 4 }}>CARTE NATIONALE D'IDENTITÉ</div>
              <div style={{ marginTop: 18 }}>NOM : KAMGA</div>
              <div>PRÉNOMS : YVES</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, textAlign: 'center', padding: '0 32px' }}>
          <div style={{ fontSize: 17, fontWeight: 600, fontFamily: theme.fonts.display, marginBottom: 6 }}>
            {step === 'front' ? 'Cadrez le recto de votre CNI' : 'Retournez votre carte'}
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Tenez votre téléphone bien droit, sans reflets</div>
        </div>
      </div>

      {/* Capture button */}
      <div style={{ padding: '20px 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <button style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={20}/></button>
        <button onClick={capture} style={{ width: 76, height: 76, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${theme.accent}55` }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: theme.accent }}/>
        </button>
        <button style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkle" size={20}/></button>
      </div>
    </div>
  );
}

// ── KYC: selfie ─────────────────────────────────────────────────────────
function KYCSelfieScreen({ theme, onBack, onNext }) {
  const [captured, setCaptured] = React.useState(false);
  return (
    <div style={{ height: '100%', background: '#0e0e12', color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CustomStatusBar dark={true}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>Étape 3 / 4 · Selfie</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 3 ? '#fff' : 'rgba(255,255,255,0.2)' }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(at 50% 30%, #3A2D2D 0%, #0e0e12 60%)` }}/>

        {/* face oval */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 240, height: 320, borderRadius: '50%',
            border: `3px ${captured ? 'solid' : 'dashed'} ${captured ? REL.colors.accents.green : '#fff'}`,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
            transition: 'all 0.3s',
            position: 'relative',
          }}>
            {captured && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: REL.colors.accents.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                  <Icon name="check" size={30} color="#fff" strokeWidth={3}/>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, textAlign: 'center', padding: '0 32px' }}>
          <div style={{ fontSize: 17, fontWeight: 600, fontFamily: theme.fonts.display, marginBottom: 6 }}>
            {captured ? 'Visage détecté ✓' : 'Centrez votre visage'}
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Regardez l'objectif et clignez naturellement</div>
        </div>
      </div>

      <div style={{ padding: '20px 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => { if (captured) onNext(); else { setCaptured(true); setTimeout(onNext, 1100); } }} style={{ width: 76, height: 76, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {captured
            ? <Icon name="arrowR" size={28} color="#0e0e12" strokeWidth={2.5}/>
            : <div style={{ width: 60, height: 60, borderRadius: '50%', background: theme.accent }}/>}
        </button>
      </div>
    </div>
  );
}

// ── KYC: en attente ─────────────────────────────────────────────────────
function KYCPendingScreen({ theme, onDone }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: theme.accent }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {/* Hero illustration */}
        <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 32 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `${theme.accent}10`, animation: 'kpulse 2s ease-in-out infinite' }}/>
          <div style={{ position: 'absolute', inset: 24, borderRadius: '50%', background: `${theme.accent}1A` }}/>
          <div style={{ position: 'absolute', inset: 50, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.onPrimary }}>
            <Icon name="clock" size={36}/>
          </div>
          <style>{`@keyframes kpulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.08); opacity: 0.6 } }`}</style>
        </div>

        <Pill bg={`${REL.colors.accents.amber}1A`} color={REL.colors.accents.amber} size="sm" icon={<Icon name="clock" size={11}/>}>En cours d'examen</Pill>
        <h1 style={{ margin: '14px 0 10px', fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15 }}>Vérification en cours</h1>
        <p style={{ margin: 0, fontSize: 14, color: theme.textMuted, lineHeight: 1.5, textWrap: 'pretty', maxWidth: 280 }}>
          Notre équipe examine vos documents. Vous recevrez une notification dans <b style={{ color: theme.text }}>~24 heures</b>.
        </p>

        {/* Timeline */}
        <div style={{ marginTop: 32, width: '100%', textAlign: 'left' }}>
          {[
            { lbl: 'Documents reçus', sub: 'Aujourd\'hui à 14:32', done: true },
            { lbl: 'Examen visuel', sub: 'Automatique', active: true },
            { lbl: 'Validation manuelle', sub: 'Sous 24h' },
            { lbl: 'Compte vérifié', sub: 'Vous serez notifié' },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i === arr.length - 1 ? 0 : 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%',
                  background: s.done ? REL.colors.accents.green : s.active ? theme.accent : 'transparent',
                  border: `2px solid ${s.done ? REL.colors.accents.green : s.active ? theme.accent : theme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', boxShadow: s.active ? `0 0 0 6px ${theme.accent}22` : 'none',
                }}>{s.done && <Icon name="check" size={12} strokeWidth={3}/>}</div>
                {i < arr.length - 1 && <div style={{ width: 2, flex: 1, marginTop: 2, background: s.done ? REL.colors.accents.green : theme.border }}/>}
              </div>
              <div style={{ flex: 1, paddingTop: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.done || s.active ? theme.text : theme.textMuted }}>{s.lbl}</div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <Button full size="lg" style={{ background: theme.text, color: theme.bg }} onClick={onDone}>Continuer en mode limité</Button>
        <div style={{ textAlign: 'center', fontSize: 11, color: theme.textMuted, marginTop: 10 }}>
          Vous pouvez explorer la plateforme en attendant la validation
        </div>
      </div>
    </div>
  );
}

// ── KYC: rejeté ─────────────────────────────────────────────────────────
function KYCRejectedScreen({ theme, onRetry, onSupport }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      <div style={{ flex: 1, padding: '32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 24 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `${REL.colors.accents.red}1A` }}/>
          <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: REL.colors.accents.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icon name="close" size={36} strokeWidth={3}/>
          </div>
        </div>

        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Vérification non approuvée</h1>
        <p style={{ margin: '10px 0 24px', fontSize: 14, color: theme.textMuted, maxWidth: 300, lineHeight: 1.5 }}>
          Nous n'avons pas pu valider vos documents. Détails ci-dessous.
        </p>

        {/* Reasons */}
        <div style={{ width: '100%', textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Motifs détectés</div>
          <Card theme={theme} padding={0} radius={14}>
            {[
              { lbl: 'Document flou', sub: 'Recto de la CNI illisible', icon: 'image' },
              { lbl: 'Selfie non concordant', sub: 'Le visage ne correspond pas au document', icon: 'user' },
            ].map((r, i, arr) => (
              <div key={i} style={{ padding: 14, display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${REL.colors.accents.red}1A`, color: REL.colors.accents.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={r.icon} size={14}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.lbl}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{r.sub}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={{ padding: '16px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button full size="lg" style={{ background: theme.accent, color: theme.onPrimary }} onClick={onRetry}>Re-soumettre les documents</Button>
        <Button full size="md" variant="ghost" dark={theme._t.dark} onClick={onSupport}>Contacter le support</Button>
      </div>
    </div>
  );
}

// ── Onboarding tech: 5 étapes ──────────────────────────────────────────
function TechOnboardingScreen({ theme, onBack, onDone }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    { id: 'profile', icon: 'user', title: 'Votre profil pro', sub: 'Photo, bio, ville d\'intervention' },
    { id: 'skills', icon: 'wrench', title: 'Vos compétences', sub: 'Métiers + niveau de maîtrise' },
    { id: 'rates', icon: 'wallet', title: 'Vos tarifs', sub: 'Diagnostic, taux horaire, forfaits' },
    { id: 'zone', icon: 'map', title: 'Zone de service', sub: 'Rayon d\'intervention' },
    { id: 'review', icon: 'check', title: 'Récap & soumission', sub: 'Vérifiez avant validation' },
  ];
  const current = steps[step];

  const next = () => step < steps.length - 1 ? setStep(step + 1) : onDone();
  const prev = () => step > 0 ? setStep(step - 1) : onBack();

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={prev} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>Étape {step + 1} / {steps.length}</div>
        <div style={{ width: 40 }}/>
      </div>
      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? theme.accent : theme.border }}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 24px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${theme.accent}1A`, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={current.icon} size={22}/></div>
          <div>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{current.title}</h1>
            <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{current.sub}</div>
          </div>
        </div>

        {/* Step content */}
        {current.id === 'profile' && <TechOnbProfile theme={theme}/>}
        {current.id === 'skills' && <TechOnbSkills theme={theme}/>}
        {current.id === 'rates' && <TechOnbRates theme={theme}/>}
        {current.id === 'zone' && <TechOnbZone theme={theme}/>}
        {current.id === 'review' && <TechOnbReview theme={theme}/>}
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
        {step > 0 && <Button size="lg" variant="ghost" dark={theme._t.dark} onClick={prev} style={{ flex: 1 }}>Retour</Button>}
        <Button size="lg" full={step === 0} style={{ flex: step > 0 ? 2 : 1, background: theme.accent, color: theme.onPrimary }} onClick={next}>
          {step === steps.length - 1 ? 'Soumettre pour validation' : 'Continuer'}
        </Button>
      </div>
    </div>
  );
}

function TechOnbProfile({ theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <Avatar name="Paul Mvondo" color={theme.accent} size={72}/>
          <button style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: theme.text, color: theme.bg, border: `3px solid ${theme.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={12}/></button>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Photo de profil</div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>Visible par les clients</div>
        </div>
      </div>

      <FormField theme={theme} label="Nom complet" value="Paul Mvondo"/>
      <FormField theme={theme} label="Téléphone" value="+237 6 99 12 34 56"/>
      <FormField theme={theme} label="Ville" value="Yaoundé"/>
      <FormField theme={theme} label="Bio courte" multiline value="Plombier certifié, 12 ans d'expérience. Spécialisé fuites & chauffe-eau."/>
    </div>
  );
}

function TechOnbSkills({ theme }) {
  const skills = [
    { id: 'plomb', label: 'Plomberie', level: 'Expert', selected: true },
    { id: 'elec', label: 'Électricité', level: 'Confirmé', selected: true },
    { id: 'clim', label: 'Climatisation', level: 'Junior' },
    { id: 'menuis', label: 'Menuiserie' },
    { id: 'soud', label: 'Soudure' },
    { id: 'gps', label: 'GPS & Tracking' },
    { id: 'video', label: 'Vidéosurveillance' },
    { id: 'info', label: 'Informatique' },
  ];
  return (
    <div>
      <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Sélectionnez vos métiers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {skills.map(s => (
          <Card key={s.id} theme={theme} padding={14} radius={12} style={{ display: 'flex', alignItems: 'center', gap: 12, borderColor: s.selected ? theme.accent : theme.border, background: s.selected ? `${theme.accent}08` : theme.surface }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${s.selected ? theme.accent : theme.border}`, background: s.selected ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {s.selected && <Icon name="check" size={12} strokeWidth={3}/>}
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{s.label}</div>
            {s.selected && (
              <div style={{ display: 'flex', gap: 4 }}>
                {['Junior','Confirmé','Expert'].map(l => (
                  <span key={l} style={{ padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                    background: l === s.level ? theme.text : 'transparent',
                    color: l === s.level ? theme.bg : theme.textMuted,
                    border: l === s.level ? 'none' : `1px solid ${theme.border}`,
                  }}>{l}</span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function TechOnbRates({ theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card theme={theme} padding={14} radius={14}>
        <div style={{ fontSize: 12, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Diagnostic à domicile</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <input defaultValue="5 000" style={{ flex: 1, fontFamily: theme.fonts.display, fontSize: 32, fontWeight: 700, background: 'transparent', border: 'none', color: theme.text, outline: 'none', padding: 0 }}/>
          <span style={{ fontSize: 14, color: theme.textMuted, fontWeight: 600 }}>XAF</span>
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Frais facturé même sans intervention</div>
      </Card>

      <Card theme={theme} padding={14} radius={14}>
        <div style={{ fontSize: 12, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Taux horaire</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <input defaultValue="8 000" style={{ flex: 1, fontFamily: theme.fonts.display, fontSize: 32, fontWeight: 700, background: 'transparent', border: 'none', color: theme.text, outline: 'none', padding: 0 }}/>
          <span style={{ fontSize: 14, color: theme.textMuted, fontWeight: 600 }}>XAF/h</span>
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Moyenne plomberie Yaoundé : 7 500 - 9 500 XAF/h</div>
      </Card>

      <div style={{ marginTop: 4, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Forfaits proposés</div>
      <Card theme={theme} padding={0} radius={14}>
        {[
          { lbl: 'Débouchage simple', amt: '12 000', dur: '< 1h' },
          { lbl: 'Remplacement chauffe-eau', amt: '35 000', dur: '~2h' },
        ].map((f, i, a) => (
          <div key={i} style={{ padding: 14, display: 'flex', alignItems: 'center', borderBottom: i === a.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.lbl}</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>{f.dur}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.display }}>{f.amt} <span style={{ fontSize: 10, color: theme.textMuted }}>XAF</span></div>
          </div>
        ))}
        <div style={{ padding: 12, borderTop: `1px solid ${theme.divider}`, textAlign: 'center', color: theme.accent, fontSize: 12, fontWeight: 600 }}>+ Ajouter un forfait</div>
      </Card>
    </div>
  );
}

function TechOnbZone({ theme }) {
  return (
    <div>
      <Card theme={theme} padding={0} radius={16} style={{ overflow: 'hidden', height: 220, position: 'relative', marginBottom: 14 }}>
        <MapPlaceholder theme={theme} compact techs={[]} you={{ x: 50, y: 50 }}/>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 180, height: 180, borderRadius: '50%', background: `${theme.accent}33`, border: `2.5px dashed ${theme.accent}` }}/>
        </div>
      </Card>

      <Card theme={theme} padding={14} radius={14}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Rayon d'intervention</span>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.display, color: theme.accent }}>15 km</span>
        </div>
        <input type="range" min="2" max="50" defaultValue="15" style={{ width: '100%', accentColor: theme.accent }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.textMuted, marginTop: 4 }}>
          <span>2 km</span><span>50 km</span>
        </div>
      </Card>

      <div style={{ marginTop: 14, marginBottom: 8, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Quartiers couverts (auto)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['Bastos','Tsinga','Mvog-Ada','Nlongkak','Ngousso','Mfoundi','Etoa-Meki'].map(q => <Pill key={q} bg={`${theme.accent}14`} color={theme.accent}>{q}</Pill>)}
      </div>
    </div>
  );
}

function TechOnbReview({ theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        { title: 'Profil', items: ['Paul Mvondo', '+237 6 99 12 34 56', 'Yaoundé'] },
        { title: 'Compétences', items: ['Plomberie · Expert', 'Électricité · Confirmé'] },
        { title: 'Tarifs', items: ['Diagnostic : 5 000 XAF', 'Taux horaire : 8 000 XAF/h', '2 forfaits configurés'] },
        { title: 'Zone', items: ['15 km autour de Bastos', '7 quartiers couverts'] },
      ].map(s => (
        <Card key={s.title} theme={theme} padding={14} radius={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: theme.textMuted }}>{s.title}</span>
            <span style={{ fontSize: 11, color: theme.accent, fontWeight: 600 }}>Modifier</span>
          </div>
          {s.items.map((it, i) => (
            <div key={i} style={{ fontSize: 13, color: theme.text, marginTop: 4 }}>{it}</div>
          ))}
        </Card>
      ))}

      <Card theme={theme} padding={14} radius={14} style={{ background: `${REL.colors.accents.amber}10`, border: `1px solid ${REL.colors.accents.amber}40` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="shield" size={18} color={REL.colors.accents.amber}/>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: theme.text }}>
            Votre profil sera visible après validation KYC + relecture par notre équipe (sous 48h).
          </div>
        </div>
      </Card>
    </div>
  );
}

function FormField({ theme, label, value, multiline }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div>
      <label style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</label>
      <Tag defaultValue={value} rows={multiline ? 3 : undefined} style={{
        display: 'block', width: '100%', marginTop: 6,
        background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12,
        padding: '12px 14px', fontSize: 14, color: theme.text, outline: 'none', boxSizing: 'border-box',
        fontFamily: theme.fonts.body, resize: multiline ? 'vertical' : undefined,
      }}/>
    </div>
  );
}

Object.assign(window, { KYCStartScreen, KYCScanScreen, KYCSelfieScreen, KYCPendingScreen, KYCRejectedScreen, TechOnboardingScreen });
