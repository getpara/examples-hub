import { CpslButton, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { Modal } from '../../../../components/Modal/Modal';

interface WelcomeImageModalProps {
  open: boolean;
  imageSrc?: string;
  displayName?: string;
  onClose: () => void;
}

export const WelcomeImageModal = ({ open, imageSrc, displayName, onClose }: WelcomeImageModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Welcome Email Image"
      subtitle="When a user creates a wallet using Para in your app, you can
            choose for them to receive a Welcome email. This email contains a
            space for an image that links to the URL of your choice."
    >
      <>
        <CpslText variant="bodyM" weight="semiBold">
          Preview
        </CpslText>
        {imageSrc ? (
          <PreviewOuterContainer>
            <PreviewInnerContainer>
              <PreviewImg src={imageSrc} alt="Welcome Image" />
              <PreviewText>Explore {displayName}</PreviewText>
            </PreviewInnerContainer>
          </PreviewOuterContainer>
        ) : (
          <CpslText variant="bodyS">Upload an image to see a preview here.</CpslText>
        )}
        <CpslButton fullWidth onClick={onClose}>
          Send sample email
        </CpslButton>
      </>
    </Modal>
  );
};

const PreviewOuterContainer = styled.div`
  width: 100%;
  padding: 8px;
  border: 1px solid var(--cpsl-color-background-16);
  border-radius: 16px;
  display: flex;
  justify-content: center;
`;

const PreviewInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewImg = styled.img`
  width: 270px;
  height: 150px;
  object-fit: fill;
  border-radius: 8px;
`;

const PreviewText = styled(CpslText)`
  text-decoration: underline;
`;
