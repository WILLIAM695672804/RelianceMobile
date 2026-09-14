// screens-reputation.jsx — rank tiers, badges, leaderboard

const RANK_TIERS = [
{ key: 'bronze', label: 'Bronze', color: '#A0663A', min: 0 },
{ key: 'silver', label: 'Argent', color: '#9AA5B1', min: 50 },
{ key: 'gold', label: 'Or', color: '#D6A93B', min: 150 },
{ key: 'platinum', label: 'Platine', color: '#5B8FC7', min: 300 },
{ key: 'diamond', label: 'Diamant', color: '#3B82D6', min: 600 }];


const BADGES = [
{ id: 'b1', icon: 'flash', label: 'Rapide', rarity: 'commun', earned: true },
{ id: 'b2', icon: 'star', label: 'Top noté', rarity: 'rare', earned: true },
{ id: 'b3', icon: 'shield', label: 'Vérifié KYC', rarity: 'commun', earned: true },
{ id: 'b4', icon: 'heart', label: '100 clients satisfaits', rarity: 'rare', earned: true },
{ id: 'b5', icon: 'badge', label: 'Expert plomberie', rarity: 'épique', earned: false },
{ id: 'b6', icon: 'clock', label: 'Ponctuel', rarity: 'commun', earned: true },
{ id: 'b7', icon: 'sparkle', label: 'Perfectionniste', rarity: 'épique', earned: false },
{ id: 'b8', icon: 'wrench', label: '500 interventions', rarity: 'légendaire', earned: false },
{ id: 'b9', icon: 'bolt', label: 'Réponse éclair', rarity: 'rare', earned: true },
{ id: 'b10', icon: 'grid', label: 'Multi-compétences', rarity: 'épique', earned: false }];


const RARITY_STYLE = {
  'commun': { color: '#8A8F98', bg: '#8A8F9818' },
  'rare': { color: '#1F5BC4', bg: '#1F5BC418' },
  'épique': { color: '#8B5CF6', bg: '#8B5CF618' },
  'légendaire': { color: '#D6A93B', bg: '#D6A93B18' }
};

function BadgeTile({ badge, theme, onOpen }) {
  const rs = RARITY_STYLE[badge.rarity];
  return (
    <div onClick={() => onOpen && onOpen(badge.id)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 14,
      borderRadius: 16, background: badge.earned ? theme.surface : theme.surfaceMuted,
      border: `1px solid ${theme.border}`, opacity: badge.earned ? 1 : 0.45, cursor: 'pointer'
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: rs.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={badge.icon} size={22} color={rs.color} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{badge.label}</div>
    </div>);

}

function ReputationScreen({ theme, onBack, onBadge, onLeaderboard }) {
  const tier = RANK_TIERS[2];
  return (
    <div style={{ height: '100%', background: theme.bg, overflowY: 'auto' }}>
      <IOSNavBar title="Réputation" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ margin: 20, padding: 22, borderRadius: 20, background: `linear-gradient(135deg, ${tier.color}, #0F2C63)`, color: '#fff', textAlign: 'center' }}>
        <Icon name="badge" size={36} color="#fff" />
        <div style={{ fontFamily: theme.fonts.display, fontSize: 20, fontWeight: 800, margin: '10px 0 4px' }}>Niveau {tier.label}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>187 points de réputation</div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)', marginTop: 14, overflow: 'hidden' }}>
          <div style={{ width: '62%', height: '100%', background: '#fff' }} />
        </div>
      </div>

      <Section title="Badges" action={<span onClick={onLeaderboard} style={{ fontSize: 13, color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Classement</span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '0 20px' }}>
          {BADGES.map((b) => <BadgeTile key={b.id} badge={b} theme={theme} onOpen={onBadge} />)}
        </div>
      </Section>
    </div>);

}

function BadgeDetailScreen({ theme, onBack, badgeId = 'b2' }) {
  const badge = BADGES.find((b) => b.id === badgeId) || BADGES[0];
  const rs = RARITY_STYLE[badge.rarity];
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 30 }}>
        <div style={{ width: 96, height: 96, borderRadius: 26, background: rs.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name={badge.icon} size={44} color={rs.color} />
        </div>
        <h2 style={{ fontFamily: theme.fonts.display, fontSize: 22, margin: '0 0 8px' }}>{badge.label}</h2>
        <Pill bg={rs.bg} color={rs.color} style={{ marginBottom: 16 }}>{badge.rarity}</Pill>
        <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.6 }}>Obtenu grâce à un excellent taux de satisfaction client sur les 3 derniers mois.</p>
      </div>
    </div>);

}

function LeaderboardScreen({ theme, onBack }) {
  const ranking = [
  { name: 'Solange M.', score: 412, trade: 'Électricienne' },
  { name: 'Armand B.', score: 388, trade: 'Plombier' },
  { name: 'Yves T.', score: 355, trade: 'Informaticien' },
  { name: 'Nadine F.', score: 301, trade: 'Climatisation' },
  { name: 'Jean-Paul K.', score: 276, trade: 'Sécurité' }];

  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Classement" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ padding: 20 }}>
        {ranking.map((r, i) =>
        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${theme.divider}` }}>
            <div style={{ width: 24, fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 15, color: i < 3 ? theme.accent : theme.textMuted }}>{i + 1}</div>
            <Avatar name={r.name} size={40} color={theme.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: theme.textMuted }}>{r.trade}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.score} pts</div>
          </div>
        )}
      </div>
    </div>);

}

Object.assign(window, { ReputationScreen, BadgeDetailScreen, LeaderboardScreen });