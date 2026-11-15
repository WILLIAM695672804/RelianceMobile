// screens-reputation.jsx — Étape 7 : Badges, gamification, réputation publique

const RANK_TIERS = [
  { id: 'bronze', name: 'Bronze', min: 0, color: '#5f3add', accent: '#5f3add' },
  { id: 'silver', name: 'Argent', min: 500, color: '#5f3add', accent: '#5f3add' },
  { id: 'gold', name: 'Or', min: 1500, color: '#5f3add', accent: '#5f3add' },
  { id: 'platinum', name: 'Platine', min: 3500, color: '#5f3add', accent: '#5f3add' },
  { id: 'reliance', name: 'Reliance', min: 7500, color: '#5f3add', accent: '#5f3add' },
];

const BADGES = [
  { id: 'kyc', name: 'Vérifié KYC', rarity: 'common', icon: 'shield', color: '#5f3add', desc: 'Identité confirmée par Reliance', earned: true, when: 'Mar 2025' },
  { id: 'first', name: 'Première mission', rarity: 'common', icon: 'sparkle', color: '#5f3add', desc: '1ʳᵉ intervention complétée', earned: true, when: 'Avr 2025' },
  { id: 'streak10', name: '10 jours d\'affilée', rarity: 'rare', icon: 'flash', color: '#5f3add', desc: '10 missions consécutives ≥ 4★', earned: true, when: 'Juin 2025' },
  { id: 'speed', name: 'Éclair', rarity: 'rare', icon: 'bolt', color: '#5f3add', desc: 'Arrivée moyenne < 25 min sur 20 missions', earned: true, when: 'Sep 2025' },
  { id: 'clean', name: 'Sans tache', rarity: 'epic', icon: 'check', color: '#5f3add', desc: '50 missions, 0 litige', earned: true, when: 'Déc 2025' },
  { id: 'avant-apres', name: 'Avant/après', rarity: 'rare', icon: 'image', color: '#5f3add', desc: '10 posts avant/après publiés', earned: true, when: 'Fév 2026' },
  { id: 'mentor', name: 'Mentor', rarity: 'epic', icon: 'badge', color: '#5f3add', desc: 'Formé 3 nouveaux pros', earned: false, progress: 2, total: 3 },
  { id: 'century', name: 'Centurion', rarity: 'epic', icon: 'star', color: '#5f3add', desc: '100 missions complétées', earned: false, progress: 67, total: 100 },
  { id: 'nightowl', name: 'Veilleur', rarity: 'rare', icon: 'moon', color: '#5f3add', desc: '20 missions de nuit (22h-6h)', earned: false, progress: 14, total: 20 },
  { id: 'allstar', name: 'All-Star', rarity: 'legendary', icon: 'sparkle', color: '#5f3add', desc: 'Top 10 pros de Yaoundé sur 30 jours', earned: false, locked: true },
];

const RARITY_STYLE = (theme, rarity) => ({
  common: { ring: theme.border, glow: 'transparent', label: 'Standard' },
  rare: { ring: '#5f3add', glow: '#5f3add33', label: 'Rare' },
  epic: { ring: '#5f3add', glow: '#5f3add33', label: 'Épique' },
  legendary: { ring: '#5f3add', glow: '#5f3add66', label: 'Légendaire' },
}[rarity]);

// ── Profil public — réputation détaillée ─────────────────────────────
function ReputationScreen({ theme, onBack, onBadge }) {
  const score = 2840;
  const tier = RANK_TIERS[2]; // gold
  const next = RANK_TIERS[3]; // platinum
  const progress = ((score - tier.min) / (next.min - tier.min)) * 100;
  const earned = BADGES.filter(b => b.earned);
  const inProgress = BADGES.filter(b => !b.earned && !b.locked);
  const locked = BADGES.filter(b => b.locked);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      {/* Header */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>Réputation</div>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={16}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 24 }}>
        {/* Hero — score & rang */}
        <div style={{ padding: '12px 16px 24px' }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 22, padding: '24px 22px',
            background: `linear-gradient(140deg, ${tier.color}, ${tier.accent})`,
            color: '#fff',
          }}>
            {/* Decorative ring pattern */}
            <div style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}/>
            <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)' }}/>
            <div style={{ position: 'absolute', top: 0, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }}/>

            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, opacity: 0.85 }}>Rang actuel</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <div style={{ fontFamily: theme.fonts.display, fontSize: 38, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1 }}>{tier.name}</div>
                <div style={{ fontFamily: theme.fonts.mono, fontSize: 13, opacity: 0.85 }}>· tier 3/5</div>
              </div>

              <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontFamily: theme.fonts.display, fontSize: 56, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{score.toLocaleString('fr-FR')}</div>
                <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>pts</div>
              </div>

              {/* Progress to next tier */}
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: theme.fonts.mono, marginBottom: 6 }}>
                  <span style={{ opacity: 0.85 }}>{tier.name.toUpperCase()}</span>
                  <span style={{ opacity: 0.85 }}>→ {next.name.toUpperCase()} · {(next.min - score).toLocaleString('fr-FR')} pts</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.18)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#fff', borderRadius: 999 }}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier ladder */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>Échelle des rangs</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
            {RANK_TIERS.map((t, i) => {
              const passed = score >= t.min;
              const current = t.id === tier.id;
              return (
                <div key={t.id} style={{
                  flex: 1, padding: '10px 6px', borderRadius: 10,
                  background: current ? `${t.color}1A` : (passed ? theme.surface : 'transparent'),
                  border: `1px solid ${current ? t.color : theme.divider}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: passed || current ? 1 : 0.5,
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: passed ? t.color : 'transparent', border: passed ? 'none' : `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {passed && <Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.name}</div>
                  <div style={{ fontSize: 9, fontFamily: theme.fonts.mono, color: theme.textMuted }}>{t.min}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>Stats à vie</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { v: '67', lbl: 'missions', sub: '+12 ce mois' },
              { v: '4.93', lbl: 'note moyenne', sub: 'sur 5 · 58 avis' },
              { v: '23min', lbl: 'arrivée moy.', sub: 'top 8% Yaoundé' },
              { v: '0', lbl: 'litige', sub: '12 mois sans incident' },
            ].map(s => (
              <div key={s.lbl} style={{ padding: '14px 14px', borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}` }}>
                <div style={{ fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: theme.text, marginTop: 4, fontWeight: 600 }}>{s.lbl}</div>
                <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Earned badges */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Badges obtenus</div>
            <div style={{ fontSize: 11, fontFamily: theme.fonts.mono, color: theme.textMuted }}>{earned.length}/{BADGES.length}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {earned.map(b => <BadgeTile key={b.id} theme={theme} badge={b} onClick={() => onBadge && onBadge(b)}/>)}
          </div>
        </div>

        {/* In-progress */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>En progression</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inProgress.map(b => {
              const pct = (b.progress / b.total) * 100;
              const r = RARITY_STYLE(theme, b.rarity);
              return (
                <button key={b.id} onClick={() => onBadge && onBadge(b)} style={{ all: 'unset', cursor: 'pointer', padding: 12, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${b.color}15`, color: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.7 }}>
                    <Icon name={b.icon} size={22}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</span>
                      <span style={{ fontSize: 9, color: r.ring, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{b.desc}</div>
                    <div style={{ marginTop: 6, height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: b.color, borderRadius: 2 }}/>
                    </div>
                  </div>
                  <div style={{ fontFamily: theme.fonts.mono, fontSize: 12, fontWeight: 700, color: theme.text, flexShrink: 0 }}>{b.progress}/{b.total}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Locked */}
        {locked.length > 0 && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>Verrouillé</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {locked.map(b => (
                <div key={b.id} style={{ aspectRatio: '1/1.15', borderRadius: 14, background: theme.surface, border: `1px dashed ${theme.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, opacity: 0.55 }}>
                  <div style={{ fontSize: 22 }}>🔒</div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, textAlign: 'center' }}>{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Badge tile ───────────────────────────────────────────────────────
function BadgeTile({ theme, badge, onClick }) {
  const r = RARITY_STYLE(theme, badge.rarity);
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      aspectRatio: '1/1.15', borderRadius: 14,
      background: theme.surface, border: `1.5px solid ${r.ring}`,
      padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      boxShadow: r.glow !== 'transparent' ? `0 4px 16px ${r.glow}` : 'none',
      position: 'relative',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: `linear-gradient(135deg, ${badge.color}, ${badge.color}CC)`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={badge.icon} size={22}/>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, padding: '0 4px' }}>{badge.name}</div>
      <div style={{ fontSize: 8, color: r.ring, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{r.label}</div>
    </button>
  );
}

// ── Badge detail (modal-style screen) ────────────────────────────────
function BadgeDetailScreen({ theme, onBack }) {
  const badge = BADGES[4]; // "Sans tache" — epic
  const r = RARITY_STYLE(theme, badge.rarity);

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={18}/></button>
        <div style={{ flex: 1 }}/>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={16}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Hero medal */}
        <div style={{ padding: '20px 24px 28px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${r.ring}25, transparent 60%)`, pointerEvents: 'none' }}/>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Outer ring */}
            <div style={{
              width: 180, height: 180, borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${badge.color}, ${r.ring}, ${badge.color})`,
              padding: 4, margin: '0 auto',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: theme.bg, padding: 8,
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${badge.color}, ${badge.color}DD)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}>
                  <Icon name={badge.icon} size={70}/>
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', padding: '4px 10px', borderRadius: 999, background: r.ring, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              {r.label}
            </div>
          </div>

          <div style={{ fontFamily: theme.fonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1, marginTop: 24 }}>{badge.name}</div>
          <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 4, padding: '0 24px', textWrap: 'pretty' }}>{badge.desc}</div>
        </div>

        {/* Stats card */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ padding: 16, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
              {[
                { v: '50', lbl: 'missions' },
                { v: '0', lbl: 'litiges' },
                { v: '12 mois', lbl: 'sans incident' },
              ].map(s => (
                <div key={s.lbl}>
                  <div style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700 }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earn date + rarity stats */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
            {[
              { lbl: 'Obtenu le', val: '12 décembre 2025' },
              { lbl: 'Rareté', val: '4.2% des pros Reliance' },
              { lbl: 'Bonus de réputation', val: '+250 pts' },
              { lbl: 'Visibilité', val: 'Public · profil' },
            ].map((row, i) => (
              <div key={row.lbl} style={{ padding: '12px 14px', background: theme.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: theme.textMuted }}>{row.lbl}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share CTA */}
        <div style={{ padding: '4px 16px 24px' }}>
          <button style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none',
            background: theme.text, color: theme.bg, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
            fontFamily: theme.fonts.body,
          }}>
            <Icon name="upload" size={16}/>
            <span>Partager dans la communauté</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard — top pros du quartier ───────────────────────────────
function LeaderboardScreen({ theme, onBack }) {
  const [scope, setScope] = React.useState('quartier');
  const [period, setPeriod] = React.useState('month');

  const top = [
    { rank: 1, name: 'Aurélien Eyene', role: 'Électricien', score: 4120, change: '+2', stars: 4.96, missions: 28, accent: '#5f3add' },
    { rank: 2, name: 'Paul Mvondo', role: 'Plombier', score: 3940, change: '0', stars: 4.93, missions: 24, accent: '#5f3add', isMe: true },
    { rank: 3, name: 'Yves Kamga', role: 'Électricien', score: 3680, change: '-1', stars: 4.91, missions: 22, accent: '#5f3add' },
    { rank: 4, name: 'Sandrine Nkomo', role: 'Climatisation', score: 3420, change: '+1', stars: 4.88, missions: 19, accent: '#5f3add' },
    { rank: 5, name: 'Hervé Ngassam', role: 'Plombier', score: 3290, change: '-2', stars: 4.85, missions: 21, accent: '#5f3add' },
    { rank: 6, name: 'Linda Mballa', role: 'Électroménager', score: 2950, change: '+4', stars: 4.82, missions: 18, accent: '#5f3add' },
    { rank: 7, name: 'Junior Bekolo', role: 'Plombier', score: 2780, change: '0', stars: 4.79, missions: 16, accent: '#5f3add' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Classement</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>Top pros · Bastos · Mars 2026</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {[{ id: 'quartier', label: 'Quartier' }, { id: 'ville', label: 'Yaoundé' }, { id: 'metier', label: 'Plombiers' }].map(s => {
            const sel = scope === s.id;
            return (
              <button key={s.id} onClick={() => setScope(s.id)} style={{
                flex: 1, padding: '8px 10px', borderRadius: 10, border: `1px solid ${sel ? theme.text : theme.border}`,
                background: sel ? theme.text : 'transparent', color: sel ? theme.bg : theme.text,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: theme.fonts.body,
              }}>{s.label}</button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: theme.surface, border: `1px solid ${theme.border}` }}>
          {[{ id: 'week', label: '7j' }, { id: 'month', label: '30j' }, { id: 'all', label: 'À vie' }].map(p => {
            const sel = period === p.id;
            return (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                flex: 1, padding: '6px', borderRadius: 7, border: 'none',
                background: sel ? theme.bg : 'transparent', color: theme.text,
                fontSize: 11, fontWeight: sel ? 700 : 500, cursor: 'pointer', fontFamily: theme.fonts.mono,
              }}>{p.label}</button>
            );
          })}
        </div>
      </div>

      {/* Podium */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'center' }}>
          {[top[1], top[0], top[2]].map((p, i) => {
            const heights = [88, 116, 76];
            const medals = ['🥈', '🥇', '🥉'];
            return (
              <div key={p.rank} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Avatar name={p.name} color={p.accent} size={i === 1 ? 56 : 44}/>
                <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: theme.textMuted, fontFamily: theme.fonts.mono }}>{p.score.toLocaleString('fr-FR')}</div>
                <div style={{
                  width: '100%', height: heights[i], borderRadius: '12px 12px 0 0',
                  background: i === 1 ? `linear-gradient(180deg, #5f3add, #5f3add)` : (i === 0 ? `linear-gradient(180deg, #5f3add, #5f3add)` : `linear-gradient(180deg, #5f3add, #5f3add)`),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                }}>
                  {medals[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '0 16px 100px' }}>
          {top.slice(3).map(p => (
            <div key={p.rank} style={{
              padding: '12px 14px', borderRadius: 12, marginBottom: 6,
              background: p.isMe ? `${theme.accent}10` : theme.surface,
              border: `1px solid ${p.isMe ? theme.accent : theme.border}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 30, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 18, color: theme.textMuted, textAlign: 'center' }}>{p.rank}</div>
              <Avatar name={p.name} color={p.accent} size={36}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  {p.isMe && <Pill bg={`${theme.accent}1A`} color={theme.accent} size="sm">Vous</Pill>}
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{p.role}</span>
                  <span>·</span>
                  <span>★ {p.stars}</span>
                  <span>·</span>
                  <span>{p.missions} miss.</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: theme.fonts.mono, fontSize: 13, fontWeight: 700 }}>{p.score.toLocaleString('fr-FR')}</div>
                <div style={{ fontSize: 10, color: p.change.startsWith('+') ? '#5f3add' : (p.change.startsWith('-') ? '#5f3add' : theme.textMuted), fontFamily: theme.fonts.mono, fontWeight: 600 }}>
                  {p.change === '0' ? '—' : p.change}
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: theme.surface, border: `1px dashed ${theme.border}`, fontSize: 12, color: theme.textMuted, textAlign: 'center', textWrap: 'pretty' }}>
            Le classement est mis à jour chaque dimanche à minuit. Le top 3 mensuel reçoit un badge spécial.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReputationScreen, BadgeDetailScreen, LeaderboardScreen });
