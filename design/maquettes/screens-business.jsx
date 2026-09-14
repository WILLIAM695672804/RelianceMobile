// screens-business.jsx — diagnostic, devis, validation, escrow release, invoice

const pStyle = { fontSize: 14, lineHeight: 1.6, margin: 0 };
const textareaStyle = { width: '100%', minHeight: 90, padding: 14, borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, resize: 'none' };

function ReportSection({ title, children, theme }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.textMuted, marginBottom: 8 }}>{title}</div>
      {children}
    </div>);

}

function ReportRow({ label, value, theme }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.divider}` }}>
      <span style={{ fontSize: 13, color: theme.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>);

}

function DiagnosticReportScreen({ theme, onBack, mode = 'client', onValidate }) {
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Rapport de diagnostic" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 20 }}>
        <ReportSection title="Résumé" theme={theme}>
          <p style={pStyle}>Fuite identifiée au niveau du raccord sous l'évier. Remplacement du joint et du flexible nécessaire.</p>
        </ReportSection>
        <ReportSection title="Détails" theme={theme}>
          <ReportRow label="Catégorie" value="Plomberie" theme={theme} />
          <ReportRow label="Gravité" value="Modérée" theme={theme} />
          <ReportRow label="Durée estimée" value="1h30" theme={theme} />
        </ReportSection>
        <ReportSection title="Photos" theme={theme}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <ImagePlaceholder label="avant" height={80} /><ImagePlaceholder label="détail" height={80} /><ImagePlaceholder label="pièce" height={80} />
          </div>
        </ReportSection>
        {mode === 'tech-edit' &&
        <ReportSection title="Notes techniques" theme={theme}>
            <textarea style={textareaStyle} placeholder="Ajoutez vos observations…" />
          </ReportSection>
        }
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onValidate}>{mode === 'tech-edit' ? 'Envoyer le rapport' : 'Voir le devis'}</Button>
      </div>
    </div>);

}

function QuoteScreen({ theme, onBack, onAccept }) {
  const lines = [
  { label: 'Main d’œuvre', amount: 15000 },
  { label: 'Joint + flexible', amount: 6000 },
  { label: 'Déplacement', amount: 4000 }];

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Devis" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 20 }}>
        <Card theme={theme} padding={18}>
          {lines.map((l) => <ReportRow key={l.label} label={l.label} value={`${l.amount.toLocaleString('fr-FR')} FCFA`} theme={theme} />)}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 800, fontSize: 16 }}>
            <span>Total</span><span>{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </Card>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: theme.accent + '14', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="shield" size={20} color={theme.accent} />
          <span style={{ fontSize: 13 }}>Ce montant sera bloqué en séquestre jusqu'à validation de l'intervention.</span>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
        <Button variant="ghost" full>Refuser</Button>
        <Button accent={theme.accent} full onClick={onAccept}>Accepter et payer</Button>
      </div>
    </div>);

}

function ValidationScreen({ theme, onBack, onValidate }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Contrôle qualité" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 20 }}>
        <p style={pStyle}>Le technicien a marqué l'intervention comme terminée. Vérifiez le travail effectué avant de libérer le paiement.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, margin: '16px 0' }}>
          <ImagePlaceholder label="avant" height={110} /><ImagePlaceholder label="après" height={110} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={28} color="#F5A623" />)}
        </div>
      </div>
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
        <Button variant="ghost" full>Signaler un problème</Button>
        <Button accent={theme.accent} full onClick={onValidate}>Valider</Button>
      </div>
    </div>);

}

function EscrowReleaseScreen({ theme, onBack, onDone }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#0EA5E922', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Icon name="check" size={40} color="#0EA5E9" />
      </div>
      <h2 style={{ fontFamily: theme.fonts.display, fontSize: 20, margin: '0 0 8px' }}>Paiement libéré</h2>
      <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 28 }}>25 000 FCFA ont été transférés au technicien. Merci de votre confiance.</p>
      <Button accent={theme.accent} full size="lg" onClick={onDone}>Terminer</Button>
    </div>);

}

function InvoiceScreen({ theme, onBack, onDownload }) {
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Facture" dark={theme._t.dark} onBack={onBack} accent={theme.accent} right={<Icon name="upload" size={19} color={theme.accent} onClick={onDownload} />} />
      <div style={{ margin: 20, padding: 24, borderRadius: 4, background: '#fff', color: '#111', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <b style={{ fontFamily: theme.fonts.display, fontSize: 16 }}>RELIANCE</b>
          <span>Facture n° 4821</span>
        </div>
        <div style={{ marginBottom: 16 }}>Client : Mireille A.<br />Technicien : Armand B.<br />Date : 13/09/2026</div>
        <div style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '10px 0', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Main d'œuvre</span><span>15 000 FCFA</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pièces</span><span>6 000 FCFA</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Déplacement</span><span>4 000 FCFA</span></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total TTC</span><span>25 000 FCFA</span></div>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <Button accent={theme.accent} full onClick={onDownload}>Télécharger le PDF</Button>
      </div>
    </div>);

}

Object.assign(window, { DiagnosticReportScreen, QuoteScreen, ValidationScreen, EscrowReleaseScreen, InvoiceScreen });