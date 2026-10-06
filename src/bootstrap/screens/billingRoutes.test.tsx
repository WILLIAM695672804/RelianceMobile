import { render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { InvoicesRoute } from './InvoicesRoute';
import { QuotesRoute } from './QuotesRoute';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: () => ({ requestId: 'r1' }),
}));

const mockQuotesProps: { current?: { requestId: string; onOpenInvoices?: () => void } } = {};
const mockInvoicesProps: { current?: { onOpen: (id: string) => void } } = {};

jest.mock('@/features/billing', () => ({
  RequestQuotesScreen: (props: { requestId: string; onOpenInvoices?: () => void }) => {
    mockQuotesProps.current = props;
    return null;
  },
  InvoicesScreen: (props: { onOpen: (id: string) => void }) => {
    mockInvoicesProps.current = props;
    return null;
  },
}));

describe('routes de facturation', () => {
  it('ouvre les factures depuis les devis d’une demande', async () => {
    await render(<QuotesRoute />);

    expect(mockQuotesProps.current?.requestId).toBe('r1');
    mockQuotesProps.current?.onOpenInvoices?.();

    expect(router.push).toHaveBeenCalledWith('/invoices');
  });

  it('ouvre le détail d’une facture', async () => {
    await render(<InvoicesRoute />);

    mockInvoicesProps.current?.onOpen('i1');

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/invoices/[id]',
      params: { id: 'i1' },
    });
  });
});
