import React from 'react';
import { Flex } from 'rebass';

import * as Styled from './styles';
import { Drawer } from '@mui/material';
import useIsMobile from '@/hooks/MobileContext';

interface InstructionPanelProps {
  instructionPanelOpenState: boolean;
  setInstructionPanelOpenState: (_: boolean) => void;
}

const InstructionPanel = ({ instructionPanelOpenState, setInstructionPanelOpenState }: InstructionPanelProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <Drawer
        anchor="bottom"
        open={instructionPanelOpenState}
        onClose={() => setInstructionPanelOpenState(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        <Styled.Wrapper>
          <Styled.DrawerButton onClick={() => setInstructionPanelOpenState(false)}>
            <Styled.ChevronDown /> Close Instructions
          </Styled.DrawerButton>
          {!isMobile ? (
            <Styled.Container>
              <Styled.InstructionContainer>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction1.png" />
                </Styled.IconContainer>
                <Styled.TitleText>Log In</Styled.TitleText>
                <Styled.DescriptionText>Log In Above</Styled.DescriptionText>
              </Styled.InstructionContainer>
              <Styled.InstructionArrowContainer>
                <Styled.InstructionArrow src="/instruction-arrow.png" />
              </Styled.InstructionArrowContainer>
              <Styled.InstructionContainer>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction2.png" />
                </Styled.IconContainer>
                <Styled.TitleText>Connect</Styled.TitleText>
                <Styled.DescriptionText>Use WalletConnect with your dApp of choice</Styled.DescriptionText>
              </Styled.InstructionContainer>
              <Styled.InstructionArrowContainer>
                <Styled.InstructionArrow src="/instruction-arrow.png" />
              </Styled.InstructionArrowContainer>
              <Styled.InstructionContainer>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction3.png" />
                </Styled.IconContainer>
                <Styled.TitleText>Copy & Paste</Styled.TitleText>
                <Styled.DescriptionText>Copy WalletConnect QR code link and paste below</Styled.DescriptionText>
              </Styled.InstructionContainer>
              <Styled.InstructionArrowContainer>
                <Styled.InstructionArrow src="/instruction-arrow.png" />
              </Styled.InstructionArrowContainer>
              <Styled.InstructionContainer>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction4.png" />
                </Styled.IconContainer>
                <Styled.TitleText>Approve</Styled.TitleText>
                <Styled.DescriptionText>Return to page to approve and sign with wallet</Styled.DescriptionText>
              </Styled.InstructionContainer>
            </Styled.Container>
          ) : (
            <Styled.Container>
              <Styled.MobileStepCard>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction1.png" />
                </Styled.IconContainer>
                <Flex flexDirection="column">
                  <Styled.MobileNumberText>01</Styled.MobileNumberText>
                  <Styled.MobileTitleText>Log In</Styled.MobileTitleText>
                  <Styled.MobileDescriptionText>Log In To Para Portal</Styled.MobileDescriptionText>
                </Flex>
              </Styled.MobileStepCard>
              <Styled.MobileStepCard>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction2.png" />
                </Styled.IconContainer>
                <Flex flexDirection="column">
                  <Styled.MobileNumberText>02</Styled.MobileNumberText>
                  <Styled.MobileTitleText>Connect</Styled.MobileTitleText>
                  <Styled.MobileDescriptionText>Use WalletConnect with your dApp of choice</Styled.MobileDescriptionText>
                </Flex>
              </Styled.MobileStepCard>
              <Styled.MobileStepCard>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction3.png" />
                </Styled.IconContainer>
                <Flex flexDirection="column">
                  <Styled.MobileNumberText>03</Styled.MobileNumberText>
                  <Styled.MobileTitleText>Copy & Paste</Styled.MobileTitleText>
                  <Styled.MobileDescriptionText>
                    Copy WalletConnect QR code link and paste below
                  </Styled.MobileDescriptionText>
                </Flex>
              </Styled.MobileStepCard>
              <Styled.MobileStepCard>
                <Styled.IconContainer>
                  <Styled.Icon src="/instruction4.png" />
                </Styled.IconContainer>
                <Flex flexDirection="column">
                  <Styled.MobileNumberText>04</Styled.MobileNumberText>
                  <Styled.MobileTitleText>Approve</Styled.MobileTitleText>
                  <Styled.MobileDescriptionText>Return to page to approve and sign with wallet</Styled.MobileDescriptionText>
                </Flex>
              </Styled.MobileStepCard>
            </Styled.Container>
          )}
        </Styled.Wrapper>
      </Drawer>
    </>
  );
};

export default InstructionPanel;
