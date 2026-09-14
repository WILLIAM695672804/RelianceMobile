// screens-feedback.jsx — rating, dispute, cancellation

function RatingScreen({ theme, onBack, onSubmit }) {
  const [rating, setRating] = React.useState(4);
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Évaluer l'intervention" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 24, textAlign: 'center' }}>
        <Avatar name="Armand B." size={72} color={theme.accent} />
        <h2 style={{ fontFamily: theme.fonts.display, fontSize: 19, margin: '14px 0 20px' }}>Comment s'est passée votre intervention avec Armand ?</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((i) =>
          <div key={i} onClick={() => setRating(i)} style={{ cursor: 'pointer' }}>
              <Icon name="star" size={34} color={i <= rating ? '#F5A623' : theme.border} />
            </div>
          )}
        </div>
        <textarea placeholder="Laissez un commentaire (facultatif)" style={{
          width: '100%', minHeight: 100, padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`,
          background: theme.surfaceMuted, fontSize: 14, resize: 'none'
        }} />
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onSubmit}>Envoyer l'évaluation</Button>
      </div>
    </div>);

}

function DisputeScreen({ theme, onBack, onSubmit }) {
  const reasons = ['Travail non conforme', 'Technicien absent', 'Facturation incorrecte', 'Autre problème'];
  const [reason, setReason] = React.useState(reasons[0]);
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Ouvrir un litige" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 20 }}>
        <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 16 }}>Le paiement en séquestre restera bloqué jusqu'à résolution du litige par notre équipe.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {reasons.map((r) =>
          <div key={r} onClick={() => setReason(r)} style={{
            padding: 14, borderRadius: 12, border: `2px solid ${reason === r ? theme.accent : theme.border}`,
            fontSize: 14, fontWeight: 500, cursor: 'pointer'
          }}>{r}</div>
          )}
        </div>
        <textarea placeholder="Décrivez le problème en détail…" style={{
          width: '100%', minHeight: 120, padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`,
          background: theme.surfaceMuted, fontSize: 14, resize: 'none'
        }} />
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <Button accent="#E5484D" full size="lg" onClick={onSubmit}>Soumettre le litige</Button>
      </div>
    </div>);

}

function CancelScreen({ theme, onBack, onConfirm }) {
  const [step, setStep] = React.useState(0);
  const reasons = ['Le technicien n’est plus disponible', 'J’ai trouvé une autre solution', 'Délai trop long', 'Autre raison'];
  const [reason, setReason] = React.useState(reasons[0]);
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Annuler la demande" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      {step === 0 ?
      <div style={{ flex: 1, padding: 20 }}>
          <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 16 }}>Pourquoi souhaitez-vous annuler ?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reasons.map((r) =>
          <div key={r} onClick={() => setReason(r)} style={{
            padding: 14, borderRadius: 12, border: `2px solid ${reason === r ? theme.accent : theme.border}`,
            fontSize: 14, fontWeight: 500, cursor: 'pointer'
          }}>{r}</div>
          )}
          </div>
        </div> :

      <div style={{ flex: 1, padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="info" size={40} color="#E5484D" />
          <h2 style={{ fontFamily: theme.fonts.display, fontSize: 18, margin: '16px 0 8px' }}>Confirmer l'annulation ?</h2>
          <p style={{ fontSize: 13, color: theme.textMuted }}>Cette action est irréversible. Les fonds en séquestre seront remboursés sous 3 à 5 jours ouvrés.</p>
        </div>
      }
      <div style={{ padding: '0 20px 20px' }}>
        <Button accent="#E5484D" full size="lg" onClick={() => step === 0 ? setStep(1) : onConfirm && onConfirm()}>
          {step === 0 ? 'Continuer' : 'Confirmer l’annulation'}
        </Button>
      </div>
    </div>);

}

Object.assign(window, { RatingScreen, DisputeScreen, CancelScreen });