import { styled } from 'styled-components';
import { Heading, Subheading, ButtonIcon, Text, Link } from '../../../components/common';
import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import capsule from '../../../clients/capsule';

interface SelectFlowStepProps {
  onLoginClick: () => void;
  onAddDeviceClick: () => void;
}

export const SelectFlowStep = ({ onLoginClick, onAddDeviceClick }: SelectFlowStepProps) => {
  const [searchParams] = useSearchParams();
  const paramsEmail = decodeURIComponent(searchParams.get('email'));
  const { partner } = useModalOutletContext();
  const [recoveryUrl, setRecoveryUrl] = useState<string | undefined>();

  const getPortalUrl = async () => {
    setRecoveryUrl(await capsule.getPortalURL());
  };

  useEffect(() => {
    getPortalUrl();
  }, []);

  return (
    <>
      <StyledHeading>
        <span>Login</span>
      </StyledHeading>
      <EmailContainer>
        <EmailIcon icon="wallet" />
        <Text>
          <span>{paramsEmail}</span>
        </Text>
      </EmailContainer>
      <Subheading>
        <span>Use your Passkey to login to your wallet and connect to {partner.displayName}.</span>
      </Subheading>
      <ButtonContainer>
        <CpslButton fullWidth onClick={onLoginClick}>
          Login With Passkey
          <ButtonIcon slot="end" icon="key" />
        </CpslButton>
        <CpslButton fullWidth variant="secondary" onClick={onAddDeviceClick}>
          <ButtonIcon slot="start" icon="plusCircle" />
          Add A Passkey From This Device
        </CpslButton>
        <Link href={recoveryUrl}>
          <LinkText>I’m having trouble logging into my wallet</LinkText>
        </Link>
      </ButtonContainer>
    </>
  );
};

const StyledHeading = styled(Heading)`
  margin-top: 32px;
  padding-top: 8px;

  @media (max-width: 550px) {
    margin-top: 0px;
    padding-top: 0px;
  }
`;

const LinkText = styled(Text)`
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 16px;
  padding-top: 8px;
  gap: 8px;
  width: 314px;
`;

const EmailContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;

  padding: 2px 16px;
  border-radius: 1000px;
  border: 1px solid var(--cpsl-color-input-border-placeholder);
`;

const EmailIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-secondary);
`;
