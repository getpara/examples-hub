import { ReactNode, useState } from 'react';
import { CpslIcon } from '@getpara/react-components';
import { safeStyled } from '../utils/index.js';

interface WarningBannerProps {
  children: ReactNode;
  onClose?: () => void;
}

const BannerContainer = safeStyled.div`
  background: #fffcec;
  border: 2px solid var(--cpsl-color-utility-yellow);
  border-radius: 4px;
  padding: 8px 8px;
`;

const Content = safeStyled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
`;

const Text = safeStyled.div`
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  color: var(--cpsl-color-black);
  font-weight: 400;
`;

const CloseButton = safeStyled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
`;

const CloseIcon = safeStyled(CpslIcon)`
  --icon-color: var(--cpsl-color-utility-yellow);
  --height: 20px;
  --width: 20px;
`;

export const WarningBanner = ({ children, onClose }: WarningBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <BannerContainer>
      <Content>
        <CloseButton onClick={handleClose} aria-label="Close warning">
          <CloseIcon icon="x" />
        </CloseButton>
        <Text>{children}</Text>
      </Content>
    </BannerContainer>
  );
};
