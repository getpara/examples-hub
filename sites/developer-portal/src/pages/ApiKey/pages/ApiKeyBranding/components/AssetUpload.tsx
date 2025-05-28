import { cn, FormField, FormItem, FormLabel, Typography, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { BrandingForm } from '../hooks/useBrandingForm';
import { useUploadKeyAsset } from '../../../../../hooks/api/mutations/useUploadKeyAsset';
import { PartnerAssetType } from '../../../../../types/api';
import { useParams } from 'react-router-dom';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { UploadButton } from '../../../../../components/UploadButton';
import { Environment } from '@getpara/react-sdk';
import { IS_BETA } from '../../../../../utils/constants';
import { useUpdateProject } from '../../../../../hooks/api/mutations/useUpdateProject';
import { useGetSelectedOrganization } from '../../../../../hooks/api/queries/useOrganizations';
import { useGetProject } from '../../../../../hooks/api/queries/useProjects';

type AssetUploadProps = {
  formKey: 'iconUrl' | 'logoUrl';
};

export const AssetUpload = ({ formKey }: AssetUploadProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutateAsync: uploadImage, isPending: isUploadingAsset } = useUploadKeyAsset();
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const { mutateAsync: updateProject } = useUpdateProject();
  const { data: org } = useGetSelectedOrganization();
  const { data: project } = useGetProject(projectId ?? '');
  const form = useFormContext<BrandingForm>();

  const isIcon = formKey === 'iconUrl';
  const isLogo = formKey === 'logoUrl';
  const label = formKey === 'iconUrl' ? 'Icon' : 'Logo';
  const sizeHelper = formKey === 'iconUrl' ? 'Size: 80px x 80px' : 'Max Width: 200px';
  const currentValue = form.watch(formKey);

  const handleUpload = (assetType: PartnerAssetType, file?: File) => {
    if (!file) {
      return;
    }

    uploadImage(
      { projectId: projectId!, keyId: apiKey!, env: env!, file, assetType },
      {
        onSuccess: async url => {
          // If the image url hasn't ever been set, save the key config
          // If it has been set, updating the image in S3 is all we need to do
          if (url !== currentValue) {
            form.setValue(formKey, url);
            await updateKey({
              projectId: projectId!,
              keyId: apiKey!,
              env: env!,
              data: {
                [formKey]: url,
              },
            });
          }

          let shouldUpdateProjectIcon = false;
          const urlMismatch = url !== project?.iconUrl;

          switch (env?.toUpperCase() as Environment) {
            case Environment.PROD: {
              shouldUpdateProjectIcon = urlMismatch;
              break;
            }
            case Environment.BETA: {
              shouldUpdateProjectIcon = IS_BETA && urlMismatch;
              break;
            }
            case Environment.SANDBOX: {
              shouldUpdateProjectIcon = !IS_BETA && urlMismatch;
              break;
            }
            case Environment.DEV: {
              shouldUpdateProjectIcon = urlMismatch;
              break;
            }
          }

          // If updating the logo and the project doesn't have a logo set, set the project logo to the new key logo or if the logo should be updated based on the environment
          if (
            formKey === 'iconUrl' &&
            !!url &&
            !!projectId &&
            (project?.iconUrl === org?.logoUrl || shouldUpdateProjectIcon)
          ) {
            await updateProject({
              projectId,
              data: { iconUrl: url },
            });
          }
        },
        onError: () => {
          form.setError(formKey, new Error('Something went wrong. Please try again.'));
        },
      },
    );
  };

  return (
    <FormField
      control={form.control}
      name={formKey}
      render={({ field: { ref: _, ...restField }, fieldState: { error } }) => (
        <FormItem className="para:flex-1">
          <FormLabel>
            <div className="para:flex para:flex-col para:gap-1">
              <Typography className="para:font-medium">{label}</Typography>
              <Typography color="muted" className="para:text-xs para:font-medium">
                {sizeHelper}
              </Typography>
            </div>
          </FormLabel>
          <FormControl>
            <UploadButton
              idPrefix={formKey}
              onInputChange={ev => {
                handleUpload(PartnerAssetType.ICONS, ev.target?.files?.[0]);
              }}
              isLoading={isUploadingAsset}
              error={!!error}
              buttonClassName={cn({
                'para:w-[80px]': isIcon,
                'para:w-[200px]': isLogo,
              })}
              {...restField}
              value={restField.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
