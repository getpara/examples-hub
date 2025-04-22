import { FormField, FormItem, FormLabel, Typography, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { BrandingForm } from '../hooks/useBrandingForm';
import { useUploadKeyAsset } from '../../../../../hooks/api/mutations/useUploadKeyAsset';
import { PartnerAssetType } from '../../../../../types/api';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { UploadButton } from '../../../../../components/UploadButton';

type AssetUploadProps = {
  formKey: 'iconUrl' | 'logoUrl';
};

export const AssetUpload = ({ formKey }: AssetUploadProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutateAsync: uploadImage, isPending: isUploadingAsset } = useUploadKeyAsset();
  const { mutateAsync: updateKey } = useUpdateApiKey();
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
        onSuccess: url => {
          // If the image url hasn't ever been set, save the key config
          // If it has been set, updating the image in S3 is all we need to do
          if (url !== currentValue) {
            form.setValue(formKey, url);
            updateKey({
              projectId: projectId!,
              keyId: apiKey!,
              env: env!,
              data: {
                [formKey]: url,
              },
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
              buttonClassName={clsx({
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
