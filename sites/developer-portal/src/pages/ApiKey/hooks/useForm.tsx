import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useIsValidKey, useIsValidProject } from '../../../hooks/useIsValidOrgConfig';
import { useEffect } from 'react';
import { DefaultValues, FieldValues, toast, useForm as useRHForm } from '@getpara/react-component-library';

export type SubmitVars = { projectId: string; apiKey: string; env: string };

function sanitizeFormData<T extends FieldValues>(data: T) {
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] == null) {
      delete data[key];
    }
  });
}

export const useForm = <T extends FieldValues>({
  formSchema,
  defaultValues,
  onSubmit,
}: {
  formSchema: z.ZodSchema;
  defaultValues: DefaultValues<T>;
  onSubmit: (updateData: T, vars: SubmitVars) => Promise<void>;
}) => {
  const { apiKey, env, projectId } = useParams();
  const isValidKey = useIsValidKey(projectId, apiKey, true);
  const isValidProject = useIsValidProject(projectId, true);

  const form = useRHForm<T>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    disabled: !isValidKey || !isValidProject,
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const submitForm = async (updateData: T) => {
    if (projectId && apiKey && env) {
      try {
        sanitizeFormData(updateData);
        await onSubmit(updateData, { projectId, apiKey, env });

        form.reset(form.getValues());
        toast.success('Changes Saved!');
      } catch (e) {
        if ((e as Error).message === 'USER_CANCELLED') {
          return;
        }

        toast.error('Failed to Save Changes', {
          description: 'Please correct any errors. If the problem persists, contact Para support.',
        });
      }
    }
  };

  return { form, submitForm };
};
