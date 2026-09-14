// screens-system.jsx — notifications, search, empty states, toasts

const NOTIFICATIONS = [
{ id: 'n1', icon: 'wallet', title: 'Paiement libéré', body: '25 000 FCFA ont été versés à Armand B.', time: '5 min', unread: true },
{ id: 'n2', icon: 'chat', title: 'Nouveau message', body: 'Mireille A. vous a envoyé un message.', time: '20 min', unread: true },
{ id: 'n3', icon: 'shield', title: 'KYC validé', body: 'Votre vérification d’identité a été approuvée.', time: '1h', unread: false },
{ id: 'n4', icon: 'star', title: 'Nouvel avis', body: 'Vous avez reçu une note de 5 étoiles.', time: '3h', unread: false },
{ id: 'n5', icon: 'badge', title: 'Badge débloqué', body: 'Vous avez obtenu le badge "Rapide".', time: 'Hier', unread: false },
{ id: 'n6', icon: 'wrench', title: 'Intervention confirmée', body: 'Votre rendez-vous du 15 sept. est confirmé.', time: 'Hier', unread: false },
{ id: 'n7', icon: 'info', title: 'Maintenance prévue', body: 'L’application sera indisponible dimanche de 2h à 4h.', time: '2 j', unread: false }];


function NotifRow({ n, theme }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 20px', background: n.unread ? theme.accent + '0A' : 'transparent' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={n.icon} size={19} color={theme.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>{n.time}</div>
        </div>
        <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>{n.body}</div>
      </div>
    </div>);

}

function NotificationsScreen({ theme, onBack }) {
  return (
    <div style={{ height: '100%', background: theme.bg }}>
      <IOSNavBar title="Notifications" dark={theme._t.dark} onBack={onBack} accent={theme.accent} />
      <div>
        {NOTIFICATIONS.map((n) => <NotifRow key={n.id} n={n} theme={theme} />)}
      </div>
    </div>);

}

function SearchScreen({ theme, onBack }) {
  const recent = ['Plombier Bastos', 'Électricien urgent', 'Caméra surveillance'];
  return (
    <div style={{ height: '100%', background: theme.bg, paddingTop: 60 }}>
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14, background: theme.surfaceMuted }}>
          <Icon name="search" size={18} color={theme.textMuted} />
          <span style={{ fontSize: 14, color: theme.textMuted }}>Rechercher…</span>
        </div>
        <span onClick={onBack} style={{ fontSize: 14, color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>Annuler</span>
      </div>
      <Section title="Recherches récentes">
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {recent.map((r) =>
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
              <Icon name="clock" size={16} color={theme.textMuted} />
              <span style={{ fontSize: 14 }}>{r}</span>
            </div>
          )}
        </div>
      </Section>
    </div>);

}

function EmptyStatesScreen({ theme, variant = 'requests' }) {
  const variants = {
    requests: { icon: 'inbox', title: 'Aucune demande', body: 'Vous n’avez pas encore de demande d’intervention en cours.' },
    search: { icon: 'search', title: 'Aucun résultat', body: 'Aucun technicien ne correspond à votre recherche.' },
    chat: { icon: 'chat', title: 'Aucun message', body: 'Vos conversations avec les techniciens apparaîtront ici.' },
    wallet: { icon: 'wallet', title: 'Aucune transaction', body: 'Votre historique de paiements est vide pour le moment.' },
    notifications: { icon: 'bell', title: 'Tout est calme', body: 'Vous n’avez aucune nouvelle notification.' },
    error: { icon: 'info', title: 'Une erreur est survenue', body: 'Impossible de charger le contenu. Réessayez plus tard.' }
  };
  const v = variants[variant] || variants.requests;
  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: theme.surfaceMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name={v.icon} size={34} color={theme.textMuted} />
      </div>
      <h3 style={{ fontFamily: theme.fonts.display, fontSize: 17, margin: '0 0 6px' }}>{v.title}</h3>
      <p style={{ color: theme.textMuted, fontSize: 13 }}>{v.body}</p>
    </div>);

}

function ToastsScreen({ theme }) {
  const toasts = [
  { icon: 'check', color: '#0EA5E9', text: 'Demande envoyée avec succès' },
  { icon: 'info', color: theme.accent, text: 'Nouveau message reçu' },
  { icon: 'close', color: '#E5484D', text: 'Échec du paiement, réessayez' }];

  return (
    <div style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10, padding: 20 }}>
      {toasts.map((t, i) =>
      <div key={i} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14,
        background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
      }}>
          <Icon name={t.icon} size={18} color={t.color} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{t.text}</span>
        </div>
      )}
    </div>);

}

Object.assign(window, { NotificationsScreen, SearchScreen, EmptyStatesScreen, ToastsScreen });