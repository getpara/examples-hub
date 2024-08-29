import { CpslFileUpload, CpslText } from '@usecapsule/react-components';
import { ReactNode } from 'react';
import styled from 'styled-components';

interface ImageUploadProps {
  recommendedHeight: number;
  recommendedWidth: number;
  label?: string;
  externalSrc?: string;
  externalFilename?: string;
  uploadImage: (file: File) => Promise<boolean>;
  onRemoveImage: () => void;
  LabelComponent?: ReactNode;
}

export const ImageUpload = ({
  recommendedHeight,
  recommendedWidth,
  label,
  externalSrc,
  externalFilename,
  uploadImage,
  onRemoveImage,
  LabelComponent,
}: ImageUploadProps) => {
  return (
    <CpslFileUpload
      uploadFile={uploadImage}
      onCpslFileRemoved={onRemoveImage}
      label={label}
      fileTypes={['image/jpg', 'image/jpeg', 'image/png', 'image/gif']}
      externalSrc={externalSrc}
      externalFilename={externalFilename}
    >
      {LabelComponent}
      <LeftContainer slot="left-content">
        <CpslText variant="bodyS">Upload Image</CpslText>
        <CpslText variant="bodyXS" color="tertiary">
          Upload a JPG, PNG or GIF image smaller than 5 MB <br />
          <br /> Recommended size: {recommendedWidth}px X {recommendedHeight}px
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
