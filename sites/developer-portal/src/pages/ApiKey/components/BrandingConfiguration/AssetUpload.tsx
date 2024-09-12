import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { ImageUpload, ImageUploadProps } from '../../../../components/ImageUpload/ImageUpload';
import { getFilename } from '../../../../utils/getFilename';
import { triggerToast } from '../../../../utils/toasts';
import { useParams } from 'react-router-dom';
import { useUploadKeyAsset } from '../../../../hooks/api/mutations/useUploadKeyAsset';
import { useFormContext } from 'react-hook-form';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';
import { PartnerAssetType } from '../../../../types/api';

interface AssetUploadProps {
  fieldName: keyof Pick<UpdateApiKeyBranding, 'iconUrl' | 'logoUrl'>;
  assetType: PartnerAssetType;
  label?: string;
  recommendedSize?: ImageUploadProps['recommendedSize'];
}

export const AssetUpload = ({ fieldName, assetType, label, recommendedSize }: AssetUploadProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutateAsync: uploadImage } = useUploadKeyAsset(assetType);
  const { getValues, setValue } = useFormContext<UpdateApiKeyBranding>();

  const handleRemoveImage = () => {
    setValue(fieldName, undefined, { shouldDirty: true });
  };

  const handleUploadImage = async (file: File) => {
    const url = await uploadImage(
      { projectId: projectId!, keyId: apiKey!, env: env!, file },
      {
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Failed to Upload Image',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );

    if (!url) {
      return false;
    } else {
      setValue(fieldName, url, { shouldDirty: true });
      return true;
    }
  };

  const value = getValues(fieldName);

  return (
    <InnerConfigurationCard>
      <ImageUpload
        key={value}
        recommendedSize={recommendedSize}
        externalSrc={value ?? undefined}
        externalFilename={value ? getFilename(value ?? '') : undefined}
        uploadImage={handleUploadImage}
        label={label}
        onRemoveImage={handleRemoveImage}
      />
    </InnerConfigurationCard>
  );
};

export function Logo() {
  return <AssetUpload fieldName="logoUrl" assetType={PartnerAssetType.LOGOS} label="Logo" />;
}

export function Icon() {
  return (
    <AssetUpload
      fieldName="iconUrl"
      assetType={PartnerAssetType.ICONS}
      label="App Icon"
      recommendedSize={{ height: 64, width: 64 }}
    />
  );
}
