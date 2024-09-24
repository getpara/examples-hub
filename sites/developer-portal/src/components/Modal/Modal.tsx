import { CpslButton, CpslIcon, CpslModalV2, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { PropsWithChildren } from 'react';
import { MOBILE_SIZE } from '../../utils/constants';
import { GradientText } from '../common';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title: string;
  titleColor?: string | 'gradient';
  subtitle?: string;
  onClose: () => void;
  onExited?: () => void;
}

export const Modal = ({ open, title, titleColor, subtitle, children, onClose, onExited }: ModalProps) => {
  return (
    <OuterContainer open={open} onCpslModalExited={onExited}>
      <InnerContainer>
        <Header>
          <HeaderTitle>
            {titleColor === 'gradient' ? (
              <GradientText variant="headingXS" weight="semiBold">
                {title}
              </GradientText>
            ) : (
              <TitleText variant="headingXS" weight="semiBold" $color={titleColor}>
                {title}
              </TitleText>
            )}
            <CpslButton variant="ghost" onClick={onClose}>
              <CpslIcon icon="close" />
            </CpslButton>
          </HeaderTitle>
          {subtitle && (
            <CpslText variant="bodyM" color="secondary">
              {subtitle}
            </CpslText>
          )}
        </Header>
        {children}
      </InnerContainer>
    </OuterContainer>
  );
};

const OuterContainer = styled(CpslModalV2)`
  padding: 0px 8px;
  box-sizing: border-box;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${MOBILE_SIZE + 1}px) {
    width: 390px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleText = styled(CpslText)<{ $color?: string }>`
  ${({ $color }) => $color && `color: ${$color}`};
`;
