import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { ImageUpload } from '../../../../components/ImageUpload/ImageUpload';
import { getFilename } from '../../../../utils/getFilename';
import { triggerToast } from '../../../../utils/toasts';
import { useParams } from 'react-router-dom';
import { useUploadKeyLogo } from '../../../../hooks/api/mutations/useUploadKeyLogo';
import { useFormContext } from 'react-hook-form';
import { UpdateApiKeyBranding } from '../../hooks/useBrandingConfigFormData';

export const Logo = () => {
  const { apiKey, env } = useParams();
  const { mutateAsync: uploadImage } = useUploadKeyLogo();
  const { getValues, setValue } = useFormContext<UpdateApiKeyBranding>();

  const handleRemoveImage = () => {
    setValue('logoUrl', undefined, { shouldDirty: true });
  };

  const handleUploadImage = async (file: File) => {
    const url = await uploadImage(
      { keyId: apiKey!, env: env!, file },
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
      setValue('logoUrl', url, { shouldDirty: true });
      return true;
    }
  };

  return (
    <InnerConfigurationCard>
      <ImageUpload
        key={getValues('logoUrl')}
        recommendedHeight={32}
        recommendedWidth={32}
        externalSrc={getValues('logoUrl') ?? undefined}
        externalFilename={getValues('logoUrl') ? getFilename(getValues('logoUrl') ?? '') : undefined}
        uploadImage={handleUploadImage}
        label="Logo"
        onRemoveImage={handleRemoveImage}
      />
    </InnerConfigurationCard>
  );
};
