import { FieldValues, Form, SubmitHandler } from '@getpara/react-component-library';
import { ComponentProps, PropsWithChildren } from 'react';

type FormWrapperProps<T extends FieldValues> = { submitForm: SubmitHandler<T> } & ComponentProps<typeof Form<T, any, T>> &
  PropsWithChildren;

export const FormWrapper = <T extends FieldValues>({ children, submitForm, ...form }: FormWrapperProps<T>) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>{children}</form>
    </Form>
  );
};
