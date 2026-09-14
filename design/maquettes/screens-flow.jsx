// screens-flow.jsx — tech profile, intervention timeline, chat, wallet

function TechProfileScreen({ theme, onBack, onRequest }) {
  const [tab, setTab] = React.useState('about');
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <Avatar name="Armand B." size={84} color={theme.accent} />
        <h2 style={{ fontFamily: theme.fonts.display, fontSize: 20, margin: '14px 0 2px' }}>Armand B.</h2>
        <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 8 }}>Plombier certifié · Yaoundé</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="star" size={15} color="#F5A623" /><b style={{ fontSize: 14 }}>4.8</b></div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>312 interventions</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="shield" size={15} color={theme.accent} /><span style={{ fontSize: 13 }}>Vérifié</span></div>
        </div>
        <Button accent={theme.accent} full size="lg" onClick={onRequest}>Demander une intervention</Button>
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, padding: '0 20px' }}>
        {[{ k: 'about', l: 'À propos' }, { k: 'posts', l: 'Publications' }, { k: 'reviews', l: 'Avis' }].map((t) =>
        <div key={t.k} onClick={() => setTab(t.k)} style={{
          padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          color: tab === t.k ? theme.accent : theme.textMuted,
          borderBottom: tab === t.k ? `2px solid ${theme.accent}` : '2px solid transparent'
        }}>{t.l}</div>
        )}
      </div>

      <div style={{ padding: 20 }}>
        {tab === 'about' &&
        <div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: theme.text }}>Plombier professionnel avec 9 ans d'expérience. Spécialiste des fuites, installations sanitaires et chauffe-eau.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {['Plomberie', 'Sanitaire', 'Chauffe-eau', 'Urgences 24/7'].map((s) => <Pill key={s} bg={theme.surfaceMuted}>{s}</Pill>)}
            </div>
          </div>
        }
        {tab === 'posts' &&
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            <ImagePlaceholder label="chantier" height={110} /><ImagePlaceholder label="avant/après" height={110} />
          </div>
        }
        {tab === 'reviews' &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2].map((i) =>
          <div key={i} style={{ display: 'flex', gap: 10 }}>
                <Avatar name="Client X" size={34} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Client satisfait</div>
                  <div style={{ fontSize: 13, color: theme.textMuted }}>Travail rapide et propre, je recommande.</div>
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </div>);

}

function InterventionScreen({ theme, onBack, onChat, phase = 2 }) {
  const phases = ['Diagnostic', 'Devis accepté', 'Intervention en cours', 'Contrôle qualité', 'Terminée'];
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Intervention #4821" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ margin: 20, padding: 16, borderRadius: 16, background: theme.accent + '14', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="shield" size={22} color={theme.accent} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>25 000 FCFA en séquestre</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>Libéré uniquement après votre validation</div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {phases.map((p, i) =>
        <div key={p} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: i <= phase ? theme.accent : theme.surfaceMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {i <= phase ? <Icon name="check" size={13} color="#fff" /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.textMuted }} />}
              </div>
              {i < phases.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 30, background: i < phase ? theme.accent : theme.border }} />}
            </div>
            <div style={{ paddingBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: i <= phase ? theme.text : theme.textMuted }}>{p}</div>
              {i === phase && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>En cours actuellement</div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
        <Button variant="soft" full icon={<Icon name="chat" size={17} />} onClick={onChat}>Discuter</Button>
        <Button variant="ghost" full icon={<Icon name="phone" size={17} />}>Appeler</Button>
      </div>
    </div>);

}

function Bubble({ mine, text, time, theme }) {
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: 16,
        borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4,
        background: mine ? theme.accent : theme.surfaceMuted, color: mine ? '#fff' : theme.text
      }}>
        <div style={{ fontSize: 14 }}>{text}</div>
        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{time}</div>
      </div>
    </div>);

}

function ChatScreen({ theme, onBack }) {
  const msgs = [
  { mine: false, text: 'Bonjour, je suis en route, j’arrive dans 15 minutes.', time: '9:41' },
  { mine: true, text: 'Parfait, merci !', time: '9:42' },
  { mine: false, text: 'Pouvez-vous m’envoyer une photo du robinet ?', time: '9:44' }];

  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Armand B." dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
        {msgs.map((m, i) => <Bubble key={i} {...m} theme={theme} />)}
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '10px 16px 24px', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ flex: 1, padding: '11px 14px', borderRadius: 20, background: theme.surfaceMuted, fontSize: 14, color: theme.textMuted }}>Écrire un message…</div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="send" size={16} color="#fff" />
        </div>
      </div>
    </div>);

}

function WalletScreen({ theme, onBack, onTopUp, onWithdraw, onTx }) {
  const txs = [
  { id: 1, label: 'Paiement intervention #4821', amount: -25000, date: 'Aujourd’hui' },
  { id: 2, label: 'Recharge MoMo', amount: 50000, date: 'Hier' },
  { id: 3, label: 'Remboursement litige', amount: 8000, date: '12 sept.' }];

  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Portefeuille" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ margin: 20, padding: 24, borderRadius: 22, background: `linear-gradient(135deg, ${theme.accent}, #0F2C63)`, color: '#fff' }}>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Solde disponible</div>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 30, fontWeight: 800, margin: '6px 0 18px' }}>33 000 FCFA</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="dark" dark icon={<Icon name="plus" size={16} />} onClick={onTopUp}>Recharger</Button>
          <Button variant="ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={onWithdraw}>Retirer</Button>
        </div>
      </div>
      <Section title="Historique">
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {txs.map((t) =>
          <div key={t.id} onClick={() => onTx && onTx(t.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${theme.divider}`, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>{t.date}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: t.amount > 0 ? '#0EA5E9' : theme.text }}>
                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>);

}

Object.assign(window, { TechProfileScreen, InterventionScreen, ChatScreen, WalletScreen });