import { CpslFileUpload, CpslText } from '@getpara/react-components';
import { ReactNode } from 'react';
import styled from 'styled-components';

export interface ImageUploadProps {
  recommendedSize?: { width: number; height: number };
  label?: string;
  externalSrc?: string;
  externalFilename?: string;
  uploadImage: (file: File) => Promise<boolean>;
  onRemoveImage: () => void;
  LabelComponent?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({
  recommendedSize,
  label,
  externalSrc,
  externalFilename,
  uploadImage,
  onRemoveImage,
  LabelComponent,
  disabled,
  className,
}: ImageUploadProps) => {
  return (
    <CpslFileUpload
      uploadFile={uploadImage}
      onCpslFileRemoved={onRemoveImage}
      label={label}
      fileTypes={['image/jpg', 'image/jpeg', 'image/png', 'image/gif']}
      externalSrc={externalSrc}
      externalFilename={externalFilename}
      disabled={disabled}
      className={className}
    >
      {LabelComponent}
      <LeftContainer slot="left-content">
        <CpslText variant="bodyS">Upload Image</CpslText>
        <CpslText variant="bodyXS" color="tertiary">
          Upload a JPG, PNG or GIF image smaller than 5 MB
          {recommendedSize && (
            <>
              <br />
              <br /> Recommended size: {recommendedSize.width}px X {recommendedSize.height}px
            </>
          )}
        </CpslText>
      </LeftContainer>
    </CpslFileUpload>
  );
};

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
