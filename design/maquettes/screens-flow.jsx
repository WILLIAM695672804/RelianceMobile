// screens-flow.jsx — Tech profile, intervention tracking, chat, wallet

function TechProfileScreen({ theme, tech, onBack, onBook }) {
  const [tab, setTab] = React.useState('about');
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${tech.color}, ${tech.color}dd)` }}/>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: `radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '14px 14px' }}/>
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <CustomStatusBar dark={true}/>
          <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon name="chevronL" size={18}/></button>
            <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon name="bookmark" size={18}/></button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', marginTop: -54, position: 'relative', zIndex: 2, paddingBottom: 100 }}>
        <div style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 96, height: 96, borderRadius: 24, background: '#fff', padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <Avatar name={tech.name} color={tech.color} size={88}/>
            </div>
            <div style={{ flex: 1, paddingBottom: 6 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {tech.verified && <Pill bg={`${REL.colors.accents.green}1A`} color={REL.colors.accents.green} size="sm" icon={<Icon name="shield" size={10}/>}>KYC</Pill>}
                <Pill bg="rgba(255,255,255,0.85)" color={theme.text} size="sm" icon={<Icon name="badge" size={10}/>}>Top 10</Pill>
              </div>
            </div>
          </div>
          <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{tech.name}</h1>
          <div style={{ marginTop: 4, fontSize: 14, color: theme.textMuted }}>{tech.skill} · Yaoundé</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
            {[
              { v: tech.rating, lbl: 'Note moy.', icon: 'star', color: REL.colors.accents.amber },
              { v: tech.jobs, lbl: 'Missions', icon: 'check', color: REL.colors.accents.green },
              { v: '98%', lbl: 'Réussite', icon: 'shield', color: theme.accent },
            ].map((s, i) => (
              <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 12, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Icon name={s.icon} size={13} color={s.color}/>
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: theme.fonts.display }}>{s.v}</span>
                </div>
                <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 22, padding: 4, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12 }}>
            {['about','posts','reviews'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 10px', borderRadius: 9, background: tab === t ? theme.text : 'transparent', color: tab === t ? theme.bg : theme.textMuted, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {t === 'about' ? 'À propos' : t === 'posts' ? 'Réalisations' : 'Avis'}
              </button>
            ))}
          </div>

          {tab === 'about' && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: theme.textMuted, textWrap: 'pretty' }}>
                Plombier certifié avec 12 ans d'expérience. Spécialisé en réparation de fuites, installation de chauffe-eau et débouchage. Disponible 7j/7 dans Yaoundé.
              </p>
              <div style={{ marginTop: 18, marginBottom: 8, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Compétences</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Fuites', 'Chauffe-eau', 'Débouchage', 'Robinetterie', 'WC', 'Sanitaire'].map(s => <Pill key={s} bg={theme.surface} border={`1px solid ${theme.border}`}>{s}</Pill>)}
              </div>

              <div style={{ marginTop: 18, marginBottom: 8, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Zones d'intervention</div>
              <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', height: 140 }}>
                <MapPlaceholder theme={theme} compact techs={[]} you={{ x: 50, y: 50 }}/>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 120, height: 120, borderRadius: '50%', background: `${tech.color}40`, border: `2px dashed ${tech.color}` }}/>
                </div>
              </div>
            </div>
          )}

          {tab === 'posts' && (
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  <ImagePlaceholder label={`mission ${i}`} height={120} radius={0}/>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Chauffe-eau · Tsinga</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: theme.textMuted }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="heart" size={11}/>34</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="chat" size={11}/>8</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Marie K.', rating: 5, txt: 'Intervention rapide et propre. Paul a expliqué le problème en détail. Je recommande.', when: 'il y a 2 jours' },
                { name: 'Joseph T.', rating: 5, txt: 'Top pro. Réparation effectuée en 45 min, prix correct.', when: 'la semaine dernière' },
                { name: 'Aïcha N.', rating: 4, txt: 'Bon travail mais légère attente sur place.', when: 'il y a 2 semaines' },
              ].map((r, i) => (
                <Card key={i} theme={theme} padding={14} radius={14}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={r.name} color="#888" size={32}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: theme.textMuted }}>{r.when}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 1 }}>
                      {Array.from({ length: 5 }).map((_, j) => <Icon key={j} name="star" size={11} color={j < r.rating ? REL.colors.accents.amber : theme.border}/>)}
                    </div>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{r.txt}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 36px', background: theme.surface, borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{ width: 52, height: 52, borderRadius: 14, background: theme.bg, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chat" size={20}/></button>
        <Button full size="lg" style={{ background: theme.accent, color: theme.onPrimary, flex: 1 }} onClick={onBook}>Réserver — {tech.price.toLocaleString('fr')} XAF</Button>
      </div>
    </div>
  );
}

// ── Intervention tracking ──────────────────────────────────────────────
function InterventionScreen({ theme, tech, onBack, onChat }) {
  const phases = [
    { id: 1, label: 'Acceptée', sub: 'Paul a accepté à 14h22', done: true },
    { id: 2, label: 'En route', sub: 'Arrivée prévue dans 8 min', active: true },
    { id: 3, label: 'Diagnostic', sub: 'Évaluation du problème' },
    { id: 4, label: 'Intervention', sub: 'Réparation' },
    { id: 5, label: 'Terminé', sub: 'Validation + paiement' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <MapPlaceholder theme={theme} techs={[{ ...tech, x: 30, y: 30 }]} you={{ x: 70, y: 70 }}/>
        <div style={{ position: 'absolute', inset: 0, color: theme._t.dark ? '#fff' : '#000', zIndex: 5 }}>
          <CustomStatusBar dark={theme._t.dark}/>
          <div style={{ padding: '8px 16px' }}>
            <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chevronL" size={18}/></button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, marginTop: -28, background: theme.bg, borderRadius: '28px 28px 0 0', position: 'relative', zIndex: 5, padding: '20px 0 100px', overflow: 'auto' }}>
        <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={tech.name} color={tech.color} size={52}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{tech.name}</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>{tech.skill} · Réf. #M-2847</div>
          </div>
          <button onClick={onChat} style={{ width: 44, height: 44, borderRadius: 14, background: theme.accent, color: theme.onPrimary, border: 'none' }}><Icon name="chat" size={18}/></button>
          <button style={{ width: 44, height: 44, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text }}><Icon name="phone" size={18}/></button>
        </div>

        {/* ETA banner */}
        <div style={{ margin: '0 20px 16px', padding: 16, borderRadius: 16, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: theme.fonts.display }}>8</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>Arrivée estimée</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: theme.fonts.display }}>Dans 8 minutes</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Paul est à 1.2 km · trafic fluide</div>
          </div>
        </div>

        {/* Timeline */}
        <Section title="Suivi de l'intervention">
          <div style={{ padding: '0 24px' }}>
            {phases.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 14, paddingBottom: i === phases.length - 1 ? 0 : 18, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: p.done ? theme.accent : p.active ? theme.surface : theme.surface,
                    border: `2px solid ${p.done || p.active ? theme.accent : theme.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: p.done ? '#fff' : theme.accent,
                    boxShadow: p.active ? `0 0 0 6px ${theme.accent}33` : 'none',
                    position: 'relative', zIndex: 1,
                  }}>
                    {p.done ? <Icon name="check" size={14} strokeWidth={3}/> : <span style={{ fontSize: 11, fontWeight: 700 }}>{p.id}</span>}
                  </div>
                  {i < phases.length - 1 && <div style={{ width: 2, flex: 1, marginTop: 4, background: p.done ? theme.accent : theme.border }}/>}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: p.done || p.active ? theme.text : theme.textMuted }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Paiement sécurisé · Escrow">
          <div style={{ padding: '0 20px' }}>
            <Card theme={theme} padding={16} radius={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Icon name="shield" size={18} color={REL.colors.accents.green}/>
                <span style={{ fontSize: 13, fontWeight: 600 }}>12 500 XAF gelés en escrow</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: theme.border, overflow: 'hidden' }}>
                <div style={{ width: '40%', height: '100%', background: REL.colors.accents.green, borderRadius: 3 }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: theme.textMuted }}>
                <span>Diagnostic 5 000</span>
                <span>+ Réparation estimée 7 500</span>
              </div>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Chat ─────────────────────────────────────────────────────────────────
function ChatScreen({ theme, tech, onBack }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.border}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><Icon name="chevronL" size={18}/></button>
        <Avatar name={tech.name} color={tech.color} size={40}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{tech.name}</div>
          <div style={{ fontSize: 11, color: REL.colors.accents.green, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: REL.colors.accents.green, borderRadius: '50%' }}/>
            En ligne · Mission #M-2847
          </div>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={18}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px' }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: theme.textMuted, marginBottom: 16 }}>Aujourd'hui · 14h22</div>

        <Bubble theme={theme} from="them" name={tech.name}>Bonjour Yves, j'ai bien reçu votre demande. Je suis en route, j'arrive dans 10 minutes.</Bubble>
        <Bubble theme={theme} from="me">Parfait merci ! L'eau est coupée, ça peut attendre.</Bubble>
        <Bubble theme={theme} from="them" name={tech.name}>Pouvez-vous m'envoyer une photo du siphon stp ?</Bubble>
        <Bubble theme={theme} from="me">
          <ImagePlaceholder label="photo siphon" height={120} radius={10} tone={theme._t.dark ? 'dark' : 'neutral'}/>
        </Bubble>
        <Bubble theme={theme} from="them" name={tech.name}>Reçu. C'est un siphon standard, j'ai la pièce. Ça devrait prendre 30 min sur place.</Bubble>

        {/* System message — devis */}
        <div style={{ margin: '16px auto', padding: 14, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="file" size={14} color={theme.accent}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.accent, textTransform: 'uppercase', letterSpacing: 1 }}>Devis envoyé</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Remplacement siphon cuisine</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
            <span style={{ color: theme.textMuted }}>Total</span>
            <span style={{ fontWeight: 700, fontFamily: theme.fonts.display }}>12 500 XAF</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ flex: 1, padding: 8, borderRadius: 10, background: 'transparent', border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12, fontWeight: 600 }}>Refuser</button>
            <button style={{ flex: 1, padding: 8, borderRadius: 10, background: theme.accent, border: 'none', color: theme.onPrimary, fontSize: 12, fontWeight: 600 }}>Accepter</button>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding: '10px 14px 30px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ width: 38, height: 38, borderRadius: 12, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={18}/></button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 42, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14 }}>
          <input placeholder="Écrire un message…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 14 }}/>
          <Icon name="image" size={18} color={theme.textMuted}/>
        </div>
        <button style={{ width: 42, height: 42, borderRadius: 12, background: theme.accent, color: theme.onPrimary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={18}/></button>
      </div>
    </div>
  );
}

function Bubble({ theme, from, name, children }) {
  const me = from === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: 16,
        background: me ? theme.accent : theme.surface,
        color: me ? '#fff' : theme.text,
        border: me ? 'none' : `1px solid ${theme.border}`,
        borderBottomRightRadius: me ? 4 : 16, borderBottomLeftRadius: me ? 16 : 4,
        fontSize: 14, lineHeight: 1.45,
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Wallet ─────────────────────────────────────────────────────────────
function WalletScreen({ theme }) {
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100%', paddingBottom: 100 }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '12px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.7 }}>Portefeuille</h1>
        <button style={{ width: 40, height: 40, borderRadius: 12, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="settings" size={18}/></button>
      </div>

      <div style={{ padding: '8px 20px 16px' }}>
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', padding: 22, background: `linear-gradient(135deg, #2b2a36 0%, #17161f 100%)`, color: '#fff' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: theme.accent, opacity: 0.5 }}/>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '12px 12px' }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.5 }}>Solde disponible</div>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 38, fontWeight: 700, letterSpacing: -1.2, marginTop: 4 }}>
              48 750 <span style={{ fontSize: 16, opacity: 0.6 }}>XAF</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              {['XAF','EUR','USD'].map((c, i) => (
                <span key={c} style={{ padding: '4px 10px', borderRadius: 999, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.15)', color: i === 0 ? '#2b2a36' : '#fff', fontSize: 11, fontWeight: 600 }}>{c}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={{ flex: 1, padding: 12, borderRadius: 12, background: '#fff', color: '#2b2a36', border: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="plus" size={16}/>Recharger</button>
              <button style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="send" size={16}/>Envoyer</button>
            </div>
          </div>
        </div>
      </div>

      <Section title="Fonds en escrow">
        <div style={{ padding: '0 20px' }}>
          <Card theme={theme} padding={16} radius={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${REL.colors.accents.green}1A`, color: REL.colors.accents.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={18}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Mission Paul Mvondo</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>Sera libéré à validation</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.display }}>12 500</div>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: REL.colors.accents.green }}/>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Moyens de paiement">
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { name: 'MTN Mobile Money', sub: '+237 6 99 ** ** 12', icon: 'phone', color: REL.colors.accents.amber, default: true },
            { name: 'Orange Money', sub: '+237 6 55 ** ** 88', icon: 'phone', color: '#FF7900' },
            { name: 'Visa · 4521', sub: 'Exp 09/27', icon: 'wallet', color: REL.colors.accents.blue },
          ].map((p, i) => (
            <Card key={i} theme={theme} padding={14} radius={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${p.color}1A`, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={p.icon} size={18}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{p.sub}</div>
              </div>
              {p.default && <Pill bg={`${theme.accent}1A`} color={theme.accent} size="sm">Par défaut</Pill>}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Transactions récentes">
        <div style={{ padding: '0 20px' }}>
          <Card theme={theme} padding={0} radius={16}>
            {[
              { lbl: 'Recharge MoMo', when: '24 avr', amount: '+25 000', positive: true },
              { lbl: 'Paul Mvondo · Plomberie', when: '22 avr', amount: '-12 500' },
              { lbl: 'Bonus parrainage', when: '20 avr', amount: '+2 000', positive: true },
              { lbl: 'Aïcha Nkoa · Diagnostic', when: '15 avr', amount: '-5 000' },
            ].map((tx, i, arr) => (
              <div key={i} style={{ padding: 14, display: 'flex', alignItems: 'center', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: tx.positive ? `${REL.colors.accents.green}1A` : `${REL.colors.accents.red}1A`, color: tx.positive ? REL.colors.accents.green : REL.colors.accents.red, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Icon name={tx.positive ? 'arrowUp' : 'arrowR'} size={14} strokeWidth={2.5}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.lbl}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{tx.when}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: theme.fonts.display, color: tx.positive ? REL.colors.accents.green : theme.text }}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </Section>
    </div>
  );
}

Object.assign(window, { TechProfileScreen, InterventionScreen, ChatScreen, WalletScreen });
