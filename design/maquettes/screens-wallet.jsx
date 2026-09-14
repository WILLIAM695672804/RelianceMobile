// screens-wallet.jsx — top-up, withdraw, OTP, transaction detail

function WalletTopUpScreen({ theme, onBack, onNext }) {
  const [amount, setAmount] = React.useState('10000');
  const quick = [5000, 10000, 25000, 50000];
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Recharger" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{
            border: 'none', outline: 'none', background: 'transparent', textAlign: 'center',
            fontFamily: theme.fonts.display, fontSize: 40, fontWeight: 800, width: '100%', color: theme.text
          }} />
          <div style={{ color: theme.textMuted, fontSize: 13 }}>FCFA</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
          {quick.map((q) =>
          <div key={q} onClick={() => setAmount(String(q))} style={{ padding: '10px 4px', borderRadius: 10, textAlign: 'center', fontSize: 12, fontWeight: 600, background: theme.surfaceMuted, cursor: 'pointer' }}>
              {q.toLocaleString('fr-FR')}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: theme.textMuted, marginBottom: 10 }}>Moyen de paiement</div>
        {['MTN Mobile Money', 'Orange Money'].map((m) =>
        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${theme.border}`, marginBottom: 10 }}>
            <Icon name="phone" size={20} color={theme.accent} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{m}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onNext}>Continuer</Button>
      </div>
    </div>);

}

function WalletWithdrawScreen({ theme, onBack, onNext }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Retirer des fonds" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 4 }}>Solde disponible</div>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 800, marginBottom: 24 }}>33 000 FCFA</div>
        <FormField label="Montant à retirer" theme={theme} placeholder="0" />
        <FormField label="Numéro Mobile Money" theme={theme} placeholder="+237 6XX XXX XXX" />
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onNext}>Confirmer le retrait</Button>
      </div>
    </div>);

}

function WalletOTPScreen({ theme, onBack, onVerify }) {
  const [code, setCode] = React.useState(['', '', '', '']);
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 90 }}>
      <IOSNavBar title="" dark={theme._t.dark} onBack={onBack} accent={theme.accent} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
      <Icon name="phone" size={40} color={theme.accent} />
      <h2 style={{ fontFamily: theme.fonts.display, fontSize: 19, margin: '18px 0 6px' }}>Entrez le code reçu</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>Un code à 4 chiffres a été envoyé par SMS</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
        {code.map((c, i) =>
        <input key={i} maxLength={1} value={c} onChange={(e) => {
          const next = [...code];next[i] = e.target.value;setCode(next);
        }} style={{
          width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
          borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceMuted
        }} />
        )}
      </div>
      <div style={{ width: '100%', padding: '0 24px' }}>
        <Button accent={theme.accent} full size="lg" onClick={onVerify}>Vérifier</Button>
      </div>
    </div>);

}

function TransactionDetailScreen({ theme, onBack }) {
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Détail de la transaction" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon name="wallet" size={28} color={theme.accent} />
        </div>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 800 }}>-25 000 FCFA</div>
        <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>Aujourd'hui, 10:42</div>
      </div>
      <Card theme={theme} style={{ margin: '0 20px' }}>
        <ReportRow label="Statut" value="Complétée" theme={theme} />
        <ReportRow label="Référence" value="TX-48219-CM" theme={theme} />
        <ReportRow label="Méthode" value="Séquestre Reliance" theme={theme} />
        <ReportRow label="Bénéficiaire" value="Armand B." theme={theme} />
      </Card>
    </div>);

}

Object.assign(window, { WalletTopUpScreen, WalletWithdrawScreen, WalletOTPScreen, TransactionDetailScreen });