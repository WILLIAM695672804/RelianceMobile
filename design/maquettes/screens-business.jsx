// screens-business.jsx — Étape 1: Cycle métier cœur
// Diagnostic → Devis → Facture → Validation + libération escrow
// All screens use shared design tokens from design-system.jsx

// ── 1. Rapport de diagnostic (côté tech, lecture côté client) ─────────
function DiagnosticReportScreen({ theme, tech, mode = 'client', onBack, onAccept, onReject }) {
  const isWriting = mode === 'tech-edit';
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.border}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Mission #M-2847</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.fonts.display, letterSpacing: -0.3 }}>{isWriting ? 'Rédiger diagnostic' : 'Rapport de diagnostic'}</div>
        </div>
        <Pill bg={`${REL.colors.accents.amber}1A`} color={REL.colors.accents.amber} icon={<Icon name="clock" size={11}/>}>Phase 2/4</Pill>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>
        {/* Tech card */}
        <Card theme={theme} padding={14} radius={16} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={tech.name} color={tech.color} size={44}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{tech.name}</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>Diagnostic réalisé · Bastos · 14h32</div>
          </div>
          <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} size="sm" icon={<Icon name="check" size={10}/>}>Validé</Pill>
        </Card>

        {/* Constat */}
        <ReportSection theme={theme} icon="search" label="Constat sur place">
          {isWriting ? (
            <textarea defaultValue="Fuite identifiée au niveau du joint du siphon. Joint vieilli, écrou desserré. Évier en bon état. Pas de dégât apparent au mobilier sous l'évier."
              style={textareaStyle(theme)}/>
          ) : (
            <p style={pStyle(theme)}>Fuite identifiée au niveau du joint du siphon. Joint vieilli, écrou desserré. Évier en bon état. Pas de dégât apparent au mobilier sous l'évier.</p>
          )}
        </ReportSection>

        {/* Photos */}
        <ReportSection theme={theme} icon="camera" label="Photos du diagnostic">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <ImagePlaceholder label="siphon" height={90} radius={10} tone={theme._t.dark ? 'dark' : 'neutral'}/>
            <ImagePlaceholder label="joint" height={90} radius={10} tone={theme._t.dark ? 'dark' : 'neutral'}/>
            <ImagePlaceholder label="sous-évier" height={90} radius={10} tone={theme._t.dark ? 'dark' : 'neutral'}/>
          </div>
        </ReportSection>

        {/* Préconisations */}
        <ReportSection theme={theme} icon="wrench" label="Préconisations">
          <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13, lineHeight: 1.6, color: theme.textMuted }}>
            <li>Remplacement du joint torique du siphon (réf. 32mm)</li>
            <li>Resserrage écrou + test étanchéité 10 min</li>
            <li>Conseil : surveiller dans 6 mois</li>
          </ul>
        </ReportSection>

        {/* Pièces & main d'œuvre */}
        <ReportSection theme={theme} icon="file" label="Pièces & main d'œuvre estimées">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <ReportRow theme={theme} lbl="Joint torique 32mm" qty="x1" amt="500"/>
            <ReportRow theme={theme} lbl="Main d'œuvre (45 min)" qty="" amt="6 000"/>
            <ReportRow theme={theme} lbl="Déplacement" qty="forfait" amt="1 000"/>
          </div>
        </ReportSection>

        <Card theme={theme} padding={14} radius={14} style={{ marginTop: 14, background: theme._t.dark ? '#1b1b21' : '#ffffff', border: `1px solid ${theme.accent}33` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Estimation totale</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: theme.fonts.display, letterSpacing: -0.5, marginTop: 2 }}>7 500 <span style={{ fontSize: 12, color: theme.textMuted }}>XAF</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: theme.textMuted }}>Diagnostic</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>5 000 XAF (déjà payé)</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div style={{ padding: '14px 20px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        {isWriting ? (
          <Button full size="lg" style={{ background: theme.accent, color: theme.onPrimary }} onClick={onAccept} iconRight={<Icon name="arrowR" size={18}/>}>Envoyer au client</Button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="lg" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }} onClick={onReject}>Refuser</Button>
            <Button size="lg" style={{ flex: 2, background: theme.accent, color: theme.onPrimary }} onClick={onAccept} iconRight={<Icon name="arrowR" size={18}/>}>Demander un devis</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportSection({ theme, icon, label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon name={icon} size={14} color={theme.accent}/>
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}
function ReportRow({ theme, lbl, qty, amt }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10 }}>
      <div style={{ flex: 1, fontSize: 13 }}>{lbl}</div>
      {qty && <div style={{ fontSize: 11, color: theme.textMuted, marginRight: 12 }}>{qty}</div>}
      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: theme.fonts.display }}>{amt} <span style={{ fontSize: 10, color: theme.textMuted }}>XAF</span></div>
    </div>
  );
}
const pStyle = theme => ({ margin: 0, fontSize: 13, lineHeight: 1.55, color: theme.textMuted, textWrap: 'pretty' });
const textareaStyle = theme => ({
  width: '100%', minHeight: 100, background: theme.surface, border: `1px solid ${theme.border}`,
  borderRadius: 12, padding: 12, fontSize: 13, color: theme.text, fontFamily: theme.fonts.body, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
});

// ── 2. Devis formel (lignes, conditions, signature) ───────────────────
function QuoteScreen({ theme, tech, onBack, onAccept, onReject }) {
  const [agree, setAgree] = React.useState(false);
  const lines = [
    { lbl: 'Joint torique 32mm', qty: 1, unit: 500, sub: 'Pièce détachée' },
    { lbl: "Main d'œuvre", qty: 1, unit: 6000, sub: '45 min · forfait' },
    { lbl: 'Déplacement', qty: 1, unit: 1000, sub: 'Bastos < 5km' },
  ];
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.border}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Devis #DV-2847</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.fonts.display }}>Devis formel</div>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={16}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 120px' }}>
        {/* Validity banner */}
        <div style={{ padding: 12, borderRadius: 12, background: `${REL.colors.accents.amber}1A`, color: REL.colors.accents.amber, marginBottom: 16, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="clock" size={14}/>
          <span>Valable 48h · expire le 24 avril à 14h32</span>
        </div>

        {/* From / To */}
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Émis par</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={tech.name} color={tech.color} size={28}/>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{tech.name}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>Plombier indépendant</div>
                </div>
              </div>
            </div>
            <div style={{ width: 1, background: theme.divider }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Pour</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Yves Kamga</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>Bastos · Yaoundé</div>
            </div>
          </div>
        </Card>

        {/* Lines */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Détail</div>
        <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 14 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ padding: 14, borderBottom: i === lines.length - 1 ? 'none' : `1px solid ${theme.divider}`, display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.lbl}</div>
                <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{l.sub}</div>
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, marginRight: 14 }}>×{l.qty}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: theme.fonts.display, minWidth: 70, textAlign: 'right' }}>{l.unit.toLocaleString('fr')}</div>
            </div>
          ))}
        </Card>

        {/* Totals */}
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 14 }}>
          {[
            { lbl: 'Sous-total', val: subtotal },
            { lbl: 'Frais Reliance (5%)', val: fee, sub: true },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: r.sub ? 12 : 13, color: r.sub ? theme.textMuted : theme.text }}>
              <span>{r.lbl}</span>
              <span style={{ fontFamily: theme.fonts.display, fontWeight: r.sub ? 500 : 600 }}>{r.val.toLocaleString('fr')} XAF</span>
            </div>
          ))}
          <div style={{ height: 1, background: theme.divider, margin: '8px 0' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Total TTC</span>
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: theme.fonts.display, letterSpacing: -0.5, color: theme.accent }}>{total.toLocaleString('fr')} <span style={{ fontSize: 12, color: theme.textMuted }}>XAF</span></span>
          </div>
        </Card>

        {/* Conditions */}
        <Card theme={theme} padding={14} radius={14} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Conditions</div>
          <div style={{ fontSize: 12, lineHeight: 1.55, color: theme.textMuted }}>
            • Fonds bloqués en escrow Reliance jusqu'à validation<br/>
            • Garantie pièces et main d'œuvre 30 jours<br/>
            • Annulation libre &gt; 2h avant intervention<br/>
            • Litige : médiation Reliance sous 48h
          </div>
        </Card>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }} onClick={() => setAgree(!agree)}>
          <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${agree ? theme.accent : theme.border}`, background: agree ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {agree && <Icon name="check" size={13} color="#fff" strokeWidth={3}/>}
          </span>
          J'accepte les conditions et la signature électronique.
        </label>
      </div>

      <div style={{ padding: '14px 20px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
        <Button size="lg" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }} onClick={onReject}>Refuser</Button>
        <Button size="lg" style={{ flex: 2, background: agree ? theme.accent : theme.border, color: '#fff', opacity: agree ? 1 : 0.6 }} onClick={agree ? onAccept : null} icon={<Icon name="shield" size={16}/>}>
          Signer & bloquer escrow
        </Button>
      </div>
    </div>
  );
}

// ── 3. Validation client (post-travaux) ───────────────────────────────
function ValidationScreen({ theme, tech, onBack, onValidate, onDispute }) {
  const [checks, setChecks] = React.useState({ done: true, clean: true, working: true });
  const allOk = Object.values(checks).every(Boolean);
  const toggle = (k) => setChecks({ ...checks, [k]: !checks[k] });

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.border}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Phase 4/4</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.fonts.display }}>Valider les travaux</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 120px' }}>
        <Card theme={theme} padding={16} radius={18} style={{ marginBottom: 16, background: `linear-gradient(135deg, ${REL.colors.accents.green}, ${REL.colors.accents.emerald})`, color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={28} strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1.2 }}>Fin d'intervention</div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: theme.fonts.display }}>{tech.name} a terminé</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>14h47 · durée 38 min</div>
            </div>
          </div>
        </Card>

        {/* Avant / Après */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Avant / Après</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div>
            <ImagePlaceholder label="avant" height={130} radius={12} tone={theme._t.dark ? 'dark' : 'red'}/>
            <div style={{ fontSize: 10, color: theme.textMuted, textAlign: 'center', marginTop: 4 }}>Avant intervention</div>
          </div>
          <div>
            <ImagePlaceholder label="après" height={130} radius={12} tone="blue"/>
            <div style={{ fontSize: 10, color: theme.textMuted, textAlign: 'center', marginTop: 4 }}>Après intervention</div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Vérifications</div>
        <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 16 }}>
          {[
            { id: 'done', lbl: 'Travaux conformes au devis', sub: 'Joint remplacé, écrou serré' },
            { id: 'clean', lbl: 'Espace propre & rangé', sub: 'Sous-évier nettoyé' },
            { id: 'working', lbl: 'Test étanchéité validé', sub: '10 min sans fuite' },
          ].map((c, i, arr) => (
            <div key={c.id} onClick={() => toggle(c.id)} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}`, cursor: 'pointer' }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, border: `1.5px solid ${checks[c.id] ? REL.colors.accents.green : theme.border}`, background: checks[c.id] ? REL.colors.accents.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {checks[c.id] && <Icon name="check" size={15} color="#fff" strokeWidth={3}/>}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.lbl}</div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Signature */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Signature</div>
        <div style={{ height: 100, background: theme.surface, border: `1.5px dashed ${theme.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, fontSize: 12 }}>
          <Icon name="edit" size={18}/>&nbsp;Signe ici pour valider
        </div>

        <Card theme={theme} padding={14} radius={14} style={{ marginTop: 16, background: theme._t.dark ? '#1b1b21' : '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="shield" size={18} color={REL.colors.accents.green}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>12 500 XAF seront libérés</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>vers le wallet de {tech.name} dès validation</div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '14px 20px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
        <Button size="lg" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }} onClick={onDispute}>Contester</Button>
        <Button size="lg" style={{ flex: 2, background: allOk ? REL.colors.accents.green : theme.border, color: '#fff', opacity: allOk ? 1 : 0.6 }} onClick={allOk ? onValidate : null}>
          Valider & libérer
        </Button>
      </div>
    </div>
  );
}

// ── 4. Confirmation libération escrow ──────────────────────────────────
function EscrowReleaseScreen({ theme, tech, onDone, onRate, onInvoice }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      {/* Confetti shapes */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%`,
            width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3,
            borderRadius: i % 2 ? '50%' : 2,
            background: [REL.colors.accents.red, REL.colors.accents.blue, REL.colors.accents.amber, REL.colors.accents.green][i % 4],
            opacity: 0.3, transform: `rotate(${i * 30}deg)`,
          }}/>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: `linear-gradient(135deg, ${REL.colors.accents.green}, ${REL.colors.accents.emerald})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 24, boxShadow: `0 20px 50px ${REL.colors.accents.green}55` }}>
          <Icon name="check" size={56} strokeWidth={3}/>
        </div>
        <div style={{ fontSize: 11, color: theme.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 700 }}>Mission terminée</div>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>Fonds libérés !</h1>
        <p style={{ marginTop: 12, fontSize: 14, color: theme.textMuted, maxWidth: 280, lineHeight: 1.5 }}>
          12 500 XAF ont été versés à <b style={{ color: theme.text }}>{tech.name}</b>. La mission est clôturée.
        </p>

        <Card theme={theme} padding={16} radius={18} style={{ marginTop: 28, width: '100%', maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={tech.name} color={tech.color} size={44}/>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: theme.textMuted }}>Mission #M-2847</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Fuite siphon · 38 min</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: theme.fonts.display, color: REL.colors.accents.green }}>+12 500</div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '14px 20px 36px', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
        <Button full size="lg" style={{ background: theme.accent, color: theme.onPrimary }} onClick={onRate} icon={<Icon name="star" size={18}/>}>Noter le technicien</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="md" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }} onClick={onInvoice} icon={<Icon name="file" size={16}/>}>Facture</Button>
          <Button size="md" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }} onClick={onDone}>Accueil</Button>
        </div>
      </div>
    </div>
  );
}

// ── 5. Facture (PDF-style) ─────────────────────────────────────────────
function InvoiceScreen({ theme, tech, onBack, onDownload }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.border}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Facture</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: theme.fonts.display }}>FAC-2026-0847</div>
        </div>
        <button onClick={onDownload} style={{ width: 40, height: 40, borderRadius: 12, background: theme.accent, color: theme.onPrimary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={16}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: theme._t.dark ? '#0e0e12' : '#f0f0f3' }}>
        {/* Sheet of paper */}
        <div style={{ background: theme._t.dark ? '#16161b' : '#fff', borderRadius: 12, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', minHeight: 600 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${theme.text}`, paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1 }}>RELIANCE</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 4 }}>Plateforme de mise en relation</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, background: REL.colors.accents.green, color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Payée</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 6 }}>22 avril 2026</div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>De</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{tech.name}</div>
              <div style={{ fontSize: 10, color: theme.textMuted, lineHeight: 1.5, marginTop: 2 }}>Plombier indép.<br/>Bastos · Yaoundé<br/>NIU: P127100123456S</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Pour</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Yves Kamga</div>
              <div style={{ fontSize: 10, color: theme.textMuted, lineHeight: 1.5, marginTop: 2 }}>Particulier<br/>Bastos · Yaoundé<br/>+237 6 77 ** ** 12</div>
            </div>
          </div>

          {/* Table */}
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'flex', padding: '8px 10px', background: theme._t.dark ? '#1b1b21' : '#ffffff', fontSize: 9, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              <span style={{ flex: 2 }}>Désignation</span>
              <span style={{ width: 30, textAlign: 'right' }}>Qté</span>
              <span style={{ width: 60, textAlign: 'right' }}>P.U.</span>
              <span style={{ width: 60, textAlign: 'right' }}>Total</span>
            </div>
            {[
              ['Joint torique 32mm', 1, 500, 500],
              ["Main d'œuvre (45 min)", 1, 6000, 6000],
              ['Déplacement', 1, 1000, 1000],
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', padding: '10px', fontSize: 11, borderTop: `1px solid ${theme.divider}` }}>
                <span style={{ flex: 2 }}>{r[0]}</span>
                <span style={{ width: 30, textAlign: 'right' }}>{r[1]}</span>
                <span style={{ width: 60, textAlign: 'right', fontFamily: theme.fonts.display }}>{r[2].toLocaleString('fr')}</span>
                <span style={{ width: 60, textAlign: 'right', fontFamily: theme.fonts.display, fontWeight: 600 }}>{r[3].toLocaleString('fr')}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 200 }}>
              {[['Sous-total', '7 500'], ['Frais Reliance (5%)', '375']].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: theme.textMuted }}>
                  <span>{l}</span><span style={{ fontFamily: theme.fonts.display }}>{v} XAF</span>
                </div>
              ))}
              <div style={{ height: 1, background: theme.text, margin: '6px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>TOTAL TTC</span>
                <span style={{ fontFamily: theme.fonts.display, fontSize: 18, fontWeight: 700 }}>7 875 XAF</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 30, paddingTop: 14, borderTop: `1px solid ${theme.divider}`, fontSize: 9, color: theme.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
            Paiement réglé via Reliance Escrow · Réf: TX-2847-9482<br/>
            Reliance SARL · Yaoundé, Cameroun · contact@reliance.cm
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
        <Button size="lg" variant="ghost" dark={theme._t.dark} style={{ flex: 1 }} icon={<Icon name="send" size={16}/>}>Envoyer</Button>
        <Button size="lg" style={{ flex: 1, background: theme.text, color: theme.bg }} onClick={onDownload} icon={<Icon name="upload" size={16}/>}>Télécharger PDF</Button>
      </div>
    </div>
  );
}

Object.assign(window, { DiagnosticReportScreen, QuoteScreen, ValidationScreen, EscrowReleaseScreen, InvoiceScreen });
