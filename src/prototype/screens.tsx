import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import type { UploadFile } from '@/core/api';

import { AgencyDashboardView, AssignView, TeamView } from '@/features/agency';
import { ForgotPasswordView, LoginView, OnboardingView, RoleSelectView } from '@/features/auth';
import { InvoiceView, QuoteView } from '@/features/billing';
import { ChatView, InboxView, type ChatItem } from '@/features/chat';
import { MapView, SearchView, TechProfileView } from '@/features/directory';
import { DisputeView } from '@/features/disputes';
import { KycCaptureView, KycStartView, KycStatusView, type KycShot } from '@/features/kyc';
import { MatchingView } from '@/features/matching';
import {
  CancelView,
  MissionClosedView,
  TechHomeView,
  TrackingView,
  ValidationView,
} from '@/features/missions';
import { NotificationSettingsView, NotificationsView } from '@/features/notifications';
import { AvailabilityView, BlockAgendaView, PlanningWeekView } from '@/features/planning';
import { AccountView, TechOnboardingView } from '@/features/profile';
import { ClientHomeView, DiagnosticView, NewRequestView } from '@/features/requests';
import { BadgeView, LeaderboardView, RatingView, ReputationView } from '@/features/reviews';
import { ComposeView, FeedView, PostView } from '@/features/social';
import { MoneyFlowView, OtpView, TransactionView, WalletView } from '@/features/wallet';
import { pickImage } from '@/shared/media';
import { useToast } from '@/shared/ui';
import notificationsFixture from '@/test/fixtures/notifications/notifications.json';

import { WebOnlyView } from '../bootstrap/screens/WebOnlyView';
import { EmptyStatesGallery, ToastsGallery } from './galleries';
import {
  ACTIVE,
  CANCEL_REASONS,
  CATEGORIES,
  CHAT,
  CHECKS,
  CLIENT,
  CONVERSATIONS,
  DIAGNOSTIC,
  DISPUTE_REASONS,
  INVOICE,
  NEGATIVE_TAGS,
  PHASES,
  POSITIVE_TAGS,
  QUOTE,
  REVIEWS,
  TECHS,
  techProfile,
  WORKS,
} from './sample';
import {
  accountGroups,
  AGENDA,
  AVAILABILITY,
  BADGES,
  COMMENTS,
  DAY_NAMES,
  EVENTS,
  HOLDS,
  INCOMING,
  JOBS,
  LEADERS,
  MOVEMENTS,
  ONBOARDING,
  POSTS,
  RANKS,
  SKILL_OPTIONS,
  SOURCES,
  TEAM,
  TRANSACTION,
} from './sampleMore';

export type ProtoRole = 'client' | 'technicien' | 'agence';

interface ProtoState {
  role: ProtoRole;
  setRole: (role: ProtoRole) => void;
  liked: ReadonlySet<string>;
  toggleLike: (id: string) => void;
}

const ProtoContext = createContext<ProtoState | null>(null);

/** État partagé du prototype : rôle choisi et quelques interactions mémorisées. */
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<ProtoRole>('client');
  const [liked, setLiked] = useState<ReadonlySet<string>>(new Set());
  const value = useMemo(
    () => ({
      role,
      setRole,
      liked,
      toggleLike: (id: string) =>
        setLiked((current) => {
          const next = new Set(current);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
    }),
    [role, liked],
  );
  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>;
}

export function useProto(): ProtoState {
  const state = useContext(ProtoContext);
  if (!state) throw new Error('useProto exige un PrototypeProvider.');
  return state;
}

/** Racine des onglets de chaque rôle. */
export const ROLE_HOME: Record<ProtoRole, string> = {
  client: '/prototype/client',
  technicien: '/prototype/tech',
  agence: '/prototype/agency',
};

/** Navigation du prototype : écrans empilés par nom, onglets par chemin. */
function useGo() {
  const router = useRouter();
  return {
    to: (screen: string, params: Record<string, string> = {}) => {
      const query = new URLSearchParams(params).toString();
      router.push(`/prototype/${screen}${query ? `?${query}` : ''}` as Href);
    },
    replace: (path: string) => router.replace(path as Href),
    back: () => (router.canGoBack() ? router.back() : router.replace('/prototype' as Href)),
  };
}

const noop = () => undefined;
const pickFrom = (source: 'library' | 'camera') => async (): Promise<UploadFile | null> => {
  const result = await pickImage(source);
  return result.status === 'picked' ? result.file : null;
};

/** Écran du prototype désigné par son nom. */
export function PrototypeScreen({ name }: { name: string }): ReactElement {
  const go = useGo();
  const proto = useProto();
  const toast = useToast();
  const params = useLocalSearchParams<Record<string, string>>();
  const tech = TECHS.find((item) => item.id === params.id) ?? TECHS[0]!;
  const home = () => go.replace(ROLE_HOME[proto.role]);
  const [chat, setChat] = useState<readonly ChatItem[]>(CHAT);
  const [loginStep, setLoginStep] = useState<'credentials' | 'twoFactor'>('credentials');
  const [forgotSent, setForgotSent] = useState(false);
  const [photo, setPhoto] = useState<UploadFile | null>(null);
  const [channels, setChannels] = useState({ in_app: true, push: true, email: false, sms: true });
  const [query, setQuery] = useState(params.q ?? '');

  switch (name) {
    // ── Accès ────────────────────────────────────────────────────────────────────
    case 'onboarding':
      return <OnboardingView onFinish={() => go.to('role')} onSkip={() => go.to('login')} />;
    case 'role':
      return (
        <RoleSelectView
          onSelect={(role) => {
            proto.setRole(role);
            go.to('login');
          }}
          onSignIn={() => go.to('login')}
        />
      );
    case 'login':
      return (
        <LoginView
          step={loginStep}
          submitting={false}
          onSubmitCredentials={(values) =>
            values.email.includes('2fa') ? setLoginStep('twoFactor') : home()
          }
          onSubmitCode={home}
          onBackToCredentials={() => setLoginStep('credentials')}
          onForgotPassword={() => go.to('forgot')}
          onRegister={() =>
            toast.show({
              kind: 'info',
              title: 'Inscription',
              body: 'Ouvre la page d’inscription du site web.',
            })
          }
          onBack={go.back}
        />
      );
    case 'forgot':
      return (
        <ForgotPasswordView
          status={forgotSent ? 'sent' : 'form'}
          submitting={false}
          onSubmit={() => setForgotSent(true)}
          onBack={go.back}
        />
      );
    case 'web-only':
      return <WebOnlyView reason="admin" onLogout={() => go.replace('/prototype')} />;

    // ── Client ───────────────────────────────────────────────────────────────────
    case 'client-home':
      return (
        <ClientHomeView
          firstName={CLIENT.firstName}
          hasUnreadNotifications
          categories={CATEGORIES}
          nearby={{ count: 12, area: 'Quartier Bastos · 2 km autour' }}
          recommended={TECHS}
          active={ACTIVE}
          onNotifications={() => go.to('notifications')}
          onNewRequest={() => go.to('new-request')}
          onCategory={(slug) => go.to('new-request', { category: slug })}
          onAllCategories={() => go.to('search')}
          onMap={() => go.replace('/prototype/client/map')}
          onTech={(item) => go.to('tech', { id: item.id })}
          onAllTechs={() => go.to('search')}
          onOpenActive={() => go.to('tracking')}
          onChatActive={() => go.to('chat')}
        />
      );
    case 'map':
      return (
        <MapView
          withTabBar
          technicians={TECHS}
          searchLabel="Plombier près de Bastos"
          onSearch={() => go.to('search')}
          onFilters={() => go.to('search')}
          onViewProfile={(item) => go.to('tech', { id: item.id })}
        />
      );
    case 'search':
      return (
        <SearchView
          query={query}
          onQueryChange={setQuery}
          onSubmit={noop}
          filters={[
            { key: 'pros', label: 'Pros', selected: true },
            { key: 'services', label: 'Services', selected: false },
            { key: 'quartier', label: 'Quartier', selected: false },
          ]}
          onToggleFilter={noop}
          onClearFilters={noop}
          recent={['Plombier urgence', 'Climatisation', 'Tarif disjoncteur']}
          onPickRecent={setQuery}
          onClearRecent={noop}
          status="ready"
          results={TECHS.filter((item) =>
            item.name.toLowerCase().includes(query.trim().toLowerCase()),
          ).map((item) => ({
            id: item.id,
            kind: 'pro' as const,
            title: item.name,
            subtitle: `${item.skill} · ★ ${String(item.rating).replace('.', ',')}`,
          }))}
          onRetry={noop}
          onOpenResult={(result) => go.to('tech', { id: result.id })}
          onBack={go.back}
        />
      );
    case 'tech':
      return (
        <TechProfileView
          tech={techProfile(tech)}
          works={WORKS}
          reviews={REVIEWS}
          onBack={go.back}
          onMessage={() => go.to('chat')}
          onBook={() => go.to('new-request')}
        />
      );
    case 'new-request':
      return (
        <NewRequestView
          categories={CATEGORIES}
          initialCategory={params.category}
          place={{ label: 'Bastos, rue 1.842', detail: 'Yaoundé · position GPS détectée' }}
          estimate={{ range: '6 000 — 12 000 FCFA', note: 'Difficulté faible' }}
          submitting={false}
          onLocate={noop}
          onPickPhoto={pickFrom('library')}
          onSubmit={() => go.to('matching')}
          onBack={go.back}
        />
      );
    case 'matching':
      return (
        <MatchingDemo
          onChoose={(item) => go.to('tracking', { id: item.id })}
          onViewProfile={(item) => go.to('tech', { id: item.id })}
          onClose={home}
        />
      );
    case 'tracking':
      return (
        <TrackingView
          technician={{ name: tech.name, skill: tech.skill, color: tech.color }}
          reference="Réf. #M-2847"
          phases={PHASES}
          eta={{ minutes: 8, detail: `${tech.name.split(' ')[0]} est à 1,2 km · trafic fluide` }}
          escrow={{
            amount: 12500,
            progress: 0.4,
            spent: 'Diagnostic 5 000',
            remaining: '+ réparation estimée 7 500',
          }}
          primaryAction={{ label: 'Voir le diagnostic', onPress: () => go.to('diagnostic') }}
          onBack={go.back}
          onChat={() => go.to('chat')}
          onCall={noop}
        />
      );
    case 'chat':
      return (
        <ChatView
          contact={{ name: tech.name, online: true, context: 'Mission #M-2847' }}
          items={chat}
          onBack={go.back}
          onCall={noop}
          onSend={(text) =>
            setChat((current) => [
              ...current,
              { kind: 'message', id: `m${current.length}`, mine: true, text },
            ])
          }
          onAcceptQuote={() => go.to('quote')}
          onRejectQuote={noop}
        />
      );
    case 'diagnostic':
      return (
        <DiagnosticView
          mode="client"
          report={DIAGNOSTIC}
          onBack={go.back}
          onPrimary={() => go.to('quote')}
          onReject={() => go.to('dispute')}
        />
      );
    case 'quote':
      return (
        <QuoteView
          quote={QUOTE}
          onBack={go.back}
          onAccept={() => {
            toast.show({
              kind: 'success',
              title: 'Devis accepté',
              body: '7 875 FCFA placés en séquestre.',
            });
            go.to('validation');
          }}
          onReject={go.back}
        />
      );
    case 'validation':
      return (
        <ValidationView
          technicianName={tech.name}
          phaseLabel="Phase 4/4"
          finishedAt="14 h 47 · durée 38 min"
          photos={{ before: 'avant', after: 'après' }}
          checks={CHECKS}
          releaseAmount={12500}
          onBack={go.back}
          onValidate={() => go.to('closed')}
          onDispute={() => go.to('dispute')}
        />
      );
    case 'closed':
      return (
        <MissionClosedView
          technicianName={tech.name}
          reference="Mission #M-2847"
          summary="Fuite siphon · 38 min"
          amount={12500}
          onRate={() => go.to('rating')}
          onInvoice={() => go.to('invoice')}
          onHome={home}
        />
      );
    case 'invoice':
      return (
        <InvoiceView
          invoice={INVOICE}
          onBack={go.back}
          onDownload={() => toast.show({ kind: 'success', title: 'Facture téléchargée' })}
          onShare={noop}
        />
      );
    case 'rating':
      return (
        <RatingView
          technicianName={tech.name}
          missionSummary="Plomberie · 38 min · 12 500 FCFA"
          positiveTags={POSITIVE_TAGS}
          negativeTags={NEGATIVE_TAGS}
          onBack={go.back}
          onLater={home}
          onSubmit={() => {
            toast.show({
              kind: 'badge',
              title: 'Merci pour votre avis',
              body: 'Il aide la communauté.',
            });
            home();
          }}
        />
      );
    case 'dispute':
      return (
        <DisputeView
          mission={{
            technicianName: tech.name,
            detail: tech.skill,
            reference: 'Mission #INT-2847',
            held: 28500,
          }}
          reasons={DISPUTE_REASONS}
          onPickPhoto={pickFrom('library')}
          onCancel={go.back}
          onSubmit={() => {
            toast.show({
              kind: 'warning',
              title: 'Litige ouvert',
              body: 'Notre équipe intervient sous 4 h.',
            });
            home();
          }}
        />
      );
    case 'cancel':
      return (
        <CancelView
          technician={{
            name: tech.name,
            detail: `Arrive dans environ 12 min · ${tech.skill}`,
            statusLabel: 'En route',
          }}
          reasons={CANCEL_REASONS}
          refund={{ held: 28500, fee: 1500 }}
          onBack={go.back}
          onConfirm={home}
        />
      );

    // ── Système ──────────────────────────────────────────────────────────────────
    case 'notifications':
      return (
        <NotificationsView
          status="ready"
          notifications={notificationsFixture.data}
          now={new Date(notificationsFixture.data[0]?.created_at ?? '2026-10-06T20:00:00Z')}
          onBack={go.back}
          onRetry={noop}
          onMarkAll={() => toast.show({ kind: 'success', title: 'Tout est lu' })}
          onOpen={() => go.to('tracking')}
        />
      );
    case 'notification-settings':
      return (
        <NotificationSettingsView
          status="ready"
          channels={channels}
          dirty
          saving={false}
          onToggle={(channel, value) =>
            setChannels((current) => ({ ...current, [channel]: value }))
          }
          onSave={() => {
            toast.show({ kind: 'success', title: 'Préférences enregistrées' });
            go.back();
          }}
          onRetry={noop}
          onBack={go.back}
        />
      );
    case 'states':
      return <EmptyStatesGallery onClose={go.back} />;
    case 'toasts':
      return <ToastsGallery onClose={go.back} />;
    case 'inbox':
      return (
        <InboxView
          conversations={CONVERSATIONS}
          onOpen={(conversation) =>
            go.to('chat', { id: TECHS.find((item) => item.name === conversation.name)?.id ?? 't1' })
          }
        />
      );
    case 'account':
      return (
        <AccountView
          name={
            proto.role === 'technicien'
              ? 'Paul Mvondo'
              : proto.role === 'agence'
                ? 'Agence Mvondo & Fils'
                : CLIENT.fullName
          }
          email="compte@exemple.cm"
          badges={[
            { label: 'KYC', tone: 'success', icon: 'shield' },
            { label: proto.role === 'client' ? 'Client' : 'Membre Pro', tone: 'primary' },
          ]}
          groups={accountGroups(proto.role)}
          version="Reliance 1.0.0 · prototype"
          onItem={(key) => {
            const target: Record<string, string> = {
              notifications: 'notification-settings',
              security: 'login',
              kyc: 'kyc',
              planning: 'planning',
              reputation: 'reputation',
              setup: 'tech-onboarding',
              feed: 'feed',
              invoice: 'invoice',
              states: 'states',
              toasts: 'toasts',
            };
            if (target[key]) go.to(target[key]!);
            else
              toast.show({
                kind: 'info',
                title: 'Écran sans maquette',
                body: 'Il sera décliné au lot suivant.',
              });
          }}
          onLogout={() => go.replace('/prototype')}
        />
      );

    // ── Technicien ───────────────────────────────────────────────────────────────
    case 'tech-home':
      return (
        <TechHomeView
          firstName="Paul M."
          online
          today={{ earnings: 32500, missions: 4, rating: '5,0', time: '2 h 12' }}
          incoming={INCOMING}
          agenda={AGENDA}
          onNotifications={() => go.to('notifications')}
          onAccept={() => go.to('tech-diagnostic')}
          onDecline={() => toast.show({ kind: 'info', title: 'Demande déclinée' })}
          onOpenSlot={() => go.to('tracking')}
          onPlanning={() => go.to('planning')}
        />
      );
    case 'tech-diagnostic':
      return (
        <DiagnosticView
          mode="technician"
          report={DIAGNOSTIC}
          onBack={go.back}
          onPrimary={() => {
            toast.show({ kind: 'success', title: 'Diagnostic envoyé au client' });
            go.back();
          }}
        />
      );
    case 'kyc':
      return (
        <KycStartView
          onSelect={(document) => go.to('kyc-capture', { document, shot: 'front' })}
          onBack={go.back}
        />
      );
    case 'kyc-capture': {
      const shot = (params.shot ?? 'front') as KycShot;
      const nextShot: KycShot | null =
        shot === 'front' && params.document !== 'passport'
          ? 'back'
          : shot === 'selfie'
            ? null
            : 'selfie';
      return (
        <KycCaptureView
          shot={shot}
          step={shot === 'selfie' ? 3 : 2}
          photo={photo}
          onCapture={pickFrom('camera')}
          onPhoto={setPhoto}
          onNext={() =>
            nextShot
              ? go.to('kyc-capture', { document: params.document ?? 'cni', shot: nextShot })
              : go.to('kyc-status', { status: 'pending' })
          }
          onBack={go.back}
        />
      );
    }
    case 'kyc-status':
      return params.status === 'rejected' ? (
        <KycStatusView
          status="rejected"
          items={[
            { label: 'Document flou', detail: 'Recto de la carte illisible', icon: 'image' },
            {
              label: 'Selfie non concordant',
              detail: 'Le visage ne correspond pas au document',
              icon: 'user',
            },
          ]}
          onContinue={() => go.to('kyc')}
          onSupport={() => go.to('chat')}
        />
      ) : (
        <KycStatusView
          status="pending"
          items={[
            { label: 'Documents reçus', detail: 'Aujourd’hui à 14:32', state: 'done' },
            { label: 'Examen visuel', detail: 'Automatique', state: 'active' },
            { label: 'Validation manuelle', detail: 'Sous 24 h', state: 'todo' },
            { label: 'Compte vérifié', detail: 'Vous serez notifié', state: 'todo' },
          ]}
          onContinue={home}
        />
      );
    case 'tech-onboarding':
      return (
        <TechOnboardingView
          initial={ONBOARDING}
          skillOptions={SKILL_OPTIONS}
          onBack={go.back}
          onSubmit={() => go.to('kyc-status', { status: 'pending' })}
        />
      );
    case 'planning':
      return (
        <PlanningWeekView
          weekLabel="Semaine 12 · mars 2026"
          dayLabels={['L', 'M', 'M', 'J', 'V', 'S', 'D']}
          todayIndex={2}
          stats={[
            { label: 'Missions', value: '5', detail: '+2' },
            { label: 'Heures', value: '14 h', detail: '/40 h' },
            { label: 'Gains', value: '87 k', detail: 'FCFA' },
          ]}
          events={EVENTS}
          onBack={go.back}
          onPreviousWeek={noop}
          onNextWeek={noop}
          onEvent={() => go.to('tracking')}
          onBlock={() => go.to('block')}
          onAvailability={() => go.to('availability')}
        />
      );
    case 'block':
      return (
        <BlockAgendaView
          initial={{
            reason: 'vacation',
            from: '2026-03-19',
            to: '2026-03-21',
            allDay: true,
            note: '',
          }}
          onCancel={go.back}
          onSubmit={(values) => {
            toast.show({
              kind: 'success',
              title: 'Agenda bloqué',
              body: `${values.from} → ${values.to}`,
            });
            go.back();
          }}
        />
      );
    case 'availability':
      return (
        <AvailabilityView
          dayNames={DAY_NAMES}
          initial={AVAILABILITY}
          onBack={go.back}
          onSave={() => {
            toast.show({ kind: 'success', title: 'Disponibilités enregistrées' });
            go.back();
          }}
        />
      );
    case 'reputation':
      return (
        <ReputationView
          name="Paul Mvondo"
          points={1820}
          ranks={RANKS}
          stats={[
            { value: '67', label: 'missions', detail: '+12 ce mois' },
            { value: '4,93', label: 'note moyenne', detail: 'sur 5 · 58 avis' },
            { value: '23 min', label: 'arrivée moyenne', detail: 'top 8 % à Yaoundé' },
            { value: '0', label: 'litige', detail: '12 mois sans incident' },
          ]}
          badges={BADGES}
          onBack={go.back}
          onBadge={(badge) => go.to('badge', { id: badge.id })}
          onLeaderboard={() => go.to('leaderboard')}
        />
      );
    case 'badge': {
      const badge = BADGES.find((item) => item.id === params.id) ?? BADGES[3]!;
      return (
        <BadgeView
          badge={badge}
          facts={[
            { label: 'Obtenu le', value: badge.earnedOn ?? '—' },
            { label: 'Rareté', value: '4,2 % des pros Reliance' },
          ]}
          onBack={go.back}
        />
      );
    }
    case 'leaderboard':
      return (
        <LeaderboardView
          area="Bastos · 30 derniers jours"
          entries={LEADERS}
          onBack={go.back}
          onOpen={() => go.to('tech')}
        />
      );

    // ── Finances ─────────────────────────────────────────────────────────────────
    case 'wallet':
      return (
        <WalletView
          balance={48750}
          holds={HOLDS}
          sources={SOURCES}
          movements={MOVEMENTS}
          onTopUp={() => go.to('top-up')}
          onWithdraw={() => go.to('withdraw')}
          onMovement={() => go.to('transaction')}
        />
      );
    case 'top-up':
    case 'withdraw':
      return (
        <MoneyFlowView
          mode={name === 'withdraw' ? 'withdraw' : 'topUp'}
          balance={48750}
          sources={SOURCES}
          presets={[5000, 10000, 25000, 50000]}
          feeOf={(amount) =>
            name === 'withdraw'
              ? Math.max(200, Math.round(amount * 0.005))
              : Math.round(amount * 0.01)
          }
          onBack={go.back}
          onSubmit={() => go.to('otp')}
        />
      );
    case 'otp':
      return (
        <OtpView
          destination="+237 6 99 ** ** 56"
          onBack={go.back}
          onResend={noop}
          onComplete={() => {
            toast.show({ kind: 'success', title: 'Opération confirmée' });
            go.replace(`${ROLE_HOME[proto.role]}/wallet`);
          }}
        />
      );
    case 'transaction':
      return (
        <TransactionView
          transaction={TRANSACTION}
          onBack={go.back}
          onReceipt={noop}
          onReport={() => go.to('dispute')}
        />
      );

    // ── Communauté ───────────────────────────────────────────────────────────────
    case 'feed':
      return (
        <FeedView
          posts={POSTS}
          liked={proto.liked}
          onLike={(post) => proto.toggleLike(post.id)}
          onOpen={(post) => go.to('post', { id: post.id })}
          onCompose={() => go.to('compose')}
          onBack={go.back}
        />
      );
    case 'post': {
      const post = POSTS.find((item) => item.id === params.id) ?? POSTS[0]!;
      return (
        <PostView
          post={post}
          liked={proto.liked.has(post.id)}
          comments={COMMENTS}
          onBack={go.back}
          onLike={() => proto.toggleLike(post.id)}
          onComment={noop}
        />
      );
    }
    case 'compose':
      return (
        <ComposeView
          author={proto.role === 'client' ? CLIENT.fullName : 'Paul Mvondo'}
          suggestedTags={['#avantapres', '#plomberie', '#bastos', '#astuce']}
          onCancel={go.back}
          onPublish={() => {
            toast.show({ kind: 'success', title: 'Publication en ligne' });
            go.back();
          }}
        />
      );

    // ── Agence ───────────────────────────────────────────────────────────────────
    case 'agency-home':
      return (
        <AgencyDashboardView
          agencyName="Mvondo & Fils"
          stats={[
            { label: 'Missions du jour', value: '14', detail: '+3 par rapport à hier' },
            { label: 'Équipe active', value: '4/6', detail: '67 %' },
            { label: 'Chiffre du jour', value: '342 k', detail: '+12 %' },
            { label: 'Note moyenne', value: '4,85', detail: '30 jours' },
          ]}
          alerts={[{ id: 'kyc', message: 'Le KYC de Junior B. expire dans 14 jours' }]}
          jobs={JOBS}
          team={TEAM}
          onTeam={() => go.replace('/prototype/agency/team')}
          onAssign={(job) => go.to('assign', { id: job.id })}
          onMember={(member) =>
            go.to('tech', { id: TECHS.find((item) => item.name === member.name)?.id ?? 't1' })
          }
        />
      );
    case 'team':
      return (
        <TeamView
          members={TEAM}
          onBack={() => go.replace('/prototype/agency')}
          onMember={() => go.to('tech')}
          onAdd={() => go.to('tech-onboarding')}
        />
      );
    case 'assign': {
      const job = JOBS.find((item) => item.id === params.id) ?? JOBS[0]!;
      return (
        <AssignView
          job={job}
          members={TEAM}
          onBack={go.back}
          onAssign={(member) => {
            toast.show({
              kind: 'success',
              title: 'Mission affectée',
              body: `${job.service} → ${member.name}`,
            });
            go.back();
          }}
        />
      );
    }
    default:
      return <WebOnlyView reason="unknown" onLogout={() => go.replace('/prototype')} />;
  }
}

/** Rapprochement simulé : recherche animée deux secondes, puis résultats. */
function MatchingDemo(props: {
  onChoose: (tech: (typeof TECHS)[number]) => void;
  onViewProfile: (tech: (typeof TECHS)[number]) => void;
  onClose: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return undefined;
    const timer = setTimeout(() => setReady(true), 2200);
    return () => clearTimeout(timer);
  }, [ready]);
  return (
    <MatchingView
      status={ready ? 'ready' : 'searching'}
      technicians={TECHS}
      onChoose={props.onChoose}
      onViewProfile={props.onViewProfile}
      onRetry={() => setReady(false)}
      onClose={props.onClose}
    />
  );
}
