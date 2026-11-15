// app.jsx — Reliance mobile prototype
// Main shell + navigation + bottom tab bar + composes all screens

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "blue",
  "font": "jakarta",
  "density": "regular",
  "view": "canvas"
}/*EDITMODE-END*/;

// ── Bottom tab bar ─────────────────────────────────────────────────────
function TabBar({ theme, tab, setTab, role }) {
  const tabs = role === 'tech'
    ? [
        { id: 'home', icon: 'home', label: 'Missions' },
        { id: 'map', icon: 'map', label: 'Carte' },
        { id: 'inbox', icon: 'chat', label: 'Messages' },
        { id: 'wallet', icon: 'wallet', label: 'Gains' },
        { id: 'profile', icon: 'user', label: 'Profil' },
      ]
    : [
        { id: 'home', icon: 'home', label: 'Accueil' },
        { id: 'map', icon: 'map', label: 'Carte' },
        { id: 'inbox', icon: 'chat', label: 'Messages' },
        { id: 'wallet', icon: 'wallet', label: 'Wallet' },
        { id: 'profile', icon: 'user', label: 'Profil' },
      ];
  // Barre de navigation flottante Clean Lavender : pilule à 16 px des bords, onglet actif sur pastille primary-fixed
  return (
    <nav aria-label="Navigation principale" style={{
      position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 30,
      height: 72, padding: '0 8px', borderRadius: 28,
      background: theme.surface, border: `1px solid ${theme.border}`,
      boxShadow: theme.shadowNav,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button type="button" key={t.id} onClick={() => setTab(t.id)} aria-current={active ? 'page' : undefined} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: active ? theme.onPrimaryFixed : theme.textMuted, padding: 0, minWidth: 56,
          }}>
            <span style={{
              width: 52, height: 30, borderRadius: 9999,
              background: active ? theme.primaryFixed : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={t.icon} size={22}/>
            </span>
            <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: active ? 700 : 500, fontFamily: theme.fonts.body }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Floating Action Button (clients) ───────────────────────────────────
function FAB({ theme, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', bottom: 90, right: 18, zIndex: 25,
      width: 60, height: 60, borderRadius: 20,
      background: theme.accent, color: theme.onPrimary, border: '3px solid ' + theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 12px 30px ${theme.accent}55`,
      cursor: 'pointer',
    }}>
      <Icon name="plus" size={26} strokeWidth={2.5}/>
    </button>
  );
}

// ── App router — manages screen + role state ──────────────────────────
function PhoneApp({ tweaks, initial = 'home', role: initialRole = 'client' }) {
  const theme = useReliance(tweaks);
  const [route, setRoute] = React.useState(initial);
  const [role, setRole] = React.useState(initialRole);
  const [selectedTech, setSelectedTech] = React.useState(TECHS[0]);
  const [tab, setTab] = React.useState(['home','map','inbox','wallet','profile'].includes(initial) ? initial : 'home');

  // Sync tab when route changes to a tab-route
  React.useEffect(() => {
    if (['home','map','inbox','wallet','profile'].includes(route)) setTab(route);
  }, [route]);

  const goTab = (t) => { setTab(t); setRoute(t); };

  // Render current screen
  let screen;
  switch (route) {
    case 'onboarding': screen = <OnboardingScreen theme={theme} onDone={() => setRoute('role')} onSkip={() => setRoute('home')}/>; break;
    case 'role': screen = <RoleSelectScreen theme={theme} onSelect={(r) => { setRole(r); setRoute('login'); }}/>; break;
    case 'login': screen = <LoginScreen theme={theme} onLogin={() => setRoute('home')} onBack={() => setRoute('role')}/>; break;
    case 'home':
      screen = role === 'tech'
        ? <TechHomeScreen theme={theme}/>
        : <ClientHomeScreen theme={theme}
            onCategory={() => setRoute('map')}
            onTech={(t) => { setSelectedTech(t); setRoute('tech'); }}
            onMap={() => setRoute('map')}
            onNewRequest={() => setRoute('request')}/>;
      break;
    case 'map': screen = <MapScreen theme={theme} onTech={(t) => { setSelectedTech(t); setRoute('tech'); }} onBack={() => setRoute('home')}/>; break;
    case 'request': screen = <NewRequestScreen theme={theme} onBack={() => setRoute('home')} onMatch={() => setRoute('matching')}/>; break;
    case 'matching': screen = <MatchingScreen theme={theme} onBack={() => setRoute('home')} onSelect={(t) => { setSelectedTech(t); setRoute('intervention'); }}/>; break;
    case 'tech': screen = <TechProfileScreen theme={theme} tech={selectedTech} onBack={() => setRoute('home')} onBook={() => setRoute('intervention')}/>; break;
    case 'intervention': screen = <InterventionScreen theme={theme} tech={selectedTech} onBack={() => setRoute('home')} onChat={() => setRoute('chat')}/>; break;
    case 'chat': screen = <ChatScreen theme={theme} tech={selectedTech} onBack={() => setRoute('intervention')}/>; break;
    case 'diagnostic': screen = <DiagnosticReportScreen theme={theme} tech={selectedTech} mode="client" onBack={() => setRoute('intervention')} onAccept={() => setRoute('quote')} onReject={() => setRoute('intervention')}/>; break;
    case 'diagnostic-edit': screen = <DiagnosticReportScreen theme={theme} tech={selectedTech} mode="tech-edit" onBack={() => setRoute('home')} onAccept={() => setRoute('home')}/>; break;
    case 'quote': screen = <QuoteScreen theme={theme} tech={selectedTech} onBack={() => setRoute('diagnostic')} onAccept={() => setRoute('intervention')} onReject={() => setRoute('intervention')}/>; break;
    case 'validation': screen = <ValidationScreen theme={theme} tech={selectedTech} onBack={() => setRoute('intervention')} onValidate={() => setRoute('escrow-release')} onDispute={() => setRoute('intervention')}/>; break;
    case 'escrow-release': screen = <EscrowReleaseScreen theme={theme} tech={selectedTech} onDone={() => setRoute('home')} onRate={() => setRoute('home')} onInvoice={() => setRoute('invoice')}/>; break;
    case 'invoice': screen = <InvoiceScreen theme={theme} tech={selectedTech} onBack={() => setRoute('home')}/>; break;
    case 'kyc-start': screen = <KYCStartScreen theme={theme} onBack={() => setRoute('profile')} onSelect={() => setRoute('kyc-scan')}/>; break;
    case 'kyc-scan': screen = <KYCScanScreen theme={theme} onBack={() => setRoute('kyc-start')} onNext={() => setRoute('kyc-selfie')}/>; break;
    case 'kyc-selfie': screen = <KYCSelfieScreen theme={theme} onBack={() => setRoute('kyc-scan')} onNext={() => setRoute('kyc-pending')}/>; break;
    case 'kyc-pending': screen = <KYCPendingScreen theme={theme} onDone={() => setRoute('home')}/>; break;
    case 'kyc-rejected': screen = <KYCRejectedScreen theme={theme} onRetry={() => setRoute('kyc-start')} onSupport={() => setRoute('home')}/>; break;
    case 'tech-onboarding': screen = <TechOnboardingScreen theme={theme} onBack={() => setRoute('role')} onDone={() => setRoute('kyc-pending')}/>; break;
    case 'rating': screen = <RatingScreen theme={theme} tech={selectedTech} onBack={() => setRoute('home')} onSubmit={() => setRoute('home')}/>; break;
    case 'dispute': screen = <DisputeScreen theme={theme} tech={selectedTech} onBack={() => setRoute('intervention')} onSubmit={() => setRoute('home')}/>; break;
    case 'cancel': screen = <CancelScreen theme={theme} tech={selectedTech} onBack={() => setRoute('intervention')} onConfirm={() => setRoute('home')}/>; break;
    case 'wallet-topup': screen = <WalletTopUpScreen theme={theme} onBack={() => setRoute('wallet')} onNext={() => setRoute('wallet-otp')}/>; break;
    case 'wallet-withdraw': screen = <WalletWithdrawScreen theme={theme} onBack={() => setRoute('wallet')} onNext={() => setRoute('wallet-otp')}/>; break;
    case 'wallet-otp': screen = <WalletOTPScreen theme={theme} onBack={() => setRoute('wallet')} onSuccess={() => setRoute('wallet')}/>; break;
    case 'transaction': screen = <TransactionDetailScreen theme={theme} onBack={() => setRoute('wallet')}/>; break;
    case 'planning': screen = <PlanningWeekScreen theme={theme} onBack={() => setRoute('home')} onLeave={() => setRoute('leave')} onAvailability={() => setRoute('availability')}/>; break;
    case 'leave': screen = <LeaveRequestScreen theme={theme} onBack={() => setRoute('planning')} onSubmit={() => setRoute('planning')}/>; break;
    case 'availability': screen = <AvailabilityScreen theme={theme} onBack={() => setRoute('planning')} onSave={() => setRoute('planning')}/>; break;
    case 'inbox': screen = <InboxScreen theme={theme} onChat={() => { setSelectedTech(TECHS[0]); setRoute('chat'); }}/>; break;
    case 'feed': screen = <FeedScreen theme={theme} onBack={() => setRoute('home')} onPost={() => setRoute('post-detail')} onCreate={() => setRoute('post-create')}/>; break;
    case 'post-create': screen = <CreatePostScreen theme={theme} onBack={() => setRoute('feed')} onPost={() => setRoute('feed')}/>; break;
    case 'post-detail': screen = <PostDetailScreen theme={theme} onBack={() => setRoute('feed')}/>; break;
    case 'reputation': screen = <ReputationScreen theme={theme} onBack={() => setRoute('profile')} onBadge={() => setRoute('badge-detail')}/>; break;
    case 'badge-detail': screen = <BadgeDetailScreen theme={theme} onBack={() => setRoute('reputation')}/>; break;
    case 'leaderboard': screen = <LeaderboardScreen theme={theme} onBack={() => setRoute('reputation')}/>; break;
    case 'agency': screen = <AgencyDashboardScreen theme={theme} onTeam={() => setRoute('agency-team')} onAssign={() => setRoute('agency-assign')} onSettings={() => setRoute('profile')}/>; break;
    case 'agency-team': screen = <AgencyTeamScreen theme={theme} onBack={() => setRoute('agency')} onMember={(m) => { setSelectedTech(m); setRoute('tech'); }} onAdd={() => setRoute('tech-onboarding')}/>; break;
    case 'agency-assign': screen = <AssignJobScreen theme={theme} onBack={() => setRoute('agency')} onAssign={() => setRoute('agency')}/>; break;
    case 'notifications': screen = <NotificationsScreen theme={theme} onBack={() => setRoute('home')}/>; break;
    case 'search': screen = <SearchScreen theme={theme} onBack={() => setRoute('home')}/>; break;
    case 'empty-states': screen = <EmptyStatesScreen theme={theme} onBack={() => setRoute('home')}/>; break;
    case 'toasts': screen = <ToastsScreen theme={theme} onBack={() => setRoute('home')}/>; break;
    case 'wallet': screen = <WalletScreen theme={theme}/>; break;
    case 'profile': screen = <ProfileScreen theme={theme} role={role} onSwitchRole={setRole}/>; break;
    default: screen = <ClientHomeScreen theme={theme} onCategory={() => {}} onTech={() => {}} onMap={() => setRoute('map')} onNewRequest={() => setRoute('request')}/>;
  }

  // Show tab bar only on top-level tab screens
  const showTabBar = ['home','map','inbox','wallet','profile'].includes(route);
  const showFAB = route === 'home' && role === 'client';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: theme.bg, overflow: 'hidden', fontFamily: theme.fonts.body }}>
      {screen}
      {showFAB && <FAB theme={theme} onClick={() => setRoute('request')}/>}
      {showTabBar && <TabBar theme={theme} tab={tab} setTab={goTab} role={role}/>}
    </div>
  );
}

// ── Wrap in iOS device ─────────────────────────────────────────────────
function PhoneFrame({ tweaks, initial, role, label }) {
  const theme = useReliance(tweaks);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <IOSDevice width={390} height={844} dark={tweaks.dark}>
        <PhoneApp tweaks={tweaks} initial={initial} role={role}/>
      </IOSDevice>
      {label && <div style={{ fontSize: 12, fontFamily: REL.font.body, color: '#57556a', fontWeight: 500 }}>{label}</div>}
    </div>
  );
}

// ── Brand cover artboard ───────────────────────────────────────────────
function BrandCover({ tweaks }) {
  const accents = REL.colors.accents;
  return (
    <div style={{
      width: 1200, height: 700, padding: 64, position: 'relative', overflow: 'hidden',
      background: '#ffffff', color: '#17161f',
      fontFamily: REL.font.body, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      {/* Background shapes */}
      <div style={{ position: 'absolute', top: -120, right: -100, width: 520, height: 520, borderRadius: '50%', background: '#efeaff' }}/>
      <div style={{ position: 'absolute', top: 100, right: 220, width: 220, height: 220, borderRadius: '50%', background: '#5f3add' }}/>
      <div style={{ position: 'absolute', inset: 0, opacity: 1, backgroundImage: `radial-gradient(rgba(23,22,31,0.06) 1.2px, transparent 1.2px)`, backgroundSize: '20px 20px' }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: '#ffffff', border: '1px solid #ececf1', fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5f3add' }}/>
          Reliance · Mobile · v1.0 · Yaoundé
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
        <div style={{ fontFamily: REL.font.display, fontSize: 96, lineHeight: 1.02, fontWeight: 700, letterSpacing: -2, marginBottom: 24 }}>
          Le bon technicien.<br/>
          <span style={{ color: '#5f3add' }}>Sans le mauvais</span><br/>
          stress.
        </div>
        <p style={{ margin: 0, fontSize: 20, lineHeight: 1.45, color: '#57556a', maxWidth: 620 }}>
          Adaptation mobile de la marque Reliance — exploration des écrans clés du parcours client et technicien sur iOS.
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            { v: '13', lbl: 'écrans' },
            { v: '2', lbl: 'rôles' },
            { v: '5', lbl: 'tweaks live' },
          ].map(s => (
            <div key={s.lbl}>
              <div style={{ fontFamily: REL.font.display, fontSize: 48, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: '#57556a', marginTop: 6, fontWeight: 600 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#57556a', fontWeight: 600 }}>
          v1.0 · Cameroun · Bilingue FR · 2026
        </div>
      </div>
    </div>
  );
}

// ── Main entry : uniquement les écrans de l'app ─────────────────────────
const SCREENS = [
  {
    "name": "Onboarding",
    "initial": "onboarding"
  },
  {
    "name": "Choix du rôle",
    "initial": "role"
  },
  {
    "name": "Connexion",
    "initial": "login"
  },
  {
    "name": "Accueil client",
    "initial": "home",
    "role": "client"
  },
  {
    "name": "Carte techniciens",
    "initial": "map",
    "role": "client"
  },
  {
    "name": "Profil technicien",
    "initial": "tech"
  },
  {
    "name": "Nouvelle demande (4 étapes)",
    "initial": "request"
  },
  {
    "name": "Matching",
    "initial": "matching"
  },
  {
    "name": "Suivi d'intervention",
    "initial": "intervention"
  },
  {
    "name": "Chat client ↔ technicien",
    "initial": "chat"
  },
  {
    "name": "Inbox messages",
    "initial": "inbox"
  },
  {
    "name": "Portefeuille",
    "initial": "wallet"
  },
  {
    "name": "Profil & préférences",
    "initial": "profile"
  },
  {
    "name": "Accueil technicien",
    "initial": "home",
    "role": "tech"
  },
  {
    "name": "Rapport diagnostic (vue client)",
    "initial": "diagnostic"
  },
  {
    "name": "Rédaction diagnostic (tech)",
    "initial": "diagnostic-edit",
    "role": "tech"
  },
  {
    "name": "Devis formel",
    "initial": "quote"
  },
  {
    "name": "Validation client (post-travaux)",
    "initial": "validation"
  },
  {
    "name": "Libération escrow",
    "initial": "escrow-release"
  },
  {
    "name": "Facture PDF",
    "initial": "invoice"
  },
  {
    "name": "KYC · Choix document",
    "initial": "kyc-start"
  },
  {
    "name": "KYC · Scan recto/verso",
    "initial": "kyc-scan"
  },
  {
    "name": "KYC · Selfie de vérification",
    "initial": "kyc-selfie"
  },
  {
    "name": "KYC · En attente",
    "initial": "kyc-pending"
  },
  {
    "name": "KYC · Rejeté",
    "initial": "kyc-rejected"
  },
  {
    "name": "Onboarding technicien (5 étapes)",
    "initial": "tech-onboarding"
  },
  {
    "name": "Notation post-mission",
    "initial": "rating"
  },
  {
    "name": "Ouvrir un litige",
    "initial": "dispute"
  },
  {
    "name": "Annuler la demande",
    "initial": "cancel"
  },
  {
    "name": "Recharger",
    "initial": "wallet-topup"
  },
  {
    "name": "Retirer",
    "initial": "wallet-withdraw"
  },
  {
    "name": "Code SMS de vérification",
    "initial": "wallet-otp"
  },
  {
    "name": "Détail d'une transaction",
    "initial": "transaction"
  },
  {
    "name": "Calendrier hebdomadaire",
    "initial": "planning",
    "role": "tech"
  },
  {
    "name": "Bloquer mon agenda (congés)",
    "initial": "leave",
    "role": "tech"
  },
  {
    "name": "Réglages de disponibilité",
    "initial": "availability",
    "role": "tech"
  },
  {
    "name": "Feed communauté",
    "initial": "feed"
  },
  {
    "name": "Créer un post",
    "initial": "post-create",
    "role": "tech"
  },
  {
    "name": "Post & commentaires",
    "initial": "post-detail"
  },
  {
    "name": "Profil réputation public",
    "initial": "reputation",
    "role": "tech"
  },
  {
    "name": "Détail d'un badge",
    "initial": "badge-detail",
    "role": "tech"
  },
  {
    "name": "Classement quartier",
    "initial": "leaderboard",
    "role": "tech"
  },
  {
    "name": "Dashboard agence",
    "initial": "agency",
    "role": "tech"
  },
  {
    "name": "Équipe (annuaire)",
    "initial": "agency-team",
    "role": "tech"
  },
  {
    "name": "Affecter une mission",
    "initial": "agency-assign",
    "role": "tech"
  },
  {
    "name": "Centre de notifications",
    "initial": "notifications",
    "role": "client"
  },
  {
    "name": "Recherche universelle + filtres",
    "initial": "search",
    "role": "client"
  },
  {
    "name": "États vides & erreurs (6 variantes)",
    "initial": "empty-states",
    "role": "client"
  },
  {
    "name": "Toasts & bannières",
    "initial": "toasts",
    "role": "client"
  }
];

function Screen({ tweaks, initial, role }) {
  const theme = useReliance(tweaks);
  return (
    <div style={{ width: 390, height: 844, position: 'relative', overflow: 'hidden', background: theme.bg, borderRadius: 28, border: '1px solid #ececf1', boxShadow: '0 2px 8px rgba(23, 22, 31, 0.04)' }}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <PhoneApp tweaks={tweaks} initial={initial} role={role}/>
      </div>
    </div>
  );
}

function App() {
  const tweaks = TWEAK_DEFAULTS;
  return (
    <main style={{ minHeight: '100%', padding: 40, background: '#f6f6f8', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center', alignContent: 'flex-start' }}>
      {SCREENS.map((s, i) => (
        <figure key={i} style={{ margin: 0 }}>
          <Screen tweaks={tweaks} initial={s.initial} role={s.role}/>
          <figcaption style={{ marginTop: 12, fontSize: 14, lineHeight: '20px', fontWeight: 500, color: '#57556a', textAlign: 'center' }}>{s.name}</figcaption>
        </figure>
      ))}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
