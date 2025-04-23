import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { ThemeMode, UpdateApiKeyFormData } from '../../../../../types/api';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { triggerToast } from '../../../../../utils/toasts';
import { useIsValidKey, useIsValidProject } from '../../../../../hooks/useIsValidOrgConfig';
import {
  GITHUB_URL_REGEX,
  HEX_COLOR_REGEX,
  HTTPS_URL_REGEX,
  LINKEDIN_URL_REGEX,
  TWITTER_URL_REGEX,
} from '../../../../../utils/regex';

export type BrandingForm = Pick<
  UpdateApiKeyFormData,
  | 'logoUrl'
  | 'iconUrl'
  | 'backgroundColor'
  | 'foregroundColor'
  | 'accentColor'
  | 'themeMode'
  | 'font'
  | 'emailWelcome'
  | 'emailBackupKit'
  | 'verifyUrl'
  | 'githubUrl'
  | 'twitterUrl'
  | 'linkedinUrl'
  | 'homepageUrl'
>;

const zodHexColor = z
  .union([
    z.string().max(9).min(4, 'Hex string must be at least 4 characters').regex(HEX_COLOR_REGEX, 'Invalid hex color'),
    z.string().length(0),
  ])
  .transform(arg => (arg === '' ? null : arg))
  .optional()
  .nullable();

const formSchema = z.object({
  logoUrl: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable(),
  backgroundColor: zodHexColor,
  foregroundColor: zodHexColor,
  accentColor: zodHexColor,
  themeMode: z.nativeEnum(ThemeMode).optional().nullable(),
  font: z.string().optional().nullable(),
  emailWelcome: z.boolean().optional().nullable(),
  emailBackupKit: z.boolean().optional().nullable(),
  verifyUrl: z
    .union([z.string().regex(HTTPS_URL_REGEX, 'Invalid https URL'), z.string().length(0)])
    .transform(arg => (arg === '' ? null : arg))
    .optional()
    .nullable(),
  githubUrl: z
    .union([z.string().regex(GITHUB_URL_REGEX, 'Invalid Github URL'), z.string().length(0)])
    .transform(arg => (arg === '' ? null : arg))
    .optional()
    .nullable(),
  twitterUrl: z
    .union([z.string().regex(TWITTER_URL_REGEX, 'Invalid Twitter URL'), z.string().length(0)])
    .transform(arg => (arg === '' ? null : arg))
    .optional()
    .nullable(),
  linkedinUrl: z
    .union([z.string().regex(LINKEDIN_URL_REGEX, 'Invalid Linkedin URL'), z.string().length(0)])
    .transform(arg => (arg === '' ? null : arg))
    .optional()
    .nullable(),
  homepageUrl: z
    .union([z.string().regex(HTTPS_URL_REGEX, 'Invalid https URL'), z.string().length(0)])
    .transform(arg => (arg === '' ? null : arg))
    .optional()
    .nullable(),
}) satisfies SchemaFromInterface<BrandingForm>;

export const useBrandingForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const isValidKey = useIsValidKey(projectId, apiKey);
  const isValidProject = useIsValidProject(projectId);
  const { mutateAsync: updateKey } = useUpdateApiKey();

  const form = useForm<BrandingForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: apiKeyData,
    disabled: !isValidKey || !isValidProject,
  });

  const onSubmit = async (updateData: BrandingForm) => {
    if (projectId && apiKey && env) {
      try {
        await updateKey({
          projectId,
          keyId: apiKey,
          env,
          data: updateData,
        });
        form.reset(form.getValues());
        triggerToast({
          variant: 'success',
          title: 'Config Saved!',
        });
      } catch (err) {
        triggerToast({
          variant: 'error',
          title: 'Failed to Save Config',
          body: 'Please correct any errors. If the problem persists, contact Para support.',
        });
      }
    }
  };

  return { form, onSubmit };
};
