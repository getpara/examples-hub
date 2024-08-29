import { styled } from 'styled-components';
import { EMAIL_OPTIONS } from '../../config';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { CpslIcon, CpslInput, CpslText } from '@usecapsule/react-components';
import { ImageUpload } from '../../../../components/ImageUpload/ImageUpload';
import { Controller, useFormContext } from 'react-hook-form';
import { HTTPS_URL_REGEX } from '../../../../utils/regex';
import { useUpdatedWelcomeEmailConfig } from '../../../../hooks/featureFlags/useUpdatedWelcomeEmailConfig';
import { EmailOption as EmailOptionEnum, getEmailOption } from '../../utils/emailConfiguration';
import { UpdateApiKeyEmail } from '../../hooks/useEmailConfigFormData';
import { useState } from 'react';
import { WelcomeImageModal } from './WelcomeImageModal';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../types/environment';

export const EmailOption = () => {
  const { apiKey, env } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(apiKey ?? '', env as Environment);
  const { control, setValue, getValues } = useFormContext<UpdateApiKeyEmail>();
  const showUpdatedEmailConfig = useUpdatedWelcomeEmailConfig();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const selectedEmailOption = getEmailOption(getValues('emailBackupKit') ?? false, getValues('emailWelcome') ?? false);

  const handleEmailOptionClick = (option: string) => () => {
    switch (option) {
      case EmailOptionEnum.NONE: {
        setValue('emailBackupKit', false, { shouldDirty: true });
        setValue('emailWelcome', false, { shouldDirty: true });
        break;
      }
      case EmailOptionEnum.WELCOME: {
        setValue('emailBackupKit', false, { shouldDirty: true });
        setValue('emailWelcome', true), { shouldDirty: true };
        break;
      }
      case EmailOptionEnum.BACKUP: {
        setValue('emailBackupKit', true, { shouldDirty: true });
        setValue('emailWelcome', false, { shouldDirty: true });
        break;
      }
      case EmailOptionEnum.WELCOME_AND_BACKUP: {
        setValue('emailBackupKit', true, { shouldDirty: true });
        setValue('emailWelcome', true, { shouldDirty: true });
        break;
      }
    }
  };

  const handleRemoveImage = () => {};

  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true);
  };

  const handlePreviewModalClose = () => {
    setIsPreviewModalOpen(false);
  };

  return (
    <>
      {EMAIL_OPTIONS.map(option => {
        const isSelected = option.value === selectedEmailOption;
        const isWelcomeOption = option.value === 'welcome' || option.value === 'welcomeAndBackup';
        return (
          <InnerConfigurationCard
            key={option.value}
            isSelectable
            isSelected={isSelected}
            onSelect={handleEmailOptionClick(option.value)}
          >
            <SelectableCardContentContainer>
              <SelectableCardTitleContainer>
                <CpslText weight="semiBold">{option.title}</CpslText>
                <CpslText variant="bodyS">{option.subtitle}</CpslText>
              </SelectableCardTitleContainer>
              {showUpdatedEmailConfig && isSelected && isWelcomeOption && (
                <>
                  <ImageUpload
                    recommendedHeight={200}
                    recommendedWidth={300}
                    uploadImage={() => {
                      return Promise.resolve(true);
                    }}
                    LabelComponent={
                      <WelcomeImageLabel slot="label">
                        <CpslText variant="bodyS">Welcome Email Image</CpslText>
                        <WelcomeImageIcon onClick={handlePreviewClick} icon="helpCircle" />
                      </WelcomeImageLabel>
                    }
                    onRemoveImage={handleRemoveImage}
                  />
                  <Controller
                    name="emailImageLinkUrl"
                    control={control}
                    rules={{
                      pattern: {
                        value: HTTPS_URL_REGEX,
                        message: 'Must be a secure (https) url.',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <CpslInput
                        label="Image Link"
                        placeholder="Paste image link"
                        onCpslInput={e => {
                          onChange(e.detail.value);
                        }}
                        onCpslPaste={e => {
                          onChange(e.detail.clipboardData?.getData('text'));
                        }}
                        onCpslBlur={onBlur}
                        value={value ?? ''}
                        errorText={error?.message}
                      />
                    )}
                  />
                </>
              )}
            </SelectableCardContentContainer>
          </InnerConfigurationCard>
        );
      })}
      {showUpdatedEmailConfig && (
        <WelcomeImageModal
          imageSrc={apiKeyData?.emailImageUrl}
          displayName={apiKeyData?.displayName}
          open={isPreviewModalOpen}
          onClose={handlePreviewModalClose}
        />
      )}
    </>
  );
};

const SelectableCardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SelectableCardTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WelcomeImageLabel = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
`;

const WelcomeImageIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
`;
