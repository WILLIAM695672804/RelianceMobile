// screens-social.jsx — Feed, création de post, détail (Étape 6)

const SOCIAL_POSTS = [
  {
    id: 'p1', author: 'Paul Mvondo', role: 'Plombier · Bastos', verified: true,
    when: '2h', kind: 'photo', accent: '#5f3add',
    title: 'Avant / après — fuite chauffe-eau',
    body: 'Encore une intervention propre ce matin chez M. Tchatchouang. Joint torique HS, remplacement complet du flexible. 1h30 sur place, 0 saleté laissée. Reliance ✊🏾',
    likes: 47, comments: 12, shares: 3,
    mediaTone: 'red', mediaCount: 2,
    tags: ['#plomberie', '#chauffeau', '#bastos'],
  },
  {
    id: 'p2', author: 'Reliance', role: 'Officiel', verified: true, official: true,
    when: '5h', kind: 'announce',
    title: '🎉 +500 techniciens vérifiés à Yaoundé',
    body: 'Cette semaine, on franchit la barre des 500 pros KYC sur Yaoundé. Merci à toute la communauté qui rend Reliance possible. La confiance, ça se construit ensemble.',
    likes: 312, comments: 28, shares: 41,
  },
  {
    id: 'p3', author: 'Marie Atangana', role: 'Cliente · Tsinga',
    when: '1j', kind: 'review', stars: 5,
    title: 'Service au top hier soir',
    body: 'Panne électrique à 21h, technicien arrivé en 25 min, problème réglé en 40 min. Aurélien Eyene est juste excellent. À recommander les yeux fermés.',
    likes: 28, comments: 6, shares: 1,
    techMentioned: 'Aurélien Eyene',
  },
  {
    id: 'p4', author: 'Yves Kamga', role: 'Électricien · Mvog-Ada', verified: true, accent: '#5f3add',
    when: '1j', kind: 'tip',
    title: '💡 Astuce du jour',
    body: 'Si votre disjoncteur saute toujours après réarmement, NE forcez PAS. C\'est qu\'il protège — soit court-circuit, soit surcharge. Débranchez tout, réenclenchez, rebranchez un par un. Si ça saute encore : appelez un pro (= moi 😉).',
    likes: 89, comments: 14, shares: 22,
  },
];

// ── Feed ──────────────────────────────────────────────────────────────
function FeedScreen({ theme, onBack, onPost, onCreate, onProfile }) {
  const [tab, setTab] = React.useState('all');
  const tabs = [
    { id: 'all', label: 'Pour vous' },
    { id: 'pros', label: 'Pros' },
    { id: 'community', label: 'Quartier' },
    { id: 'tips', label: 'Astuces' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>

      {/* Header */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: theme.fonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Communauté</div>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="search" size={18}/></button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '8px 16px 0', display: 'flex', gap: 4, overflowX: 'auto', borderBottom: `1px solid ${theme.divider}` }}>
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
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* Composer prompt */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.divider}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name="Vous" color={theme.accent} size={36}/>
        <button onClick={onCreate} style={{
          flex: 1, textAlign: 'left', padding: '10px 14px', borderRadius: 999,
          background: theme.surface, border: `1px solid ${theme.border}`,
          color: theme.textMuted, fontSize: 13, fontFamily: theme.fonts.body, cursor: 'pointer',
        }}>Partager une astuce, un avant/après…</button>
        <button onClick={onCreate} style={{ width: 36, height: 36, borderRadius: '50%', background: `${theme.accent}1A`, color: theme.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="image" size={16}/></button>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
        {SOCIAL_POSTS.map(p => (
          <PostCard key={p.id} theme={theme} post={p} onPress={() => onPost && onPost(p)} onAuthor={() => onProfile && onProfile(p)}/>
        ))}
        <div style={{ padding: '20px 24px', textAlign: 'center', color: theme.textMuted, fontSize: 12 }}>
          ✨ Vous êtes à jour
        </div>
      </div>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────
function PostCard({ theme, post, onPress, onAuthor, expanded }) {
  return (
    <article style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.divider}` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button onClick={onAuthor} style={{ all: 'unset', cursor: 'pointer' }}>
          {post.official ? (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.text, color: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 14 }}>R</div>
          ) : (
            <Avatar name={post.author} color={post.accent || theme.accent} size={40}/>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{post.author}</span>
            {post.verified && <Icon name="shield" size={13} color={REL.colors.accents.green}/>}
            {post.official && <Pill bg={`${theme.accent}1A`} color={theme.accent} size="sm">Officiel</Pill>}
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{post.role}</span>
            <span>·</span>
            <span>{post.when}</span>
          </div>
        </div>
        <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: 'none', color: theme.textMuted }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>

      {/* Body */}
      <button onClick={onPress} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
        {post.kind === 'review' && (
          <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= post.stars ? REL.colors.accents.amber : 'transparent'} stroke={i <= post.stars ? 'transparent' : theme.border}>
                <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.7 7.3L12 17.8 5.6 21.7l1.7-7.3L1.6 9.5l7.5-.6z"/>
              </svg>
            ))}
            {post.techMentioned && <span style={{ fontSize: 11, color: theme.textMuted, marginLeft: 6 }}>Mission avec {post.techMentioned}</span>}
          </div>
        )}
        <div style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: 700, lineHeight: 1.25, marginBottom: 6, letterSpacing: -0.3 }}>{post.title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: theme.text, textWrap: 'pretty', display: '-webkit-box', WebkitLineClamp: expanded ? 99 : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.body}</div>

        {post.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {post.tags.map(t => <span key={t} style={{ fontSize: 12, color: theme.accent, fontWeight: 500 }}>{t}</span>)}
          </div>
        )}

        {/* Media */}
        {post.kind === 'photo' && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: post.mediaCount > 1 ? '1fr 1fr' : '1fr', gap: 4, borderRadius: 12, overflow: 'hidden' }}>
            {Array.from({ length: post.mediaCount || 1 }, (_, i) => (
              <div key={i} style={{ aspectRatio: post.mediaCount > 1 ? '1/1' : '16/10', background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}77)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="image" size={28} color="rgba(255,255,255,0.55)"/>
                {i === 0 && post.mediaCount > 1 && <span style={{ position: 'absolute', bottom: 6, left: 6, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, fontWeight: 600 }}>AVANT</span>}
                {i === 1 && <span style={{ position: 'absolute', bottom: 6, left: 6, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, fontWeight: 600 }}>APRÈS</span>}
              </div>
            ))}
          </div>
        )}

        {post.kind === 'announce' && (
          <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}DD)`, color: '#fff' }}>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>+500 pros</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Vérifiés à Yaoundé · Mars 2026</div>
          </div>
        )}

        {post.kind === 'tip' && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: `${REL.colors.accents.amber}10`, border: `1px solid ${REL.colors.accents.amber}40`, fontSize: 11, color: theme.textMuted, fontFamily: theme.fonts.mono, letterSpacing: 0.3 }}>
            ASTUCE PRO · {post.role}
          </div>
        )}
      </button>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 18, marginTop: 12, color: theme.textMuted }}>
        <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'inherit', padding: 0, cursor: 'pointer' }}>
          <Icon name="heart" size={18}/>
          <span style={{ fontWeight: 500, fontFamily: theme.fonts.mono }}>{post.likes}</span>
        </button>
        <button onClick={onPress} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'inherit', padding: 0, cursor: 'pointer' }}>
          <Icon name="chat" size={18}/>
          <span style={{ fontWeight: 500, fontFamily: theme.fonts.mono }}>{post.comments}</span>
        </button>
        <button style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'inherit', padding: 0, cursor: 'pointer' }}>
          <Icon name="send" size={17}/>
          <span style={{ fontWeight: 500, fontFamily: theme.fonts.mono }}>{post.shares}</span>
        </button>
        <div style={{ flex: 1 }}/>
        <button style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}><Icon name="bookmark" size={17}/></button>
      </div>
    </article>
  );
}

// ── Composer ──────────────────────────────────────────────────────────
function CreatePostScreen({ theme, onBack, onPost }) {
  const [body, setBody] = React.useState('Encore une intervention propre ce matin. Joint torique HS, remplacement complet du flexible. 1h30 sur place, 0 saleté laissée.');
  const [photos, setPhotos] = React.useState([1, 2]);
  const [audience, setAudience] = React.useState('public');
  const [postType, setPostType] = React.useState('photo');

  const types = [
    { id: 'photo', label: 'Avant/après', icon: 'image' },
    { id: 'tip', label: 'Astuce', icon: 'sparkle' },
    { id: 'review', label: 'Avis', icon: 'star' },
    { id: 'question', label: 'Question', icon: 'info' },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>Nouveau post</div>
        <button onClick={onPost} disabled={!body.trim()} style={{ padding: '8px 14px', borderRadius: 999, background: body.trim() ? theme.accent : theme.border, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: body.trim() ? 'pointer' : 'not-allowed' }}>
          Publier
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Author + audience */}
        <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Paul Mvondo" color={theme.accent} size={42}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Paul Mvondo</div>
            <button onClick={() => setAudience(audience === 'public' ? 'pros' : 'public')} style={{ marginTop: 2, padding: '3px 10px', borderRadius: 999, background: theme.surface, border: `1px solid ${theme.border}`, fontSize: 11, fontWeight: 600, color: theme.text, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Icon name={audience === 'public' ? 'eye' : 'shield'} size={11}/>
              <span>{audience === 'public' ? 'Public' : 'Pros uniquement'}</span>
              <Icon name="chevronD" size={10}/>
            </button>
          </div>
        </div>

        {/* Type chips */}
        <div style={{ padding: '0 16px 14px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {types.map(t => {
            const sel = postType === t.id;
            return (
              <button key={t.id} onClick={() => setPostType(t.id)} style={{
                padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: sel ? theme.text : theme.surface,
                color: sel ? theme.bg : theme.text,
                border: `1px solid ${sel ? theme.text : theme.border}`,
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                fontFamily: theme.fonts.body, whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <Icon name={t.icon} size={13}/>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '0 16px 14px' }}>
          <textarea
            value={body} onChange={e => setBody(e.target.value)}
            placeholder="Quoi de neuf sur le terrain ?"
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'transparent', border: 'none',
              padding: 0, fontSize: 17, color: theme.text, outline: 'none',
              fontFamily: theme.fonts.body, resize: 'none', lineHeight: 1.5,
            }}/>
        </div>

        {/* Photos */}
        {postType === 'photo' && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', position: 'relative', background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}77)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="image" size={22} color="rgba(255,255,255,0.6)"/>
                  <button onClick={() => setPhotos(photos.filter(x => x !== p))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="close" size={11} strokeWidth={3}/>
                  </button>
                  <span style={{ position: 'absolute', bottom: 4, left: 4, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, fontWeight: 600 }}>{i === 0 ? 'AVANT' : 'APRÈS'}</span>
                </div>
              ))}
              <button style={{ aspectRatio: '1/1', borderRadius: 10, border: `2px dashed ${theme.border}`, background: 'transparent', color: theme.textMuted, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
                <Icon name="plus" size={18}/>
                <span style={{ fontSize: 9, fontWeight: 600 }}>Ajouter</span>
              </button>
            </div>
          </div>
        )}

        {/* Tags suggestion */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Tags suggérés</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['#plomberie', '#avantapres', '#chauffeau', '#bastos', '#yaoundé'].map(t => (
              <span key={t} style={{ padding: '5px 10px', borderRadius: 999, background: `${theme.accent}10`, color: theme.accent, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>+ {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '10px 16px 28px', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', alignItems: 'center', gap: 6 }}>
        {[
          { icon: 'image', label: 'Photo' },
          { icon: 'video', label: 'Vidéo' },
          { icon: 'pin', label: 'Lieu' },
          { icon: 'bolt', label: 'GPS' },
        ].map(t => (
          <button key={t.icon} style={{ flex: 1, padding: 10, background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', color: theme.text }}>
            <Icon name={t.icon} size={18}/>
            <span style={{ fontSize: 9, fontWeight: 500, color: theme.textMuted }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Détail post + commentaires ────────────────────────────────────────
function PostDetailScreen({ theme, onBack }) {
  const post = SOCIAL_POSTS[0];
  const comments = [
    { author: 'Marie A.', when: '1h', body: 'Top boulot 👏🏾 Tu es libre samedi matin pour un évier ?', likes: 4, accent: '#5f3add' },
    { author: 'Yves Kamga', role: 'Pro · Élec', when: '45min', body: 'Le flexible Inox c\'est 100x mieux que le PVC, bon choix.', likes: 8, accent: '#5f3add', verified: true },
    { author: 'Reliance', when: '30min', body: 'Bravo Paul ! Tu gagnes le badge "Avant/après de la semaine" 🏆', likes: 22, official: true },
    { author: 'Junior B.', when: '15min', body: 'Combien ça coûte un truc comme ça ?', likes: 0 },
  ];

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column' }}>
      <CustomStatusBar dark={theme._t.dark}/>
      <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${theme.divider}` }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={18}/></button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>Publication</div>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', color: theme.text }}><Icon name="upload" size={18}/></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <PostCard theme={theme} post={post} expanded/>

        {/* Comments header */}
        <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.divider}` }}>
          <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{comments.length} commentaires</div>
          <button style={{ fontSize: 12, color: theme.textMuted, background: 'transparent', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>Plus pertinents</span>
            <Icon name="chevronD" size={11}/>
          </button>
        </div>

        {/* Comments */}
        {comments.map((c, i) => (
          <div key={i} style={{ padding: '10px 16px', display: 'flex', gap: 10, borderBottom: i === comments.length - 1 ? 'none' : `1px solid ${theme.divider}` }}>
            {c.official ? (
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: theme.text, color: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 13 }}>R</div>
            ) : (
              <Avatar name={c.author} color={c.accent || theme.accent} size={36}/>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: theme.surface, borderRadius: 14, padding: '8px 12px', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.author}</span>
                  {c.verified && <Icon name="shield" size={11} color={REL.colors.accents.green}/>}
                  {c.official && <Pill bg={`${theme.accent}1A`} color={theme.accent} size="sm">Officiel</Pill>}
                  {c.role && <span style={{ fontSize: 10, color: theme.textMuted }}>· {c.role}</span>}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>{c.body}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4, padding: '0 4px', fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>
                <span>{c.when}</span>
                <button style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>J'aime{c.likes ? ` · ${c.likes}` : ''}</button>
                <button style={{ background: 'transparent', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Répondre</button>
              </div>
            </div>
          </div>
        ))}

        <div style={{ height: 80 }}/>
      </div>

      {/* Comment composer */}
      <div style={{ padding: '10px 12px calc(10px + env(safe-area-inset-bottom))', borderTop: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name="Vous" color={theme.accent} size={32}/>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: theme.bg, borderRadius: 999, border: `1px solid ${theme.border}`, padding: '4px 4px 4px 14px' }}>
          <input placeholder="Commenter…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: theme.text, fontFamily: theme.fonts.body }}/>
          <button style={{ width: 30, height: 30, borderRadius: '50%', background: theme.accent, color: theme.onPrimary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="send" size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FeedScreen, CreatePostScreen, PostDetailScreen });
