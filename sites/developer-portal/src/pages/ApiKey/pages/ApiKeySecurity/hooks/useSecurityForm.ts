import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData } from '../../../../../types/api';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { AUTH_METHODS } from '../../../../../utils/constants';
import { SubmitVars, useForm } from '../../../hooks/useForm';

export type SecurityForm = Pick<
  UpdateApiKeyFormData,
  'origins' | 'allowedIps' | 'supportedAuthMethods' | 'sessionMaxAge' | 'forceTransactionPopups'
>;

// Helper function to validate IP addresses (IPv4 and IPv6)
// Basic validation - backend does strict validation
const isValidIpAddress = (ip: string): boolean => {
  // IPv4: Check for 4 groups of 1-3 digits separated by dots
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = ip.match(ipv4Regex);

  if (ipv4Match) {
    // Validate each octet is 0-255
    return ipv4Match.slice(1).every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6: Basic validation for common patterns
  // Must contain only hex digits, colons, and at most one ::
  // Reject if it has triple colons or invalid characters
  if (ip.includes(':::')) return false;
  if (!/^[0-9a-fA-F:]+$/.test(ip)) return false;

  // Check for valid :: compression (max one occurrence)
  const doubleColonCount = (ip.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;

  // Very simplified IPv6 check - just ensure it has valid hex and colon structure
  // The backend will do the complete validation
  const parts = ip.split(':');
  const hasValidParts = parts.every(part => part === '' || /^[0-9a-fA-F]{1,4}$/i.test(part));
  const hasReasonableLength = parts.length >= 3 && parts.length <= 8;

  return hasValidParts && hasReasonableLength;
};

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
  allowedIps: z
    .string()
    .refine(
      v =>
        v === '' ||
        v
          .split(',')
          .map(v => v.trim())
          .every(ip => isValidIpAddress(ip)),
      { message: 'Invalid IP address format, values must be valid IPv4 or IPv6 addresses' },
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

export const useSecurityForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { mutateAsync: updateKey } = useUpdateApiKey();

  const defaultData = {
    ...apiKeyData,
    origins: apiKeyData?.origins?.join(', ') ?? '',
    allowedIps: apiKeyData?.allowedIps?.join(', ') ?? '',
    // convert from ms to minutes
    sessionMaxAge: apiKeyData?.sessionMaxAge ? parseInt(apiKeyData.sessionMaxAge) / (60 * 1000) : null,
  };

  const onSubmit = async (updateData: SecurityForm, { projectId, apiKey, env }: SubmitVars) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: {
        ...updateData,
        ...(updateData.origins
          ? {
              origins: updateData.origins
                .split(',')
                .map(v => v.trim())
                .filter(Boolean),
            }
          : { origins: null }),
        // Will add back after REST API launch
        // ...(updateData.allowedIps
        //   ? {
        //       allowedIps: updateData.allowedIps
        //         .split(',')
        //         .map(v => v.trim())
        //         .filter(Boolean),
        //     }
        //   : { allowedIps: null }),
        ...(updateData.sessionMaxAge
          ? { sessionMaxAge: (updateData.sessionMaxAge * 60 * 1000).toString(10) } // convert minutes to ms
          : { sessionMaxAge: null }),
      },
    });
  };

  const { form, submitForm } = useForm<SecurityForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
