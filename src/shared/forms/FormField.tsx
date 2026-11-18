import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Field, type FieldProps } from '@/shared/ui';

export interface FormFieldProps<T extends FieldValues> extends Omit<
  FieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> {
  control: Control<T>;
  name: FieldPath<T>;
}

/**
 * `Field` relié à react-hook-form. Les messages locaux sont des clés de traduction ; ceux du
 * serveur (`type: 'server'`) sont affichés tels quels.
 */
export function FormField<T extends FieldValues>({ control, name, ...props }: FormFieldProps<T>) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error;
        const message = error?.message
          ? error.type === 'server'
            ? error.message
            : t(error.message)
          : undefined;
        return (
          <Field
            {...props}
            value={typeof field.value === 'string' ? field.value : ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={message}
          />
        );
      }}
    />
  );
}
