import { useParams } from 'react-router-dom';
import { useGetProject } from '../../../../../hooks/api/queries/useProjects';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData, UpdateProjectBody } from '../../../../../types/api';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { useUpdateProject } from '../../../../../hooks/api/mutations/useUpdateProject';
import { SubmitVars, useForm } from '../../../hooks/useForm';
import { Framework } from '../../../../../types/framework';
import { PackageManager } from '../../../../../types/packageManager';
import {
  ANDROID_PACKAGE_NAME_REGEX,
  APPLE_BUNDLE_IDENTIFIER_REGEX,
  SHA256_FINGERPRINT_REGEX,
} from '../../../../../utils/regex';
import { SupportedWalletTypes, WALLET_TYPES } from '@getpara/user-management-client';

export type SetupForm = Pick<
  UpdateApiKeyFormData,
  'cosmosPrefix' | 'teamId' | 'bundleIdentifier' | 'androidPackageName' | 'androidSha256CertFingerprints'
> &
  Pick<UpdateProjectBody, 'framework' | 'packageManager'> & {
    apiKey: string;
    name: string;
    supportedWalletTypes: SupportedWalletTypes;
  };

const formSchema = z.object({
  cosmosPrefix: z.string().optional().nullable(),
  supportedWalletTypes: z.array(z.object({ type: z.enum(WALLET_TYPES), optional: z.boolean().optional() })).min(1),
  name: z.string(),
  framework: z.string().optional().nullable(),
  packageManager: z.string().optional().nullable(),
  apiKey: z.string(),
  teamId: z
    .string()
    .refine(v => v === '' || v.length === 10, {
      message: 'Team ID must be 10 characters or empty.',
    })
    .optional()
    .nullable(),
  bundleIdentifier: z
    .string()
    .refine(v => v === '' || APPLE_BUNDLE_IDENTIFIER_REGEX.test(v), {
      message: 'Must be a valid Apple bundle identifier or empty.',
    })
    .optional()
    .nullable(),
  androidPackageName: z
    .string()
    .refine(v => v === '' || ANDROID_PACKAGE_NAME_REGEX.test(v), {
      message: 'Must be a valid Android package name.',
    })
    .optional()
    .nullable(),
  androidSha256CertFingerprints: z
    .string()
    .refine(
      v =>
        v === '' ||
        v
          .split(',')
          .map(v => v.trim())
          .every(item => z.string().regex(SHA256_FINGERPRINT_REGEX).safeParse(item).success),
      { message: 'Must contain only valid SHA256 fingerprints.' },
    )
    .optional()
    .nullable(),
}) satisfies SchemaFromInterface<SetupForm>;

export const useSetupForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: project } = useGetProject(projectId ?? '');
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const { mutateAsync: updateProject } = useUpdateProject();

  const defaultData: SetupForm = {
    ...apiKeyData,
    apiKey: apiKeyData?.apiKey ?? '',
    supportedWalletTypes: apiKeyData?.supportedWalletTypes ?? [],
    teamId: apiKeyData?.teamId ?? '',
    bundleIdentifier: apiKeyData?.bundleIdentifier ?? '',
    androidPackageName: apiKeyData?.androidPackageName ?? '',
    androidSha256CertFingerprints: apiKeyData?.androidSha256CertFingerprints?.join(', ') ?? '',
    ...project,
    name: project?.name ?? '',
    framework: project?.framework ?? Framework.REACT,
    packageManager: project?.packageManager ?? PackageManager.YARN,
  };

  const onSubmit = async (
    {
      supportedWalletTypes,
      cosmosPrefix,
      framework,
      packageManager,
      name,
      teamId,
      bundleIdentifier,
      androidPackageName,
      androidSha256CertFingerprints,
    }: Pick<
      SetupForm,
      | 'supportedWalletTypes'
      | 'cosmosPrefix'
      | 'framework'
      | 'packageManager'
      | 'name'
      | 'teamId'
      | 'bundleIdentifier'
      | 'androidPackageName'
      | 'androidSha256CertFingerprints'
    >,
    { projectId, apiKey, env }: SubmitVars,
  ) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: {
        supportedWalletTypes,
        cosmosPrefix,
        displayName: name,
        name,
        teamId: teamId || null,
        bundleIdentifier: bundleIdentifier || null,
        androidPackageName: androidPackageName || null,
        ...(androidSha256CertFingerprints
          ? { androidSha256CertFingerprints: androidSha256CertFingerprints.split(',').map(v => v.trim()) }
          : { androidSha256CertFingerprints: null }),
      },
    });
    await updateProject({
      projectId,
      data: { framework, packageManager, name },
    });
  };

  const { form, submitForm } = useForm<SetupForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
