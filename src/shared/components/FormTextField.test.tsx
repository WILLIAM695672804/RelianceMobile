import { act, screen } from '@testing-library/react-native';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test/render';

import { FormTextField } from './FormTextField';

function Harness({ error }: { error: { type: string; message: string } }) {
  const { control, setError } = useForm({ defaultValues: { email: '' } });
  useEffect(() => {
    setError('email', error);
  }, [error, setError]);
  return <FormTextField control={control} name="email" label="Adresse électronique" />;
}

describe('FormTextField', () => {
  it('traduit un message de validation locale', async () => {
    await renderWithProviders(
      <Harness error={{ type: 'too_small', message: 'common:states.empty' }} />,
    );
    await act(async () => undefined);
    expect(screen.getByRole('alert')).toHaveTextContent('Aucun élément à afficher.');
  });

  it('affiche tel quel un message du serveur', async () => {
    await renderWithProviders(
      <Harness error={{ type: 'server', message: 'The email has already been taken.' }} />,
    );
    await act(async () => undefined);
    expect(screen.getByRole('alert')).toHaveTextContent('The email has already been taken.');
  });
});
