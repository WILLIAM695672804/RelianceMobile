import { screen, userEvent } from '@testing-library/react-native';

import { billingTranslations, InvoiceView, QuoteView } from '@/features/billing';
import { ChatView, chatTranslations, InboxView } from '@/features/chat';
import { DisputeView, disputesTranslations } from '@/features/disputes';
import { DiagnosticView, requestsTranslations } from '@/features/requests';
import { RatingView, reviewsTranslations } from '@/features/reviews';
import {
  CANCEL_REASONS,
  CHAT,
  CHECKS,
  CONVERSATIONS,
  DIAGNOSTIC,
  DISPUTE_REASONS,
  INVOICE,
  NEGATIVE_TAGS,
  PHASES,
  POSITIVE_TAGS,
  QUOTE,
} from '@/prototype/sample';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';

import { CancelView, MissionClosedView, ValidationView } from './CompletionViews';
import { TrackingView } from './TrackingView';

const translations = [
  missionsTranslations,
  requestsTranslations,
  billingTranslations,
  reviewsTranslations,
  disputesTranslations,
  chatTranslations,
];
const render = (ui: React.ReactElement) => renderWithProviders(ui, { translations });

describe('parcours d’intervention', () => {
  it('suit l’intervention et propose l’étape suivante', async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    await render(
      <TrackingView
        technician={{ name: 'Paul Mvondo', skill: 'Plomberie' }}
        reference="Réf. #M-2847"
        phases={PHASES}
        eta={{ minutes: 8, detail: 'Paul est à 1,2 km' }}
        escrow={{
          amount: 12500,
          progress: 0.4,
          spent: 'Diagnostic 5 000',
          remaining: '+ réparation 7 500',
        }}
        primaryAction={{ label: 'Voir le diagnostic', onPress: onNext }}
        onBack={jest.fn()}
        onChat={jest.fn()}
      />,
    );
    expect(screen.getByText('Dans 8 minutes')).toBeOnTheScreen();
    expect(
      screen.getByLabelText(/En route\. Arrivée prévue dans 8 min\. en cours/),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Voir le diagnostic' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('lit le diagnostic côté client et demande un devis', async () => {
    const user = userEvent.setup();
    const onPrimary = jest.fn();
    await render(
      <DiagnosticView
        mode="client"
        report={DIAGNOSTIC}
        onBack={jest.fn()}
        onPrimary={onPrimary}
        onReject={jest.fn()}
      />,
    );
    expect(screen.getByText('7 500 FCFA')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Demander un devis' }));
    expect(onPrimary).toHaveBeenCalledWith(DIAGNOSTIC.findings);
  });

  it('n’accepte le devis qu’après l’accord sur les conditions', async () => {
    const user = userEvent.setup();
    const onAccept = jest.fn();
    await render(
      <QuoteView quote={QUOTE} onBack={jest.fn()} onAccept={onAccept} onReject={jest.fn()} />,
    );
    expect(screen.getByText('7 875 FCFA')).toBeOnTheScreen();
    const accept = screen.getByRole('button', { name: 'Signer et bloquer le séquestre' });
    expect(accept).toBeDisabled();
    await user.press(screen.getByRole('checkbox'));
    await user.press(accept);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('présente la facture', async () => {
    await render(<InvoiceView invoice={INVOICE} onBack={jest.fn()} onDownload={jest.fn()} />);
    expect(screen.getByRole('header', { name: 'FAC-2026-0847' })).toBeOnTheScreen();
    expect(screen.getByText('Payée')).toBeOnTheScreen();
    expect(screen.getByText('7 875 FCFA')).toBeOnTheScreen();
  });

  it('bloque la validation tant qu’une vérification est décochée', async () => {
    const user = userEvent.setup();
    const onValidate = jest.fn();
    await render(
      <ValidationView
        technicianName="Paul Mvondo"
        phaseLabel="Phase 4/4"
        finishedAt="14 h 47 · 38 min"
        photos={{ before: 'avant', after: 'après' }}
        checks={CHECKS}
        releaseAmount={12500}
        onBack={jest.fn()}
        onValidate={onValidate}
        onDispute={jest.fn()}
      />,
    );
    const validate = screen.getByRole('button', { name: 'Valider et libérer' });
    await user.press(screen.getByRole('checkbox', { name: 'Espace propre et rangé' }));
    expect(validate).toBeDisabled();
    await user.press(screen.getByRole('checkbox', { name: 'Espace propre et rangé' }));
    await user.press(validate);
    expect(onValidate).toHaveBeenCalledTimes(1);
  });

  it('célèbre la clôture et mène à la notation', async () => {
    const user = userEvent.setup();
    const onRate = jest.fn();
    await render(
      <MissionClosedView
        technicianName="Paul Mvondo"
        reference="Mission #M-2847"
        summary="Fuite siphon · 38 min"
        amount={12500}
        onRate={onRate}
        onInvoice={jest.fn()}
        onHome={jest.fn()}
      />,
    );
    expect(screen.getByRole('header', { name: 'Fonds libérés !' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Noter le technicien' }));
    expect(onRate).toHaveBeenCalledTimes(1);
  });

  it('annule en deux temps avec le détail du remboursement', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    await render(
      <CancelView
        technician={{
          name: 'Paul Mvondo',
          detail: 'Arrive dans environ 12 min',
          statusLabel: 'En route',
        }}
        reasons={CANCEL_REASONS}
        refund={{ held: 28500, fee: 1500 }}
        onBack={jest.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled();
    await user.press(screen.getByRole('radio', { name: 'Le technicien est en retard' }));
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText('27 000 FCFA')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Confirmer l’annulation' }));
    expect(onConfirm).toHaveBeenCalledWith('late');
  });

  it('note la mission avec des étiquettes adaptées à la note', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    await render(
      <RatingView
        technicianName="Paul Mvondo"
        missionSummary="Plomberie · 38 min"
        positiveTags={POSITIVE_TAGS}
        negativeTags={NEGATIVE_TAGS}
        onBack={jest.fn()}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByRole('button', { name: 'Envoyer la note' })).toBeDisabled();
    await user.press(screen.getByRole('radio', { name: '2 étoiles' }));
    expect(screen.getByText('Qu’est-ce qui n’a pas marché ?')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: '5 étoiles' }));
    await user.press(screen.getByRole('button', { name: 'Ponctuel' }));
    await user.press(screen.getByRole('button', { name: 'Envoyer la note' }));
    expect(onSubmit).toHaveBeenCalledWith({ rating: 5, tags: ['Ponctuel'], comment: '' });
  });

  it('ouvre un litige avec un motif reconnu par le serveur', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    await render(
      <DisputeView
        mission={{
          technicianName: 'Paul Mvondo',
          detail: 'Plomberie',
          reference: 'Mission #INT-2847',
          held: 28500,
        }}
        reasons={DISPUTE_REASONS}
        onPickPhoto={jest.fn(async () => null)}
        onCancel={jest.fn()}
        onSubmit={onSubmit}
      />,
    );
    await user.press(screen.getByRole('radio', { name: 'Facturation abusive' }));
    await user.type(screen.getByLabelText('Décrivez la situation'), 'Montant doublé.');
    await user.press(screen.getByRole('button', { name: 'Ouvrir le litige' }));
    expect(onSubmit).toHaveBeenCalledWith({
      reason: 'amount',
      details: 'Montant doublé.',
      photos: [],
    });
  });

  it('converse et accepte le devis depuis la conversation', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    const onAcceptQuote = jest.fn();
    await render(
      <ChatView
        contact={{ name: 'Paul Mvondo', online: true, context: 'Mission #M-2847' }}
        items={CHAT}
        onBack={jest.fn()}
        onSend={onSend}
        onAcceptQuote={onAcceptQuote}
      />,
    );
    await user.type(screen.getByLabelText('Message'), 'Merci !');
    await user.press(screen.getByRole('button', { name: 'Envoyer' }));
    expect(onSend).toHaveBeenCalledWith('Merci !');
    await user.press(screen.getByRole('button', { name: 'Accepter' }));
    expect(onAcceptQuote).toHaveBeenCalledWith('q1');
  });

  it('filtre la boîte de réception et ouvre une conversation', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    await render(<InboxView conversations={CONVERSATIONS} onOpen={onOpen} />);
    expect(screen.queryByText('Esther Atangana')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Archives' }));
    expect(screen.getByText('Esther Atangana')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Tous' }));
    await user.press(screen.getByRole('button', { name: 'Paul Mvondo' }));
    expect(onOpen).toHaveBeenCalledWith(CONVERSATIONS[0]);
  });
});
