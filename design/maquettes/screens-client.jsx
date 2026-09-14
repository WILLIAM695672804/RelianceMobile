// screens-client.jsx — client home, map, new request, matching

const SERVICE_CATEGORIES = [
{ key: 'plumbing', icon: 'wrench', label: 'Plomberie' },
{ key: 'electrical', icon: 'bolt', label: 'Électricité' },
{ key: 'security', icon: 'camera', label: 'Sécurité' },
{ key: 'gps', icon: 'location', label: 'Traçage GPS' },
{ key: 'it', icon: 'laptop', label: 'Informatique' },
{ key: 'maintenance', icon: 'cog', label: 'Entretien' }];


const TECHS = [
{ id: 't1', name: 'Armand B.', trade: 'Plombier', rating: 4.8, x: 30, y: 40 },
{ id: 't2', name: 'Solange M.', trade: 'Électricienne', rating: 4.9, x: 60, y: 25 },
{ id: 't3', name: 'Jean-Paul K.', trade: 'Technicien sécurité', rating: 4.6, x: 45, y: 65 },
{ id: 't4', name: 'Yves T.', trade: 'Informaticien', rating: 4.7, x: 75, y: 55 },
{ id: 't5', name: 'Nadine F.', trade: 'Climatisation', rating: 4.85, x: 20, y: 70 }];


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

function ClientHomeScreen({ theme, onCategory, onSearch, onNotifications, onTech }) {
  return (
    <div style={{ height: '100%', paddingTop: 60, background: theme.bg, paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px' }}>
        <div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>Bonjour 👋</div>
          <div style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 20 }}>Reliance</div>
        </div>
        <div onClick={onNotifications} style={{ width: 40, height: 40, borderRadius: 14, background: theme.surfaceMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="bell" size={20} color={theme.text} />
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div onClick={onSearch} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 14,
          background: theme.surfaceMuted, cursor: 'pointer'
        }}>
          <Icon name="search" size={18} color={theme.textMuted} />
          <span style={{ color: theme.textMuted, fontSize: 14 }}>Rechercher un service, un technicien…</span>
        </div>
      </div>

      <Section title="Nos services">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 20px' }}>
          {SERVICE_CATEGORIES.map((c) =>
          <div key={c.key} onClick={() => onCategory && onCategory(c.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px',
            borderRadius: 16, background: theme.surface, border: `1px solid ${theme.border}`, cursor: 'pointer'
          }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={c.icon} size={22} color={theme.accent} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{c.label}</div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Techniciens à proximité">
        <div style={{ display: 'flex', gap: 12, padding: '0 20px', overflowX: 'auto' }}>
          {TECHS.map((t) =>
          <div key={t.id} onClick={() => onTech && onTech(t.id)} style={{
            minWidth: 140, padding: 14, borderRadius: 16, background: theme.surface,
            border: `1px solid ${theme.border}`, cursor: 'pointer', flexShrink: 0
          }}>
              <Avatar name={t.name} size={40} color={theme.accent} />
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 10 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>{t.trade}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={13} color="#F5A623" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{t.rating}</span>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>);

}

function MapPlaceholder({ theme, height = 300, children }) {
  return (
    <div style={{
      position: 'relative', height, borderRadius: 0,
      background: `repeating-linear-gradient(135deg, ${theme.surfaceMuted}, ${theme.surfaceMuted} 10px, ${theme.border} 10px, ${theme.border} 20px)`,
      overflow: 'hidden'
    }}>
      {children}
    </div>);

}

function MapScreen({ theme, onBack, onTech }) {
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Carte" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <MapPlaceholder theme={theme} height={620}>
        {TECHS.map((t) =>
        <div key={t.id} onClick={() => onTech && onTech(t.id)} style={{
          position: 'absolute', left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-100%)', cursor: 'pointer'
        }}>
            <div style={{ width: 36, height: 36, borderRadius: '50% 50% 50% 0', background: theme.accent, transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.25)' }}>
              <Icon name="wrench" size={16} color="#fff" style={{ transform: 'rotate(45deg)' }} />
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 14, height: 14, borderRadius: '50%', background: '#1F5BC4', border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(31,91,196,0.2)' }} />
      </MapPlaceholder>
    </div>);

}

function NewRequestScreen({ theme, category, onBack, onSubmit }) {
  const [step, setStep] = React.useState(0);
  const steps = ['Service', 'Description', 'Adresse', 'Photos'];
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Nouvelle demande" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: '16px 20px', display: 'flex', gap: 6 }}>
        {steps.map((s, i) =>
        <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? theme.accent : theme.border }} />
        )}
      </div>
      <div style={{ flex: 1, padding: '10px 20px' }}>
        {step === 0 &&
        <div>
            <h3 style={{ fontFamily: theme.fonts.display }}>Quel service ?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SERVICE_CATEGORIES.map((c) =>
            <div key={c.key} style={{
              padding: 14, borderRadius: 14, border: `2px solid ${c.key === category ? theme.accent : theme.border}`,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
                  <Icon name={c.icon} size={20} color={theme.accent} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
                </div>
            )}
            </div>
          </div>
        }
        {step === 1 &&
        <div>
            <h3 style={{ fontFamily: theme.fonts.display }}>Décrivez le problème</h3>
            <textarea placeholder="Ex : fuite d'eau sous l'évier de la cuisine…" style={{
            width: '100%', minHeight: 140, padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`,
            background: theme.surfaceMuted, fontSize: 14, resize: 'none'
          }} />
          </div>
        }
        {step === 2 &&
        <div>
            <h3 style={{ fontFamily: theme.fonts.display }}>Adresse d'intervention</h3>
            <Field label="Quartier" theme={theme} placeholder="Ex : Bastos, Yaoundé" />
            <Field label="Repère / indication" theme={theme} placeholder="Ex : près de la pharmacie" />
          </div>
        }
        {step === 3 &&
        <div>
            <h3 style={{ fontFamily: theme.fonts.display }}>Ajoutez des photos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <ImagePlaceholder label="+ ajouter" height={90} />
              <ImagePlaceholder label="photo" height={90} />
            </div>
          </div>
        }
      </div>
      <div style={{ padding: 20 }}>
        <Button accent={theme.accent} full size="lg" onClick={() => step < 3 ? setStep(step + 1) : onSubmit && onSubmit()}>
          {step < 3 ? 'Continuer' : 'Envoyer la demande'}
        </Button>
      </div>
    </div>);

}

function MatchingScreen({ theme, onMatched }) {
  React.useEffect(() => {
    const t = setTimeout(() => onMatched && onMatched(), 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', border: `4px solid ${theme.accent}33`, borderTopColor: theme.accent, animation: 'spin 1s linear infinite', marginBottom: 28 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{ fontFamily: theme.fonts.display, fontSize: 20, marginBottom: 10 }}>Recherche du meilleur technicien…</h2>
      <p style={{ color: theme.textMuted, fontSize: 14 }}>Nous analysons la disponibilité, la note et la distance des professionnels vérifiés.</p>
    </div>);

}

Object.assign(window, { ClientHomeScreen, MapScreen, NewRequestScreen, MatchingScreen, MapPlaceholder, SERVICE_CATEGORIES, TECHS });