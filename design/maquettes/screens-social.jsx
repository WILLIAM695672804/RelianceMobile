// screens-social.jsx — feed, create post, post detail

const SOCIAL_POSTS = [
{ id: 'p1', author: 'Armand B.', trade: 'Plombier', text: 'Intervention terminée ce matin à Bastos — remplacement complet d’une colonne d’eau. 💧', likes: 24, comments: 3 },
{ id: 'p2', author: 'Solange M.', trade: 'Électricienne', text: 'Rappel sécurité : ne jamais bricoler un tableau électrique sans coupure générale !', likes: 41, comments: 8 },
{ id: 'p3', author: 'Reliance', trade: 'Officiel', text: 'Nouveau : le suivi GPS en temps réel est désormais disponible pour toutes les interventions sécurité.', likes: 88, comments: 12 },
{ id: 'p4', author: 'Nadine F.', trade: 'Climatisation', text: 'Avant/après d’un entretien de climatiseur split — gain de performance de 30%.', likes: 19, comments: 2 }];


function PostCard({ post, theme, onOpen }) {
  return (
    <div onClick={() => onOpen && onOpen(post.id)} style={{ padding: 16, borderBottom: `1px solid ${theme.divider}`, cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <Avatar name={post.author} size={38} color={theme.accent} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{post.author}</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>{post.trade}</div>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 10px' }}>{post.text}</p>
      {post.id !== 'p2' && <ImagePlaceholder label="publication" height={160} />}
      <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="heart" size={16} color={theme.textMuted} /><span style={{ fontSize: 12, color: theme.textMuted }}>{post.likes}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="chat" size={16} color={theme.textMuted} /><span style={{ fontSize: 12, color: theme.textMuted }}>{post.comments}</span></div>
      </div>
    </div>);

}

function FeedScreen({ theme, onCreate, onOpen }) {
  return (
    <div style={{ height: '100%', paddingTop: 60, background: theme.bg, paddingBottom: 90, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px' }}>
        <h1 style={{ fontFamily: theme.fonts.display, fontSize: 24, fontWeight: 800, margin: 0 }}>Fil social</h1>
        <div onClick={onCreate} style={{ width: 38, height: 38, borderRadius: 12, background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="plus" size={18} color="#fff" />
        </div>
      </div>
      {SOCIAL_POSTS.map((p) => <PostCard key={p.id} post={p} theme={theme} onOpen={onOpen} />)}
    </div>);

}

function CreatePostScreen({ theme, onBack, onPublish }) {
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Nouvelle publication" dark={theme._t.dark} onBack={onBack} accent={theme.accent} right={<span onClick={onPublish} style={{ color: theme.accent, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Publier</span>} />
      <div style={{ flex: 1, padding: 20 }}>
        <textarea placeholder="Partagez une actualité, un chantier, un conseil…" style={{
          width: '100%', minHeight: 140, border: 'none', outline: 'none', fontSize: 15, resize: 'none', background: 'transparent', color: theme.text
        }} />
        <ImagePlaceholder label="+ ajouter une photo" height={140} />
      </div>
    </div>);

}

function PostDetailScreen({ theme, onBack }) {
  const post = SOCIAL_POSTS[0];
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      <IOSNavBar title="Publication" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <PostCard post={post} theme={theme} />
        <div style={{ padding: 16 }}>
          {[1, 2].map((i) =>
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <Avatar name="Client Y" size={32} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Client Y</div>
                <div style={{ fontSize: 13, color: theme.textMuted }}>Belle intervention, merci pour la réactivité !</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '10px 16px 24px', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ flex: 1, padding: '11px 14px', borderRadius: 20, background: theme.surfaceMuted, fontSize: 14, color: theme.textMuted }}>Ajouter un commentaire…</div>
      </div>
    </div>);

}

Object.assign(window, { FeedScreen, CreatePostScreen, PostDetailScreen });