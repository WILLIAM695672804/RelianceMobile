// screens-feedback.jsx — Notation, litige, annulation (Étape 3)

// ── Notation post-mission ──────────────────────────────────────────────
function RatingScreen({ theme, tech, onBack, onSubmit }) {
  const [stars, setStars] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [tags, setTags] = React.useState([]);
  const [comment, setComment] = React.useState('');

  const tagsByRating = {
    pos: ['Ponctuel', 'Travail soigné', 'Bon prix', 'Communication claire', 'Pro & courtois', 'Recommanderais'],
    neg: ['En retard', 'Travail bâclé', 'Trop cher', 'Mauvaise communication', 'Pas pro', 'Outils manquants'],
  };
  const isPositive = stars >= 4;
  const isNegative = stars > 0 && stars <= 2;
  const tagSet = isNegative ? tagsByRating.neg : tagsByRating.pos;

  const labels = ['', 'Très décevant', 'Insatisfait', 'Correct', 'Bien', 'Excellent'];
  const labelColors = ['', REL.colors.accents.red, REL.colors.accents.red, REL.colors.accents.amber, REL.colors.accents.green, REL.colors.accents.green];

  const toggleTag = (t) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}/>
        <button style={{ background: 'transparent', border: 'none', color: theme.textMuted, fontSize: 13, fontWeight: 500 }}>Plus tard</button>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 24px', overflow: 'auto' }}>
        {/* Tech card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
          <Avatar name={tech.name} color={theme.accent} size={56}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Mission terminée</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{tech.name}</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>{tech.craft} · 2h 15min · 28 500 XAF</div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15, textWrap: 'balance' }}>Comment s'est passée votre mission ?</h1>
        <p style={{ margin: '10px 0 28px', color: theme.textMuted, fontSize: 14, lineHeight: 1.5 }}>Votre avis aide la communauté Reliance à choisir les meilleurs techniciens.</p>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {[1,2,3,4,5].map(i => {
            const active = i <= (hover || stars);
            return (
              <button key={i}
                onClick={() => setStars(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, transform: active && stars === i ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill={active ? (isNegative ? REL.colors.accents.red : isPositive ? REL.colors.accents.green : REL.colors.accents.amber) : 'transparent'} stroke={active ? 'transparent' : theme.border} strokeWidth="1.5">
                  <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.7 7.3L12 17.8 5.6 21.7l1.7-7.3L1.6 9.5l7.5-.6z" strokeLinejoin="round"/>
                </svg>
              </button>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', height: 24, fontSize: 14, fontWeight: 600, color: stars ? labelColors[stars] : theme.textMuted, marginBottom: 24 }}>
          {labels[hover || stars] || 'Touchez pour noter'}
        </div>

        {/* Tags */}
        {stars > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>
              {isNegative ? 'Qu\'est-ce qui n\'a pas marché ?' : 'Qu\'est-ce qui était bien ?'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tagSet.map(t => {
                const sel = tags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)} style={{
                    padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    background: sel ? theme.text : theme.surface,
                    color: sel ? theme.bg : theme.text,
                    border: `1px solid ${sel ? theme.text : theme.border}`,
                    fontFamily: theme.fonts.body,
                  }}>{t}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comment */}
        {stars > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Commentaire (optionnel)</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Décrivez votre expérience…" rows={3} style={{
              width: '100%', boxSizing: 'border-box',
              background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12,
              padding: '12px 14px', fontSize: 14, color: theme.text, outline: 'none',
              fontFamily: theme.fonts.body, resize: 'vertical',
            }}/>
            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, textAlign: 'right' }}>{comment.length} / 500</div>
          </div>
        )}

        {/* Tip */}
        {isPositive && (
          <Card theme={theme} padding={14} radius={14} style={{ background: `${REL.colors.accents.green}10`, border: `1px solid ${REL.colors.accents.green}30`, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: REL.colors.accents.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkle" size={18}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Laisser un pourboire ?</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>Sympa, direct, 100% pour le tech</div>
              </div>
              <button style={{ padding: '8px 14px', borderRadius: 999, background: REL.colors.accents.green, color: '#fff', border: 'none', fontWeight: 600, fontSize: 12 }}>+ Tip</button>
            </div>
          </Card>
        )}
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface }}>
        <Button full size="lg" disabled={!stars} style={{ background: stars ? theme.accent : theme.border, color: '#fff', opacity: stars ? 1 : 0.5 }} onClick={onSubmit}>
          Envoyer la note
        </Button>
      </div>
    </div>
  );
}

// ── Modal: ouvrir un litige ────────────────────────────────────────────
function DisputeScreen({ theme, tech, onBack, onSubmit }) {
  const [reason, setReason] = React.useState(null);
  const [details, setDetails] = React.useState('');
  const [photos, setPhotos] = React.useState([1, 2]);

  const reasons = [
    { id: 'incomplete', icon: 'wrench', label: 'Travail non terminé', sub: 'Le problème persiste ou n\'est pas résolu' },
    { id: 'damage', icon: 'info', label: 'Dégâts matériels', sub: 'Casse ou détérioration durant l\'intervention' },
    { id: 'overprice', icon: 'wallet', label: 'Facturation abusive', sub: 'Montant facturé non conforme au devis' },
    { id: 'noshow', icon: 'clock', label: 'Technicien absent', sub: 'Ne s\'est pas présenté au rendez-vous' },
    { id: 'other', icon: 'info', label: 'Autre motif', sub: 'Décrivez votre situation' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Ouvrir un litige</div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 24px', overflow: 'auto' }}>
        {/* Banner */}
        <Card theme={theme} padding={14} radius={14} style={{ background: `${REL.colors.accents.red}0D`, border: `1px solid ${REL.colors.accents.red}30`, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Icon name="shield" size={18} color={REL.colors.accents.red}/>
            <div style={{ flex: 1, fontSize: 12, lineHeight: 1.5 }}>
              <b>Vos fonds sont sécurisés.</b> Tant que le litige n'est pas résolu, le paiement reste bloqué dans l'escrow Reliance. Notre équipe intervient sous 4h ouvrées.
            </div>
          </div>
        </Card>

        {/* Mission summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
          <Avatar name={tech.name} color={theme.accent} size={40}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{tech.name} · {tech.craft}</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>Mission #INT-2847 · 28 500 XAF en escrow</div>
          </div>
        </div>

        {/* Reasons */}
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Motif du litige</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {reasons.map(r => {
            const sel = reason === r.id;
            return (
              <button key={r.id} onClick={() => setReason(r.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
                <Card theme={theme} padding={14} radius={12} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  borderColor: sel ? REL.colors.accents.red : theme.border,
                  background: sel ? `${REL.colors.accents.red}08` : theme.surface,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: sel ? REL.colors.accents.red : `${theme.text}10`, color: sel ? '#fff' : theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={r.icon} size={16}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{r.sub}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? REL.colors.accents.red : theme.border}`, background: sel ? REL.colors.accents.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}/>}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Details */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Décrivez la situation</div>
          <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Soyez précis : que s'est-il passé ?" rows={4} style={{
            width: '100%', boxSizing: 'border-box',
            background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12,
            padding: '12px 14px', fontSize: 14, color: theme.text, outline: 'none',
            fontFamily: theme.fonts.body, resize: 'vertical',
          }}/>
        </div>

        {/* Photos */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Preuves photos / vidéos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {photos.map((p, i) => (
              <div key={i} style={{ aspectRatio: '1/1', borderRadius: 10, position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}66)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="image" size={20} color="#fff"/>
                <button onClick={() => setPhotos(photos.filter(x => x !== p))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Icon name="close" size={11} strokeWidth={3}/>
                </button>
              </div>
            ))}
            <button style={{ aspectRatio: '1/1', borderRadius: 10, border: `2px dashed ${theme.border}`, background: 'transparent', color: theme.textMuted, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
              <Icon name="plus" size={18}/>
              <span style={{ fontSize: 9, fontWeight: 600 }}>Ajouter</span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.5 }}>
          En soumettant, vous acceptez la médiation Reliance. Les fausses déclarations entraînent la suspension du compte.
        </div>
      </div>

      <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
        <Button size="lg" variant="ghost" dark={theme._t.dark} onClick={onBack} style={{ flex: 1 }}>Annuler</Button>
        <Button size="lg" disabled={!reason} style={{ flex: 2, background: reason ? REL.colors.accents.red : theme.border, color: '#fff', opacity: reason ? 1 : 0.5 }} onClick={onSubmit}>
          Ouvrir le litige
        </Button>
      </div>
    </div>
  );
}

// ── Annulation d'une demande ───────────────────────────────────────────
function CancelScreen({ theme, tech, onBack, onConfirm }) {
  const [reason, setReason] = React.useState(null);
  const [step, setStep] = React.useState('reason'); // reason | confirm

  const reasons = [
    { id: 'changemind', label: 'J\'ai changé d\'avis', fee: 0 },
    { id: 'found', label: 'J\'ai trouvé une autre solution', fee: 0 },
    { id: 'tech', label: 'Le technicien ne convient pas', fee: 0 },
    { id: 'late', label: 'Le technicien est en retard', fee: 0 },
    { id: 'other', label: 'Autre raison', fee: 0 },
  ];
  // Simulate fee based on time-to-arrival
  const cancelFee = 1500;
  const refund = 28500 - cancelFee;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={step === 'reason' ? onBack : () => setStep('reason')} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={step === 'reason' ? 'x' : 'chevronL'} size={18}/>
        </button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Annuler la demande</div>
        <div style={{ width: 40 }}/>
      </div>

      {step === 'reason' && (
        <>
          <div style={{ flex: 1, padding: '16px 24px 24px', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
              <Avatar name={tech.name} color={theme.accent} size={44}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{tech.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>Arrive dans ~12 min · {tech.craft}</div>
              </div>
              <Pill bg={`${REL.colors.accents.amber}1A`} color={REL.colors.accents.amber} size="sm">En route</Pill>
            </div>

            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, textWrap: 'balance' }}>Pourquoi annulez-vous ?</h1>
            <p style={{ margin: '8px 0 20px', fontSize: 13, color: theme.textMuted }}>Votre retour aide à améliorer Reliance.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reasons.map(r => {
                const sel = reason === r.id;
                return (
                  <button key={r.id} onClick={() => setReason(r.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
                    <Card theme={theme} padding={14} radius={12} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      borderColor: sel ? theme.accent : theme.border,
                      background: sel ? `${theme.accent}08` : theme.surface,
                    }}>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{r.label}</div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? theme.accent : theme.border}`, background: sel ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}/>}
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>

            {/* Fee notice */}
            <Card theme={theme} padding={14} radius={14} style={{ marginTop: 24, background: `${REL.colors.accents.amber}10`, border: `1px solid ${REL.colors.accents.amber}40` }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Icon name="clock" size={18} color={REL.colors.accents.amber}/>
                <div style={{ flex: 1, fontSize: 12, lineHeight: 1.5 }}>
                  <b>Frais d'annulation : 1 500 XAF.</b> Le technicien est déjà en route. Au-delà de 5 min après acceptation, des frais s'appliquent pour compenser son déplacement.
                </div>
              </div>
            </Card>
          </div>

          <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
            <Button size="lg" variant="ghost" dark={theme._t.dark} onClick={onBack} style={{ flex: 1 }}>Retour</Button>
            <Button size="lg" disabled={!reason} style={{ flex: 2, background: reason ? theme.text : theme.border, color: theme.bg, opacity: reason ? 1 : 0.5 }} onClick={() => setStep('confirm')}>
              Continuer
            </Button>
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, textWrap: 'balance' }}>Confirmer l'annulation ?</h1>
            <p style={{ margin: '10px 0 24px', fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>
              Cette action est définitive. Le technicien sera notifié immédiatement.
            </p>

            {/* Refund breakdown */}
            <Card theme={theme} padding={0} radius={14} style={{ marginBottom: 16 }}>
              <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${theme.divider}` }}>
                <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Détail du remboursement</div>
              </div>
              {[
                { lbl: 'Montant en escrow', amt: '28 500', muted: false },
                { lbl: 'Frais d\'annulation', amt: '− 1 500', muted: false, color: REL.colors.accents.red },
              ].map((r, i) => (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.divider}` }}>
                  <span style={{ fontSize: 13, color: theme.text }}>{r.lbl}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, fontFamily: theme.fonts.display, color: r.color || theme.text }}>{r.amt} XAF</span>
                </div>
              ))}
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${REL.colors.accents.green}0D` }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Remboursé sous 24h</span>
                <span style={{ fontSize: 18, fontWeight: 700, fontFamily: theme.fonts.display, color: REL.colors.accents.green }}>{refund.toLocaleString('fr-FR').replace(',', ' ')} XAF</span>
              </div>
            </Card>

            <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.5 }}>
              Le remboursement est effectué sur votre méthode de paiement initiale (MTN MoMo).
            </div>
          </div>

          <div style={{ padding: '14px 24px 36px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', gap: 8 }}>
            <Button size="lg" variant="ghost" dark={theme._t.dark} onClick={() => setStep('reason')} style={{ flex: 1 }}>Retour</Button>
            <Button size="lg" style={{ flex: 2, background: REL.colors.accents.red, color: '#fff' }} onClick={onConfirm}>
              Confirmer l'annulation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { RatingScreen, DisputeScreen, CancelScreen });
