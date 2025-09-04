import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData } from '../../../../../types/api';
import { ThemeMode } from '@getpara/react-sdk';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import {
  GITHUB_URL_REGEX,
  HEX_COLOR_REGEX,
  HTTPS_URL_REGEX,
  LINKEDIN_URL_REGEX,
  TWITTER_URL_REGEX,
} from '../../../../../utils/regex';
import { SubmitVars, useForm } from '../../../hooks/useForm';

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
  const { mutateAsync: updateKey } = useUpdateApiKey();

  const defaultData: BrandingForm = {
    ...apiKeyData,
    logoUrl: apiKeyData?.logoUrl ?? '',
    iconUrl: apiKeyData?.iconUrl ?? '',
    backgroundColor: apiKeyData?.backgroundColor ?? '',
    foregroundColor: apiKeyData?.foregroundColor ?? '',
    accentColor: apiKeyData?.accentColor ?? '',
    verifyUrl: apiKeyData?.verifyUrl ?? '',
    githubUrl: apiKeyData?.githubUrl ?? '',
    twitterUrl: apiKeyData?.twitterUrl ?? '',
    linkedinUrl: apiKeyData?.linkedinUrl ?? '',
    homepageUrl: apiKeyData?.homepageUrl ?? '',
  };

  const onSubmit = async (updateData: BrandingForm, { projectId, apiKey, env }: SubmitVars) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: updateData,
    });
  };

  const { form, submitForm } = useForm<BrandingForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
