import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData } from '../../../../../types/api';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { getApiKeyIpAllowlist } from '../../../../../api/apiKeys/queries';
import { updateApiKeyAllowlist } from '../../../../../api/apiKeys/mutations';
import { AUTH_METHODS } from '../../../../../utils/constants';
import { SubmitVars, useForm } from '../../../hooks/useForm';
import { AxiosError } from 'axios';
import { isValidCidrBlock, normalizeCidrEntries } from '../../../../../utils/ipAllowlist';
import { AuthMethod } from '@getpara/user-management-client';

export type SecurityForm = Pick<
  UpdateApiKeyFormData,
  'origins' | 'ipAllowlistCidrs' | 'supportedAuthMethods' | 'sessionMaxAge' | 'forceTransactionPopups'
>;

const formSchema = z.object({
  origins: z
    .string()
    .refine(
      v =>
        v === '' ||
        v
          .split(',')
          .map(v => v.trim())
          .every(item => z.string().url().safeParse(item).success),
      { message: 'Invalid origin string, values must be valid urls' },
    )
    .optional()
    .nullable(),
  ipAllowlistCidrs: z
    .string()
    .refine(
      v => {
        if (v === '') {
          return true;
        }

        const entries = normalizeCidrEntries(v);

        return entries.every(entry => isValidCidrBlock(entry));
      },
      { message: 'Invalid CIDR block, use notation like 203.0.113.0/24 or 2001:db8::/64' },
    )
    .optional()
    .nullable(),
  supportedAuthMethods: z
    .array(z.string())
    .refine(val => val.every(method => AUTH_METHODS.map(m => m.value).includes(method)), {
      message: 'Invalid authentication method',
    })
    .refine(val => !(val.includes('PIN') && val.includes('PASSWORD')), {
      message: 'PIN and password cannot be selected at the same time',
    })
    .optional()
    .nullable(),
  sessionMaxAge: z
    .number()
    .min(5, 'Sessions must be longer than or equal to 5 minutes')
    .max(43_200, 'Sessions must be shorter than or equal to 30 days')
    .optional()
    .nullable(),
  forceTransactionPopups: z.boolean().optional().nullable(),
}) satisfies SchemaFromInterface<SecurityForm>;

export const useSecurityForm = ({
  showConfirmationModal,
}: {
  showConfirmationModal: ({}: { onConfirm: () => void; onCancel: () => void }) => void;
}) => {
  const { organizationId, apiKey, env, projectId } = useParams();
  const environment = env as Environment;
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', environment);
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const queryClient = useQueryClient();

  const { data: allowlistCidrs = [] } = useQuery({
    enabled: Boolean(organizationId && projectId && apiKey && environment),
    queryKey: ['apiKeyAllowlist', organizationId, projectId, apiKey, environment],
    queryFn: async () => {
      if (!organizationId || !projectId || !apiKey) {
        return [] as string[];
      }

      const { data } = await getApiKeyIpAllowlist(organizationId, projectId, apiKey, environment);
      return data.allowlistCidrs ?? [];
    },
  });

  const defaultData = useMemo(
    () => ({
      ...apiKeyData,
      origins: apiKeyData?.origins?.join(', ') ?? '',
      ipAllowlistCidrs: allowlistCidrs.length > 0 ? allowlistCidrs.join(', ') : '',
      // convert from ms to minutes
      sessionMaxAge: apiKeyData?.sessionMaxAge ? parseInt(apiKeyData.sessionMaxAge) / (60 * 1000) : null,
    }),
    [apiKeyData, allowlistCidrs],
  );

  const defaultsSignature = useMemo(() => JSON.stringify(defaultData), [defaultData]);
  const previousDefaultsSignatureRef = useRef<string | null>(null);

  const waitForUserConfirmation = async (): Promise<boolean> => {
    return new Promise(resolve => {
      // Show a modal/dialog and resolve when user clicks
      showConfirmationModal({
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const onSubmit = async (updateData: SecurityForm, { projectId, apiKey, env }: SubmitVars) => {
    const { ipAllowlistCidrs, supportedAuthMethods, ...rest } = updateData;

    // If the submitted value includes anything, remove BASIC_LOGIN from the list so we only save the selected methods
    const updatedAuthMethods = !!supportedAuthMethods?.length
      ? supportedAuthMethods.filter(v => v !== AuthMethod.BASIC_LOGIN)
      : [AuthMethod.BASIC_LOGIN];

    if (updatedAuthMethods.includes(AuthMethod.BASIC_LOGIN)) {
      const userConfirmed = await waitForUserConfirmation();

      if (!userConfirmed) {
        throw new Error('USER_CANCELLED');
      }
    }

    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: {
        ...rest,
        ...(rest.origins
          ? {
              origins: rest.origins
                .split(',')
                .map(v => v.trim())
                .filter(Boolean),
            }
          : { origins: null }),
        supportedAuthMethods: updatedAuthMethods,
        // Will add back after REST API launch
        // ...(updateData.allowedIps
        //   ? {
        //       allowedIps: updateData.allowedIps
        //         .split(',')
        //         .map(v => v.trim())
        //         .filter(Boolean),
        //     }
        //   : { allowedIps: null }),
        ...(rest.sessionMaxAge
          ? { sessionMaxAge: (rest.sessionMaxAge * 60 * 1000).toString(10) } // convert minutes to ms
          : { sessionMaxAge: null }),
      },
    });

    if (!organizationId) {
      return;
    }

    const allowlist = normalizeCidrEntries(ipAllowlistCidrs);

    try {
      await updateApiKeyAllowlist({
        organizationId,
        projectId,
        keyId: apiKey,
        env,
        allowlistCidrs: allowlist,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string } | string>;
      const responseMessage = axiosError.response?.data;
      const message =
        typeof responseMessage === 'string'
          ? responseMessage
          : (responseMessage?.message ?? 'Failed to update IP allowlist. Please verify the CIDR entries.');

      throw new Error(message);
    }

    queryClient.invalidateQueries({
      queryKey: ['apiKeyAllowlist', organizationId, projectId, apiKey, env],
    });
  };

  const { form, submitForm } = useForm<SecurityForm>({ formSchema, defaultValues: defaultData, onSubmit });

  useEffect(() => {
    if (defaultsSignature !== previousDefaultsSignatureRef.current) {
      form.reset(defaultData);
      previousDefaultsSignatureRef.current = defaultsSignature;
    }
  }, [form, defaultData, defaultsSignature]);

  return { form, submitForm };
};
