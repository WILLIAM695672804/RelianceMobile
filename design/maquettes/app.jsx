// app.jsx — router, phone frame, tab bar, design canvas composition

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  dark: false,
  accent: 'red',
  font: 'bricolage',
  density: 'regular',
  view: 'canvas'
}/*EDITMODE-END*/;

function TabBar({ theme, active, onChange, role = 'client' }) {
  const tabs = {
    client: [{ key: 'home', icon: 'home', label: 'Accueil' }, { key: 'map', icon: 'map', label: 'Carte' }, { key: 'feed', icon: 'grid', label: 'Fil' }, { key: 'wallet', icon: 'wallet', label: 'Portefeuille' }, { key: 'profile', icon: 'user', label: 'Profil' }],
    tech: [{ key: 'home', icon: 'home', label: 'Missions' }, { key: 'inbox', icon: 'inbox', label: 'Messages' }, { key: 'feed', icon: 'grid', label: 'Fil' }, { key: 'planning', icon: 'calendar', label: 'Planning' }, { key: 'profile', icon: 'user', label: 'Profil' }],
    agency: [{ key: 'home', icon: 'home', label: 'Tableau' }, { key: 'team', icon: 'user', label: 'Équipe' }, { key: 'feed', icon: 'grid', label: 'Fil' }, { key: 'wallet', icon: 'wallet', label: 'Portefeuille' }, { key: 'profile', icon: 'user', label: 'Profil' }]
  }[role] || [];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex',
      background: theme._t.dark ? 'rgba(17,26,43,0.85)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      borderTop: `1px solid ${theme.border}`, padding: '10px 6px 26px', zIndex: 40
    }}>
      {tabs.map((t) =>
      <div key={t.key} onClick={() => onChange(t.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
          <Icon name={t.icon} size={22} color={active === t.key ? theme.accent : theme.textMuted} />
          <span style={{ fontSize: 10, fontWeight: 600, color: active === t.key ? theme.accent : theme.textMuted }}>{t.label}</span>
        </div>
      )}
    </div>);

}

function FAB({ theme, onClick }) {
  return (
    <div onClick={onClick} style={{
      position: 'absolute', right: 20, bottom: 106, width: 54, height: 54, borderRadius: 18,
      background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 10px 24px ${theme.accent}55`, zIndex: 41, cursor: 'pointer'
    }}>
      <Icon name="plus" size={24} color="#fff" />
    </div>);

}

function PhoneApp({ theme, initial = 'onboarding', initialRole = 'client' }) {
  const [route, setRoute] = React.useState(initial);
  const [role, setRole] = React.useState(initialRole);
  const [tab, setTab] = React.useState('home');
  const nav = (r) => setRoute(r);

  const withTabs = (screen, roleForTabs = role) =>
  <div style={{ height: '100%', position: 'relative' }}>
      {screen}
      <TabBar theme={theme} active={tab} role={roleForTabs} onChange={(k) => {
        setTab(k);
        const map = {
          client: { home: 'client-home', map: 'map', feed: 'feed', wallet: 'wallet', profile: 'profile' },
          tech: { home: 'tech-home', inbox: 'inbox', feed: 'feed', planning: 'planning-week', profile: 'profile' },
          agency: { home: 'agency-dashboard', team: 'agency-team', feed: 'feed', wallet: 'wallet', profile: 'profile' }
        };
        nav(map[roleForTabs][k]);
      }} />
    </div>;


  switch (route) {
    // ── Auth / onboarding
    case 'onboarding': return <OnboardingScreen theme={theme} onNext={() => nav('role-select')} onSkip={() => nav('login')} />;
    case 'role-select': return <RoleSelectScreen theme={theme} onSelect={(r) => { setRole(r);nav('login'); }} />;
    case 'login': return <LoginScreen theme={theme} onLogin={() => nav(role === 'tech' ? 'kyc-start' : role === 'agency' ? 'agency-dashboard' : 'client-home')} />;

    // ── Client
    case 'client-home': return withTabs(<ClientHomeScreen theme={theme} onCategory={() => nav('new-request')} onSearch={() => nav('search')} onNotifications={() => nav('notifications')} onTech={() => nav('tech-profile')} />, 'client');
    case 'map': return withTabs(<MapScreen theme={theme} onTech={() => nav('tech-profile')} />, 'client');
    case 'new-request': return <NewRequestScreen theme={theme} onBack={() => nav('client-home')} onSubmit={() => nav('matching')} />;
    case 'matching': return <MatchingScreen theme={theme} onMatched={() => nav('tech-profile')} />;
    case 'tech-profile': return <TechProfileScreen theme={theme} onBack={() => nav('client-home')} onRequest={() => nav('quote')} />;
    case 'search': return <SearchScreen theme={theme} onBack={() => nav('client-home')} />;

    // ── Intervention flow
    case 'quote': return <QuoteScreen theme={theme} onBack={() => nav('tech-profile')} onAccept={() => nav('intervention')} />;
    case 'intervention': return <InterventionScreen theme={theme} onBack={() => nav('client-home')} onChat={() => nav('chat')} />;
    case 'chat': return <ChatScreen theme={theme} onBack={() => nav('intervention')} />;
    case 'diagnostic-report': return <DiagnosticReportScreen theme={theme} mode="client" onBack={() => nav('intervention')} onValidate={() => nav('quote')} />;
    case 'diagnostic-report-tech': return <DiagnosticReportScreen theme={theme} mode="tech-edit" onBack={() => nav('tech-home')} onValidate={() => nav('tech-home')} />;
    case 'validation': return <ValidationScreen theme={theme} onBack={() => nav('intervention')} onValidate={() => nav('escrow-release')} />;
    case 'escrow-release': return <EscrowReleaseScreen theme={theme} onBack={() => nav('client-home')} onDone={() => nav('rating')} />;
    case 'rating': return <RatingScreen theme={theme} onBack={() => nav('client-home')} onSubmit={() => nav('invoice')} />;
    case 'invoice': return <InvoiceScreen theme={theme} onBack={() => nav('client-home')} />;
    case 'dispute': return <DisputeScreen theme={theme} onBack={() => nav('intervention')} onSubmit={() => nav('client-home')} />;
    case 'cancel': return <CancelScreen theme={theme} onBack={() => nav('intervention')} onConfirm={() => nav('client-home')} />;

    // ── Wallet
    case 'wallet': return withTabs(<WalletScreen theme={theme} onTopUp={() => nav('wallet-topup')} onWithdraw={() => nav('wallet-withdraw')} onTx={() => nav('tx-detail')} />, role);
    case 'wallet-topup': return <WalletTopUpScreen theme={theme} onBack={() => nav('wallet')} onNext={() => nav('wallet-otp')} />;
    case 'wallet-withdraw': return <WalletWithdrawScreen theme={theme} onBack={() => nav('wallet')} onNext={() => nav('wallet-otp')} />;
    case 'wallet-otp': return <WalletOTPScreen theme={theme} onBack={() => nav('wallet')} onVerify={() => nav('wallet')} />;
    case 'tx-detail': return <TransactionDetailScreen theme={theme} onBack={() => nav('wallet')} />;

    // ── Technician role
    case 'tech-home': return withTabs(<TechHomeScreen theme={theme} onJob={() => nav('intervention')} onPlanning={() => nav('planning-week')} />, 'tech');
    case 'inbox': return withTabs(<InboxScreen theme={theme} onOpenChat={() => nav('chat')} />, 'tech');
    case 'planning-week': return withTabs(<PlanningWeekScreen theme={theme} onBack={() => nav('tech-home')} />, 'tech');
    case 'leave-request': return <LeaveRequestScreen theme={theme} onBack={() => nav('planning-week')} onSubmit={() => nav('planning-week')} />;
    case 'availability': return <AvailabilityScreen theme={theme} onBack={() => nav('profile')} />;

    // ── KYC / onboarding technicien
    case 'kyc-start': return <KYCStartScreen theme={theme} onBack={() => nav('login')} onStart={() => nav('kyc-scan')} />;
    case 'kyc-scan': return <KYCScanScreen theme={theme} onBack={() => nav('kyc-start')} onNext={() => nav('kyc-selfie')} />;
    case 'kyc-selfie': return <KYCSelfieScreen theme={theme} onBack={() => nav('kyc-scan')} onNext={() => nav('kyc-pending')} />;
    case 'kyc-pending': return <KYCPendingScreen theme={theme} onDone={() => nav('tech-onboarding')} />;
    case 'kyc-rejected': return <KYCRejectedScreen theme={theme} onRetry={() => nav('kyc-scan')} />;
    case 'tech-onboarding': return <TechOnboardingScreen theme={theme} onBack={() => nav('kyc-pending')} onDone={() => nav('tech-home')} />;

    // ── Social
    case 'feed': return withTabs(<FeedScreen theme={theme} onCreate={() => nav('create-post')} onOpen={() => nav('post-detail')} />, role);
    case 'create-post': return <CreatePostScreen theme={theme} onBack={() => nav('feed')} onPublish={() => nav('feed')} />;
    case 'post-detail': return <PostDetailScreen theme={theme} onBack={() => nav('feed')} />;

    // ── Reputation
    case 'reputation': return <ReputationScreen theme={theme} onBack={() => nav('profile')} onBadge={() => nav('badge-detail')} onLeaderboard={() => nav('leaderboard')} />;
    case 'badge-detail': return <BadgeDetailScreen theme={theme} onBack={() => nav('reputation')} />;
    case 'leaderboard': return <LeaderboardScreen theme={theme} onBack={() => nav('reputation')} />;

    // ── Agency
    case 'agency-dashboard': return withTabs(<AgencyDashboardScreen theme={theme} onTeam={() => nav('agency-team')} onAssign={() => nav('assign-job')} />, 'agency');
    case 'agency-team': return withTabs(<AgencyTeamScreen theme={theme} onTech={() => nav('tech-profile')} />, 'agency');
    case 'assign-job': return <AssignJobScreen theme={theme} onBack={() => nav('agency-dashboard')} onAssign={() => nav('agency-dashboard')} />;

    // ── System
    case 'notifications': return <NotificationsScreen theme={theme} onBack={() => nav('client-home')} />;
    case 'empty-requests': return <EmptyStatesScreen theme={theme} variant="requests" />;
    case 'empty-search': return <EmptyStatesScreen theme={theme} variant="search" />;
    case 'empty-chat': return <EmptyStatesScreen theme={theme} variant="chat" />;
    case 'empty-wallet': return <EmptyStatesScreen theme={theme} variant="wallet" />;
    case 'empty-notifications': return <EmptyStatesScreen theme={theme} variant="notifications" />;
    case 'empty-error': return <EmptyStatesScreen theme={theme} variant="error" />;
    case 'toasts': return <ToastsScreen theme={theme} />;

    // ── Profile
    case 'profile': return withTabs(<ProfileScreen theme={theme} role={role} onSwitchRole={(r) => { setRole(r);setTab('home'); }} onNav={() => {}} />, role);

    default: return <ClientHomeScreen theme={theme} />;
  }
}

function PhoneFrame({ theme, initial, initialRole, dark }) {
  return (
    <IOSDevice width={390} height={844} dark={dark !== undefined ? dark : theme._t.dark} statusBar={false}>
      <PhoneApp theme={theme} initial={initial} initialRole={initialRole} />
    </IOSDevice>);

}

function BrandCover({ theme }) {
  return (
    <div style={{
      width: 1200, height: 700, background: `linear-gradient(135deg, ${theme.accent}, #0F2C63)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', borderRadius: 4
    }}>
      <div style={{ fontFamily: theme.fonts.display, fontSize: 64, fontWeight: 800, letterSpacing: -1.5 }}>Reliance</div>
      <div style={{ fontSize: 20, opacity: 0.85, marginTop: 10 }}>Services à domicile · Yaoundé, Cameroun</div>
    </div>);

}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = useReliance(tweaks);

  if (tweaks.view === 'prototype') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
        <PhoneFrame theme={theme} initial="onboarding" initialRole="client" />
        <TweaksPanel dark={theme._t.dark}>
          <TweakSection title="Apparence">
            <TweakRow label="Mode sombre"><TweakToggle value={tweaks.dark} onChange={(v) => setTweak('dark', v)} /></TweakRow>
            <TweakRow label="Accent"><TweakSelect value={tweaks.accent} onChange={(v) => setTweak('accent', v)} options={[{ value: 'red', label: 'Bleu Reliance' }, { value: 'blue', label: 'Bleu' }, { value: 'amber', label: 'Bleu clair' }, { value: 'green', label: 'Bleu nuit' }, { value: 'emerald', label: 'Cyan' }]} /></TweakRow>
            <TweakRow label="Police"><TweakSelect value={tweaks.font} onChange={(v) => setTweak('font', v)} options={[{ value: 'bricolage', label: 'Bricolage' }, { value: 'helvetica', label: 'Helvetica' }, { value: 'serif', label: 'Serif' }, { value: 'mono', label: 'Mono' }]} /></TweakRow>
            <TweakRow label="Densité"><TweakRadio value={tweaks.density} onChange={(v) => setTweak('density', v)} options={[{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Normal' }, { value: 'comfy', label: 'Confort' }]} /></TweakRow>
          </TweakSection>
          <TweakSection title="Vue">
            <TweakButton label="Retour au canevas" onClick={() => setTweak('view', 'canvas')} />
          </TweakSection>
        </TweaksPanel>
      </div>);

  }

  return (
    <div>
      <DesignCanvas>
        <DCSection title="Couverture">
          <BrandCover theme={theme} />
        </DCSection>

        <DCSection title="Prototype interactif">
          <PhoneFrame theme={theme} initial="onboarding" initialRole="client" />
        </DCSection>

        <DCSection title="Onboarding & authentification">
          <PhoneFrame theme={theme} initial="onboarding" initialRole="client" />
          <PhoneFrame theme={theme} initial="role-select" initialRole="client" />
          <PhoneFrame theme={theme} initial="login" initialRole="client" />
        </DCSection>

        <DCSection title="Découverte client">
          <PhoneFrame theme={theme} initial="client-home" initialRole="client" />
          <PhoneFrame theme={theme} initial="map" initialRole="client" />
          <PhoneFrame theme={theme} initial="search" initialRole="client" />
          <PhoneFrame theme={theme} initial="tech-profile" initialRole="client" />
        </DCSection>

        <DCSection title="Nouvelle demande">
          <PhoneFrame theme={theme} initial="new-request" initialRole="client" />
          <PhoneFrame theme={theme} initial="matching" initialRole="client" />
        </DCSection>

        <DCSection title="Cycle d'intervention">
          <PhoneFrame theme={theme} initial="diagnostic-report" initialRole="client" />
          <PhoneFrame theme={theme} initial="quote" initialRole="client" />
          <PhoneFrame theme={theme} initial="intervention" initialRole="client" />
          <PhoneFrame theme={theme} initial="chat" initialRole="client" />
          <PhoneFrame theme={theme} initial="validation" initialRole="client" />
          <PhoneFrame theme={theme} initial="escrow-release" initialRole="client" />
          <PhoneFrame theme={theme} initial="rating" initialRole="client" />
          <PhoneFrame theme={theme} initial="invoice" initialRole="client" />
          <PhoneFrame theme={theme} initial="dispute" initialRole="client" />
          <PhoneFrame theme={theme} initial="cancel" initialRole="client" />
        </DCSection>

        <DCSection title="Portefeuille">
          <PhoneFrame theme={theme} initial="wallet" initialRole="client" />
          <PhoneFrame theme={theme} initial="wallet-topup" initialRole="client" />
          <PhoneFrame theme={theme} initial="wallet-withdraw" initialRole="client" />
          <PhoneFrame theme={theme} initial="wallet-otp" initialRole="client" />
          <PhoneFrame theme={theme} initial="tx-detail" initialRole="client" />
        </DCSection>

        <DCSection title="Rôle technicien">
          <PhoneFrame theme={theme} initial="tech-home" initialRole="tech" />
          <PhoneFrame theme={theme} initial="inbox" initialRole="tech" />
          <PhoneFrame theme={theme} initial="diagnostic-report-tech" initialRole="tech" />
        </DCSection>

        <DCSection title="Rapports & facturation">
          <PhoneFrame theme={theme} initial="diagnostic-report" initialRole="tech" />
          <PhoneFrame theme={theme} initial="quote" initialRole="tech" />
          <PhoneFrame theme={theme} initial="invoice" initialRole="tech" />
        </DCSection>

        <DCSection title="Vérification KYC">
          <PhoneFrame theme={theme} initial="kyc-start" initialRole="tech" />
          <PhoneFrame theme={theme} initial="kyc-scan" initialRole="tech" />
          <PhoneFrame theme={theme} initial="kyc-selfie" initialRole="tech" />
          <PhoneFrame theme={theme} initial="kyc-pending" initialRole="tech" />
          <PhoneFrame theme={theme} initial="kyc-rejected" initialRole="tech" />
          <PhoneFrame theme={theme} initial="tech-onboarding" initialRole="tech" />
        </DCSection>

        <DCSection title="Retours & litiges">
          <PhoneFrame theme={theme} initial="rating" initialRole="client" />
          <PhoneFrame theme={theme} initial="dispute" initialRole="client" />
          <PhoneFrame theme={theme} initial="cancel" initialRole="client" />
        </DCSection>

        <DCSection title="Flux portefeuille détaillé">
          <PhoneFrame theme={theme} initial="wallet-topup" initialRole="tech" />
          <PhoneFrame theme={theme} initial="wallet-otp" initialRole="tech" />
        </DCSection>

        <DCSection title="Fil social">
          <PhoneFrame theme={theme} initial="feed" initialRole="client" />
          <PhoneFrame theme={theme} initial="create-post" initialRole="client" />
          <PhoneFrame theme={theme} initial="post-detail" initialRole="client" />
        </DCSection>

        <DCSection title="Planning">
          <PhoneFrame theme={theme} initial="planning-week" initialRole="tech" />
          <PhoneFrame theme={theme} initial="leave-request" initialRole="tech" />
          <PhoneFrame theme={theme} initial="availability" initialRole="tech" />
        </DCSection>

        <DCSection title="Agence">
          <PhoneFrame theme={theme} initial="agency-dashboard" initialRole="agency" />
          <PhoneFrame theme={theme} initial="agency-team" initialRole="agency" />
          <PhoneFrame theme={theme} initial="assign-job" initialRole="agency" />
        </DCSection>

        <DCSection title="Réputation">
          <PhoneFrame theme={theme} initial="reputation" initialRole="tech" />
          <PhoneFrame theme={theme} initial="badge-detail" initialRole="tech" />
          <PhoneFrame theme={theme} initial="leaderboard" initialRole="tech" />
        </DCSection>

        <DCSection title="Système">
          <PhoneFrame theme={theme} initial="notifications" initialRole="client" />
          <PhoneFrame theme={theme} initial="empty-requests" initialRole="client" />
          <PhoneFrame theme={theme} initial="empty-search" initialRole="client" />
          <PhoneFrame theme={theme} initial="empty-chat" initialRole="client" />
          <PhoneFrame theme={theme} initial="empty-wallet" initialRole="client" />
          <PhoneFrame theme={theme} initial="empty-notifications" initialRole="client" />
          <PhoneFrame theme={theme} initial="empty-error" initialRole="client" />
          <PhoneFrame theme={theme} initial="toasts" initialRole="client" />
        </DCSection>
      </DesignCanvas>

      <TweaksPanel dark={theme._t.dark}>
        <TweakSection title="Apparence">
          <TweakRow label="Mode sombre"><TweakToggle value={tweaks.dark} onChange={(v) => setTweak('dark', v)} /></TweakRow>
          <TweakRow label="Accent"><TweakSelect value={tweaks.accent} onChange={(v) => setTweak('accent', v)} options={[{ value: 'red', label: 'Bleu Reliance' }, { value: 'blue', label: 'Bleu' }, { value: 'amber', label: 'Bleu clair' }, { value: 'green', label: 'Bleu nuit' }, { value: 'emerald', label: 'Cyan' }]} /></TweakRow>
          <TweakRow label="Police"><TweakSelect value={tweaks.font} onChange={(v) => setTweak('font', v)} options={[{ value: 'bricolage', label: 'Bricolage' }, { value: 'helvetica', label: 'Helvetica' }, { value: 'serif', label: 'Serif' }, { value: 'mono', label: 'Mono' }]} /></TweakRow>
          <TweakRow label="Densité"><TweakRadio value={tweaks.density} onChange={(v) => setTweak('density', v)} options={[{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Normal' }, { value: 'comfy', label: 'Confort' }]} /></TweakRow>
        </TweakSection>
        <TweakSection title="Vue">
          <TweakButton label="Prototype plein écran" onClick={() => setTweak('view', 'prototype')} />
        </TweakSection>
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);