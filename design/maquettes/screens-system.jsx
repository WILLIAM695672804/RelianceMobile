// screens-system.jsx — Étape 9 : Notifications, recherche/filtres, empty/error states, toasts

const NOTIFICATIONS = [
  {
    id: 'n1', kind: 'mission', icon: 'bolt', color: '#5f3add', when: '2 min',
    title: 'Paul Mvondo arrive',
    body: '12 min — il est en route depuis Bastos. Suivez-le sur la carte.',
    cta: 'Voir sur la carte', unread: true, route: 'intervention',
  },
  {
    id: 'n2', kind: 'chat', icon: 'chat', color: '#5f3add', when: '5 min',
    title: 'Nouveau message · Paul Mvondo',
    body: '"Je suis en bas de l\'immeuble, quel étage ?"',
    cta: 'Répondre', unread: true, route: 'chat',
  },
  {
    id: 'n3', kind: 'payment', icon: 'wallet', color: '#5f3add', when: '1h',
    title: 'Paiement validé',
    body: '18 000 XAF débloqués vers Paul Mvondo. Commission Reliance · 1 800 XAF.',
    cta: 'Voir le reçu', unread: true,
  },
  {
    id: 'n4', kind: 'badge', icon: 'sparkle', color: '#5f3add', when: '1j',
    title: '🏆 Vous avez débloqué un badge',
    body: '"Client fidèle" — 5 missions Reliance complétées.',
    cta: 'Voir mes badges',
  },
  {
    id: 'n5', kind: 'review', icon: 'star', color: '#5f3add', when: '2j',
    title: 'Notez Yves Kamga',
    body: 'Votre mission de mardi est terminée. 30 secondes pour aider la communauté.',
    cta: 'Noter maintenant',
  },
  {
    id: 'n6', kind: 'system', icon: 'shield', color: '#5f3add', when: '3j',
    title: 'Nouvelle politique de garantie',
    body: 'Toutes les interventions sont maintenant couvertes 30 jours. Détails →',
  },
  {
    id: 'n7', kind: 'promo', icon: 'pin', color: '#5f3add', when: '1sem',
    title: 'Reliance arrive à Douala',
    body: 'Notre service est désormais disponible à Bonapriso, Akwa et Bonanjo.',
  },
];

// ── Centre de notifications ──────────────────────────────────────────
function NotificationsScreen({ theme, onBack }) {
  const [tab, setTab] = React.useState('all');
  const tabs = [
    { id: 'all', label: 'Tout', count: 7 },
    { id: 'mission', label: 'Missions', count: 3 },
    { id: 'message', label: 'Messages', count: 1 },
    { id: 'finance', label: 'Finance', count: 2 },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Notifications</div>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: theme.accent, fontSize: 13, fontWeight: 600, padding: '0 4px' }}>Tout lire</button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '4px 16px 0', display: 'flex', gap: 4, overflowX: 'auto', borderBottom: `1px solid ${theme.divider}` }}>
        {tabs.map(t => {
          const sel = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 12px', background: 'transparent', border: 'none',
              fontSize: 13, fontWeight: sel ? 700 : 500,
              color: sel ? theme.text : theme.textMuted,
              borderBottom: `2px solid ${sel ? theme.accent : 'transparent'}`,
              marginBottom: -1, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: theme.fonts.body,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {t.label}
              {sel && t.count > 0 && (
                <span style={{ padding: '1px 6px', borderRadius: 999, background: theme.accent, color: theme.onPrimary, fontSize: 10, fontFamily: theme.fonts.mono, fontWeight: 700 }}>{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Today section */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '14px 16px 6px', fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Aujourd'hui</div>
        {NOTIFICATIONS.slice(0, 3).map(n => <NotifRow key={n.id} theme={theme} notif={n}/>)}

        <div style={{ padding: '14px 16px 6px', fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Cette semaine</div>
        {NOTIFICATIONS.slice(3).map(n => <NotifRow key={n.id} theme={theme} notif={n}/>)}

        <div style={{ height: 60 }}/>
      </div>
    </div>
  );
}

function NotifRow({ theme, notif }) {
  return (
    <button style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
      <div style={{
        padding: '12px 16px',
        background: notif.unread ? `${notif.color}06` : 'transparent',
        borderBottom: `1px solid ${theme.divider}`,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        position: 'relative',
      }}>
        {notif.unread && <div style={{ position: 'absolute', left: 6, top: 22, width: 6, height: 6, borderRadius: '50%', background: notif.color }}/>}
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${notif.color}1A`, color: notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={notif.icon} size={18}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: notif.unread ? 700 : 600, lineHeight: 1.3, flex: 1, minWidth: 0 }}>{notif.title}</span>
            <span style={{ fontSize: 10, color: theme.textMuted, whiteSpace: 'nowrap', fontFamily: theme.fonts.mono, fontWeight: 500 }}>{notif.when}</span>
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4, marginBottom: notif.cta ? 6 : 0, textWrap: 'pretty' }}>{notif.body}</div>
          {notif.cta && (
            <span style={{ fontSize: 12, color: notif.color, fontWeight: 600 }}>{notif.cta} →</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Recherche universelle + filtres ──────────────────────────────────
function SearchScreen({ theme, onBack }) {
  const [query, setQuery] = React.useState('Paul');
  const [activeFilters, setActiveFilters] = React.useState(['Plomberie']);

  const recents = ['Plombier urgence', 'Aurélien Eyene', 'Caméra surveillance', 'Tarif disjoncteur'];
  const trending = [
    { q: '#chauffeau', count: '47 posts' },
    { q: 'Plomberie Bastos', count: '12 pros' },
    { q: 'Climatisation', count: '8 pros' },
    { q: '#avantapres', count: '124 posts' },
  ];

  const results = [
    { kind: 'tech', name: 'Paul Mvondo', sub: 'Plombier · Bastos · 4.9★', accent: '#5f3add' },
    { kind: 'tech', name: 'Paul Edzoa', sub: 'Électricien · Tsinga · 4.7★', accent: '#5f3add' },
    { kind: 'post', name: 'Avant/après chauffe-eau', sub: 'par Paul Mvondo · 47 ❤', accent: '#5f3add' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      {/* Search bar */}
      <div style={{ padding: '8px 12px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={20}/></button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}` }}>
          <Icon name="search" size={16} color={theme.textMuted}/>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher pros, posts, services…"
            autoFocus
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: theme.text }}/>
          {query && (
            <button onClick={() => setQuery('')} style={{ width: 22, height: 22, borderRadius: '50%', background: theme.border, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.bg, cursor: 'pointer' }}>
              <Icon name="close" size={11} strokeWidth={3}/>
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 12px 10px', display: 'flex', gap: 6, overflowX: 'auto', borderBottom: `1px solid ${theme.divider}` }}>
        {['Tous', 'Pros', 'Posts', 'Services', 'Quartier', 'Tarif'].map(f => {
          const sel = activeFilters.includes(f) || f === 'Tous';
          const isAll = f === 'Tous';
          return (
            <button key={f} onClick={() => {
              if (isAll) setActiveFilters([]);
              else setActiveFilters(activeFilters.includes(f) ? activeFilters.filter(x => x !== f) : [...activeFilters, f]);
            }} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: sel ? theme.text : theme.surface,
              color: sel ? theme.bg : theme.text,
              border: `1px solid ${sel ? theme.text : theme.border}`,
              whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
              fontFamily: theme.fonts.body,
            }}>{f}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {query ? (
          <>
            {/* Active filter chips bar */}
            {activeFilters.length > 0 && (
              <div style={{ padding: '12px 16px 6px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, alignSelf: 'center' }}>Filtres ·</span>
                {activeFilters.map(f => (
                  <button key={f} onClick={() => setActiveFilters(activeFilters.filter(x => x !== f))} style={{
                    padding: '4px 8px 4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: `${theme.accent}1A`, color: theme.accent, border: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                  }}>
                    <span>{f}</span>
                    <Icon name="close" size={11} strokeWidth={2.5}/>
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: '12px 16px 6px', fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
              {results.length} résultats pour "{query}"
            </div>

            {results.map((r, i) => (
              <button key={i} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.divider}` }}>
                  <Avatar name={r.name} color={r.accent} size={40}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {r.name.split(new RegExp(`(${query})`, 'i')).map((part, j) =>
                        part.toLowerCase() === query.toLowerCase()
                          ? <mark key={j} style={{ background: `${theme.accent}33`, color: theme.text, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
                          : <span key={j}>{part}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{r.sub}</div>
                  </div>
                  <Pill bg={`${r.accent}1A`} color={r.accent} size="sm">{r.kind === 'tech' ? 'Pro' : 'Post'}</Pill>
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
            {/* Recents */}
            <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Récent</span>
              <button style={{ background: 'transparent', border: 'none', fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>Effacer</button>
            </div>
            {recents.map((r, i) => (
              <button key={i} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon name="clock" size={15} color={theme.textMuted}/>
                  <span style={{ flex: 1, fontSize: 13, color: theme.text }}>{r}</span>
                  <Icon name="chevronR" size={14} color={theme.textMuted}/>
                </div>
              </button>
            ))}

            <div style={{ padding: '20px 16px 8px', fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Tendances dans votre quartier</div>
            <div style={{ padding: '0 16px 16px' }}>
              {trending.map((t, i) => (
                <Card key={i} theme={theme} padding={12} radius={12} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${theme.accent}1A`, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="bolt" size={14}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.q}</div>
                    <div style={{ fontSize: 11, color: theme.textMuted }}>{t.count}</div>
                  </div>
                  <Icon name="chevronR" size={14} color={theme.textMuted}/>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Empty / Error states ─────────────────────────────────────────────
function EmptyStatesScreen({ theme, onBack }) {
  const [variant, setVariant] = React.useState('empty-history');

  const variants = [
    { id: 'empty-history', label: 'Aucun historique' },
    { id: 'empty-search', label: 'Recherche vide' },
    { id: 'empty-feed', label: 'Feed vide' },
    { id: 'no-internet', label: 'Hors ligne' },
    { id: 'error-server', label: 'Erreur serveur' },
    { id: 'rate-limit', label: 'Trop de tentatives' },
  ];

  const states = {
    'empty-history': {
      title: 'Pas encore de mission',
      body: 'Votre historique apparaîtra ici dès votre première intervention. La première fois est gratuite (diagnostic à 0 XAF) si vous parrainez un voisin.',
      icon: 'home', color: theme.accent,
      cta: 'Découvrir les pros près de moi',
      art: 'box',
    },
    'empty-search': {
      title: 'Aucun résultat',
      body: 'Rien trouvé pour "soudure tig". Essayez avec un mot-clé plus simple ou parcourez les catégories.',
      icon: 'search', color: theme.textMuted,
      cta: 'Voir toutes les catégories',
      art: 'search',
    },
    'empty-feed': {
      title: 'Le feed est calme',
      body: 'Personne n\'a posté ces dernières heures dans votre quartier. Soyez la première personne à partager une astuce.',
      icon: 'sparkle', color: '#5f3add',
      cta: 'Créer un post',
      art: 'sparkle',
    },
    'no-internet': {
      title: 'Pas de connexion',
      body: 'Reliance ne peut pas joindre nos serveurs. Vérifiez vos données mobiles ou votre Wi-Fi. Vos messages en attente seront envoyés dès le retour.',
      icon: 'close', color: REL.colors.accents.amber,
      cta: 'Réessayer',
      tone: 'warn',
      art: 'offline',
    },
    'error-server': {
      title: 'Quelque chose a cassé',
      body: 'Erreur serveur (503). Notre équipe a été notifiée. Réessayez dans une minute.',
      icon: 'close', color: REL.colors.accents.red,
      cta: 'Réessayer',
      secondary: 'Contacter le support',
      tone: 'error',
      art: 'error',
    },
    'rate-limit': {
      title: 'Trop de demandes',
      body: 'Vous avez ouvert 5 tickets en 1h. Patientez 8 min avant de relancer une recherche.',
      icon: 'clock', color: REL.colors.accents.amber,
      cta: 'OK, je patiente',
      tone: 'warn',
      art: 'limit',
    },
  };

  const v = states[variant];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>États vides & erreurs</div>
        <div style={{ width: 40 }}/>
      </div>

      {/* Variant picker */}
      <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6, overflowX: 'auto', borderBottom: `1px solid ${theme.divider}` }}>
        {variants.map(opt => {
          const sel = variant === opt.id;
          return (
            <button key={opt.id} onClick={() => setVariant(opt.id)} style={{
              padding: '7px 11px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: sel ? theme.text : theme.surface,
              color: sel ? theme.bg : theme.text,
              border: `1px solid ${sel ? theme.text : theme.border}`,
              whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
            }}>{opt.label}</button>
          );
        })}
      </div>

      {/* The empty state itself */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 32px 60px', textAlign: 'center' }}>
        {/* Illustration */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: v.tone === 'error' ? `${REL.colors.accents.red}10` : v.tone === 'warn' ? `${REL.colors.accents.amber}10` : `${theme.accent}10`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28, position: 'relative', overflow: 'hidden',
        }}>
          {/* Pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `radial-gradient(${v.color}22 1px, transparent 1px)`, backgroundSize: '12px 12px' }}/>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: theme.bg, border: `2px solid ${v.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <Icon name={v.icon} size={36} color={v.color}/>
          </div>
        </div>

        <div style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 10, textWrap: 'balance' }}>{v.title}</div>
        <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.5, maxWidth: 280, textWrap: 'pretty', marginBottom: 28 }}>{v.body}</div>

        <Button size="lg" style={{ background: v.tone === 'error' ? REL.colors.accents.red : theme.accent, color: '#fff', minWidth: 220 }}>{v.cta}</Button>
        {v.secondary && (
          <button style={{ marginTop: 10, background: 'transparent', border: 'none', color: theme.textMuted, fontSize: 13, fontWeight: 500, padding: 8, cursor: 'pointer' }}>{v.secondary}</button>
        )}
      </div>
    </div>
  );
}

// ── Toasts gallery ───────────────────────────────────────────────────
function ToastsScreen({ theme, onBack }) {
  const [items, setItems] = React.useState([
    { id: 1, kind: 'success', icon: 'check', title: 'Devis accepté', body: '18 000 XAF placés en escrow.', when: 'maintenant' },
    { id: 2, kind: 'warn', icon: 'info', title: 'Connexion lente', body: 'Le chat peut être en différé.', when: '5s' },
    { id: 3, kind: 'error', icon: 'close', title: 'Paiement échoué', body: 'MTN MoMo a refusé · solde insuffisant.', when: '12s' },
    { id: 4, kind: 'info', icon: 'bolt', title: 'Nouvelle mission', body: 'Mme Owono · Mvog-Ada · 25 000 XAF', when: '20s', cta: 'Voir' },
    { id: 5, kind: 'badge', icon: 'sparkle', title: 'Badge débloqué', body: '"Première mission" — bravo 🎉', when: '1min' },
  ]);

  const colorFor = (k) => ({
    success: REL.colors.accents.green,
    warn: REL.colors.accents.amber,
    error: REL.colors.accents.red,
    info: REL.colors.accents.blue,
    badge: '#5f3add',
  }[k]);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Toasts & feedback</div>
        <button onClick={() => setItems([...items])} style={{ background: 'transparent', border: 'none', color: theme.accent, fontSize: 13, fontWeight: 600 }}>Rejouer</button>
      </div>

      <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>Système de feedback</div>
        <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5, marginBottom: 24 }}>5 niveaux de toast — chaque événement de l'app a un canal et un ton précis. Glisser pour fermer, tapoter pour agir.</p>

        {/* Toast stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(t => {
            const c = colorFor(t.kind);
            return (
              <div key={t.id} style={{
                background: theme.surface, border: `1px solid ${theme.border}`,
                borderLeft: `4px solid ${c}`,
                borderRadius: 14, padding: 12,
                display: 'flex', alignItems: 'flex-start', gap: 12,
                boxShadow: theme._t.dark ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.06)',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${c}1A`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={t.icon} size={16} strokeWidth={2.2}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</span>
                    <span style={{ fontSize: 10, color: theme.textMuted, fontFamily: theme.fonts.mono, marginLeft: 'auto' }}>{t.when}</span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{t.body}</div>
                  {t.cta && (
                    <button style={{ marginTop: 6, padding: '4px 10px', borderRadius: 999, background: c, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{t.cta}</button>
                  )}
                </div>
                <button onClick={() => setItems(items.filter(x => x.id !== t.id))} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer', padding: 0 }}>
                  <Icon name="close" size={14}/>
                </button>
              </div>
            );
          })}
        </div>

        {/* Inline banners */}
        <div style={{ marginTop: 32, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>Bannières inline</div>
        <Card theme={theme} padding={12} radius={12} style={{ background: `${REL.colors.accents.green}10`, border: `1px solid ${REL.colors.accents.green}40`, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="shield" size={16} color={REL.colors.accents.green}/>
          <div style={{ flex: 1, fontSize: 12, lineHeight: 1.4 }}>Mission sous garantie 30 jours · jusqu'au 14 avril 2026</div>
        </Card>
        <Card theme={theme} padding={12} radius={12} style={{ background: `${REL.colors.accents.amber}10`, border: `1px solid ${REL.colors.accents.amber}40`, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="info" size={16} color={REL.colors.accents.amber}/>
          <div style={{ flex: 1, fontSize: 12, lineHeight: 1.4 }}>Votre KYC expire dans 14 jours · renouvelez maintenant</div>
          <span style={{ fontSize: 11, color: REL.colors.accents.amber, fontWeight: 700 }}>→</span>
        </Card>
        <Card theme={theme} padding={12} radius={12} style={{ background: `${REL.colors.accents.red}10`, border: `1px solid ${REL.colors.accents.red}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="close" size={16} color={REL.colors.accents.red}/>
          <div style={{ flex: 1, fontSize: 12, lineHeight: 1.4 }}>Compte gelé · 3 retraits MoMo refusés sur 24h</div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { NotificationsScreen, SearchScreen, EmptyStatesScreen, ToastsScreen });
