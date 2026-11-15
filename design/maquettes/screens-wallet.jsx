// screens-wallet.jsx — Wallet flows (Étape 4)

// ── Recharger le wallet ────────────────────────────────────────────────
function WalletTopUpScreen({ theme, onBack, onNext }) {
  const [amount, setAmount] = React.useState(10000);
  const [provider, setProvider] = React.useState('mtn');
  const presets = [5000, 10000, 25000, 50000, 100000];
  const fmt = (n) => n.toLocaleString('fr-FR').replace(',', ' ');
  const fee = Math.round(amount * 0.01);
  const total = amount + fee;

  const providers = [
    { id: 'mtn', label: 'MTN MoMo', bg: '#FFCC00', color: '#000', sub: '237 6 99 ** ** 56' },
    { id: 'orange', label: 'Orange Money', bg: '#FF6600', color: '#fff', sub: '237 6 95 ** ** 12' },
    { id: 'card', label: 'Carte Visa', bg: '#1A1F71', color: '#fff', sub: 'Visa **** 4823' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Recharger</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 24px', overflow: 'auto' }}>
        {/* Big amount */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Montant à créditer</div>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
            <input
              value={fmt(amount)}
              onChange={e => setAmount(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
              style={{
                fontFamily: theme.fonts.display, fontSize: 56, fontWeight: 700,
                background: 'transparent', border: 'none', color: theme.text, outline: 'none',
                textAlign: 'center', width: `${Math.max(fmt(amount).length, 4)}ch`, padding: 0,
                letterSpacing: -2,
              }}/>
            <span style={{ fontSize: 18, color: theme.textMuted, fontWeight: 600 }}>XAF</span>
          </div>
        </div>

        {/* Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmount(p)} style={{
              padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: amount === p ? theme.text : theme.surface,
              color: amount === p ? theme.bg : theme.text,
              border: `1px solid ${amount === p ? theme.text : theme.border}`,
              cursor: 'pointer', fontFamily: theme.fonts.body,
            }}>{fmt(p)}</button>
          ))}
        </div>

        {/* Providers */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Source de financement</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {providers.map(p => {
            const sel = provider === p.id;
            return (
              <button key={p.id} onClick={() => setProvider(p.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
                <Card theme={theme} padding={12} radius={12} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  borderColor: sel ? theme.accent : theme.border,
                  background: sel ? `${theme.accent}06` : theme.surface,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: p.bg, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, fontFamily: theme.fonts.display }}>
                    {p.id === 'mtn' ? 'MTN' : p.id === 'orange' ? 'OM' : 'VISA'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fonts.mono }}>{p.sub}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? theme.accent : theme.border}`, background: sel ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}/>}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Breakdown */}
        <Card theme={theme} padding={0} radius={14}>
          <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.divider}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Montant</span>
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: theme.fonts.mono }}>{fmt(amount)} XAF</span>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.divider}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Frais opérateur (1 %)</span>
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: theme.fonts.mono }}>{fmt(fee)} XAF</span>
          </div>
          <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${theme.accent}0D` }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Total débité</span>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fonts.display, color: theme.accent }}>{fmt(total)} XAF</span>
          </div>
        </Card>
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <Button full size="lg" disabled={!amount} style={{ background: amount ? theme.accent : theme.border, color: '#fff', opacity: amount ? 1 : 0.5 }} onClick={onNext}>
          Recharger {fmt(amount)} XAF
        </Button>
      </div>
    </div>
  );
}

// ── Retirer du wallet ──────────────────────────────────────────────────
function WalletWithdrawScreen({ theme, onBack, onNext }) {
  const balance = 145300;
  const [amount, setAmount] = React.useState(50000);
  const fmt = (n) => n.toLocaleString('fr-FR').replace(',', ' ');
  const fee = Math.max(200, Math.round(amount * 0.005));
  const net = amount - fee;
  const overbalance = amount > balance;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Retirer</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 24px', overflow: 'auto' }}>
        {/* Balance card */}
        <div style={{
          padding: '16px 18px', borderRadius: 16,
          background: theme._t.dark ? '#0e0e12' : theme.text,
          color: theme._t.dark ? theme.text : theme.bg,
          marginBottom: 32,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: `${theme.accent}66` }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Solde disponible</div>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1, marginTop: 4 }}>{fmt(balance)} <span style={{ fontSize: 14, opacity: 0.6 }}>XAF</span></div>
          </div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Montant à retirer</div>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
            <input
              value={fmt(amount)}
              onChange={e => setAmount(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
              style={{
                fontFamily: theme.fonts.display, fontSize: 48, fontWeight: 700,
                background: 'transparent', border: 'none',
                color: overbalance ? REL.colors.accents.red : theme.text,
                outline: 'none', textAlign: 'center', width: `${Math.max(fmt(amount).length, 4)}ch`, padding: 0, letterSpacing: -1.5,
              }}/>
            <span style={{ fontSize: 16, color: theme.textMuted, fontWeight: 600 }}>XAF</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: overbalance ? REL.colors.accents.red : theme.textMuted }}>
            {overbalance ? 'Montant supérieur au solde disponible' : `Disponible : ${fmt(balance)} XAF`}
          </div>
          <button onClick={() => setAmount(balance)} style={{ marginTop: 8, padding: '6px 12px', borderRadius: 999, background: 'transparent', border: `1px solid ${theme.border}`, fontSize: 11, fontWeight: 600, color: theme.text, cursor: 'pointer' }}>
            Tout retirer
          </button>
        </div>

        {/* Slider */}
        <div style={{ padding: '0 4px', marginBottom: 28 }}>
          <input type="range" min="0" max={balance} step="1000" value={amount} onChange={e => setAmount(parseInt(e.target.value))} style={{ width: '100%', accentColor: theme.accent }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.textMuted, marginTop: 4 }}>
            <span>0</span><span>{fmt(balance)}</span>
          </div>
        </div>

        {/* Destination */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Destination</div>
        <Card theme={theme} padding={12} radius={12} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFCC00', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>MTN</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>MTN MoMo</div>
            <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: theme.fonts.mono }}>237 6 99 ** ** 56</div>
          </div>
          <Icon name="chevronR" size={16} color={theme.textMuted}/>
        </Card>

        {/* Breakdown */}
        <Card theme={theme} padding={0} radius={14}>
          <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.divider}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Montant retiré</span>
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: theme.fonts.mono }}>{fmt(amount)} XAF</span>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.divider}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Frais (0,5 %, min 200)</span>
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: theme.fonts.mono, color: REL.colors.accents.red }}>− {fmt(fee)} XAF</span>
          </div>
          <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${REL.colors.accents.green}0D` }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Vous recevez</span>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fonts.display, color: REL.colors.accents.green }}>{fmt(net)} XAF</span>
          </div>
        </Card>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 8 }}>Crédit instantané sur votre compte MTN MoMo · 24/7</div>
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <Button full size="lg" disabled={!amount || overbalance} style={{ background: !amount || overbalance ? theme.border : theme.text, color: theme.bg, opacity: !amount || overbalance ? 0.5 : 1 }} onClick={onNext}>
          Confirmer le retrait
        </Button>
      </div>
    </div>
  );
}

// ── OTP code ───────────────────────────────────────────────────────────
function WalletOTPScreen({ theme, onBack, onSuccess }) {
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = React.useState(58);
  const inputs = React.useRef([]);

  React.useEffect(() => {
    if (seconds > 0) {
      const t = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [seconds]);

  const handleChange = (i, v) => {
    const c = v.replace(/\D/g, '').slice(0, 1);
    const next = [...code];
    next[i] = c;
    setCode(next);
    if (c && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(x => x) && next.join('').length === 6) {
      setTimeout(onSuccess, 500);
    }
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Vérification</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ flex: 1, padding: '40px 32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: `${theme.accent}1A`, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Icon name="phone" size={28}/>
        </div>

        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>Code envoyé par SMS</h1>
        <p style={{ margin: '12px 0 32px', fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>
          Entrez le code à 6 chiffres envoyé au<br/>
          <b style={{ color: theme.text, fontFamily: theme.fonts.mono }}>+237 6 99 ** ** 56</b>
        </p>

        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 28 }}>
          {code.map((c, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              value={c}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: 46, height: 56, borderRadius: 12, textAlign: 'center',
                fontSize: 24, fontFamily: theme.fonts.display, fontWeight: 700,
                background: theme.surface,
                border: `2px solid ${c ? theme.accent : theme.border}`,
                color: theme.text, outline: 'none',
                transition: 'all 0.15s',
              }}/>
          ))}
        </div>

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: 13, color: theme.textMuted }}>
          {seconds > 0 ? (
            <>Renvoyer le code dans <b style={{ color: theme.text, fontFamily: theme.fonts.mono }}>0:{seconds.toString().padStart(2, '0')}</b></>
          ) : (
            <button onClick={() => setSeconds(58)} style={{ background: 'transparent', border: 'none', color: theme.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Renvoyer le code</button>
          )}
        </div>

        {/* Trust */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}` }}>
          <Icon name="shield" size={18} color={REL.colors.accents.green}/>
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4 }}>
            Ne partagez jamais ce code. Reliance ne vous le demandera jamais par téléphone.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Détail transaction ─────────────────────────────────────────────────
function TransactionDetailScreen({ theme, onBack }) {
  const tx = {
    id: 'TX-2847-9372',
    date: '23 mars 2026 · 14:32',
    type: 'Paiement intervention',
    amount: -28500,
    status: 'completed',
    counterparty: 'Paul Mvondo',
    counterRole: 'Plombier',
    method: 'Wallet Reliance',
    reference: 'INT-2847',
    notes: 'Réparation fuite chauffe-eau · 2h 15min',
  };
  const fmt = (n) => Math.abs(n).toLocaleString('fr-FR').replace(',', ' ');
  const isOutgoing = tx.amount < 0;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Transaction</div>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={18}/></button>
      </div>

      <div style={{ flex: 1, padding: '8px 24px 24px', overflow: 'auto' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ display: 'inline-flex', padding: 10, borderRadius: 16, background: `${theme.accent}1A`, color: theme.accent, marginBottom: 16 }}>
            <Icon name="wrench" size={28}/>
          </div>
          <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 4 }}>{tx.type}</div>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 44, fontWeight: 700, letterSpacing: -1.5, color: isOutgoing ? theme.text : REL.colors.accents.green }}>
            {isOutgoing ? '−' : '+'} {fmt(tx.amount)} <span style={{ fontSize: 18, color: theme.textMuted }}>XAF</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} icon={<Icon name="check" size={11} strokeWidth={3}/>}>
              Complété
            </Pill>
          </div>
        </div>

        {/* Detail rows */}
        <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 14 }}>
          {[
            { lbl: 'Date', val: tx.date },
            { lbl: 'Bénéficiaire', val: tx.counterparty, sub: tx.counterRole, avatar: true },
            { lbl: 'Méthode', val: tx.method },
            { lbl: 'Référence', val: tx.reference, mono: true, copy: true },
            { lbl: 'ID transaction', val: tx.id, mono: true, copy: true },
          ].map((row, i, arr) => (
            <div key={i} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{row.lbl}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {row.avatar && <Avatar name={row.val} color={theme.accent} size={28}/>}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: row.mono ? theme.fonts.mono : theme.fonts.body }}>{row.val}</div>
                    {row.sub && <div style={{ fontSize: 11, color: theme.textMuted }}>{row.sub}</div>}
                  </div>
                </div>
              </div>
              {row.copy && <button style={{ width: 32, height: 32, borderRadius: 8, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="file" size={14}/>
              </button>}
            </div>
          ))}
        </Card>

        {/* Breakdown */}
        <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 14 }}>
          <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${theme.divider}` }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Décomposition</div>
          </div>
          {[
            { lbl: 'Diagnostic', amt: '5 000' },
            { lbl: 'Main d\'œuvre (2h 15)', amt: '18 000' },
            { lbl: 'Pièces (joints + flexible)', amt: '4 500' },
            { lbl: 'Commission Reliance (5 %)', amt: '1 000', muted: true },
          ].map((r, i, arr) => (
            <div key={i} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
              <span style={{ fontSize: 13, color: r.muted ? theme.textMuted : theme.text }}>{r.lbl}</span>
              <span style={{ fontSize: 13, fontWeight: 500, fontFamily: theme.fonts.mono, color: r.muted ? theme.textMuted : theme.text }}>{r.amt} XAF</span>
            </div>
          ))}
        </Card>

        {/* Notes */}
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>Note</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{tx.notes}</div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="md" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }}>Télécharger reçu</Button>
          <Button size="md" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }}>Signaler</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WalletTopUpScreen, WalletWithdrawScreen, WalletOTPScreen, TransactionDetailScreen });
