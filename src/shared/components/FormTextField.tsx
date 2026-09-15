import { useTranslation } from 'react-i18next';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { TextField, type TextFieldProps } from './TextField';

export interface FormTextFieldProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> {
  control: Control<T>;
  name: FieldPath<T>;
}

/**
 * `TextField` relié à react-hook-form.
 * Les messages locaux sont des clés de traduction ; ceux du serveur (`type: 'server'`) sont affichés tels quels.
 */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...fieldProps
}: FormTextFieldProps<T>) {
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
          <TextField
            {...fieldProps}
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
