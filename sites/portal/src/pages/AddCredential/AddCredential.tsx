import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, ModalLoading, usePara } from '../../components';
import { CpslButton, CpslDivider, CpslIcon, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { useNavigateWithCurrentParams } from '../../hooks/useNavigateWithCurrentParams';
import { useEffect, useState } from 'react';

export const AddCredential = () => {
  const [searchParams] = useSearchParams();
  const para = usePara();
  const navigate = useNavigateWithCurrentParams();
  const [isReady, setIsReady] = useState(false);

  const addNewCredentialType = searchParams.get('addNewCredentialType');
  const addNewCredentialPasskeyId = searchParams.get('addNewCredentialPasskeyId');
  const addNewCredentialPasswordId = searchParams.get('addNewCredentialPasswordId');
  const isPasskeyAllowed = addNewCredentialPasskeyId && (addNewCredentialType === 'PASSKEY' || !addNewCredentialType);
  const isPINAllowed = addNewCredentialPasswordId && (addNewCredentialType === 'PIN' || !addNewCredentialType);
  const isPasswordAllowed = addNewCredentialPasswordId && (addNewCredentialType === 'PASSWORD' || !addNewCredentialType);

  const handleAddPasskey = () => {
    if (!addNewCredentialPasskeyId) {
      throw new Error('Passkey ID is required to add a new passkey');
    }

    navigate(`/web/users/${para.userId}/biometrics/${addNewCredentialPasskeyId}`, {});
  };

  const handleAddPassword = (isPIN?: boolean) => () => {
    if (!addNewCredentialPasswordId) {
      throw new Error('Password ID is required to add a new password or PIN');
    }

    navigate(`/web/users/${para.userId}/${isPIN ? 'pin' : 'passwords'}/${addNewCredentialPasswordId}`, {});
  };

  const handleAddBasicLogin = () => {
    navigate(`/web/users/${para.userId}/basic-login`, {});
  };

  useEffect(() => {
    if (addNewCredentialType) {
      if (addNewCredentialType === 'PASSKEY') {
        handleAddPasskey();
        return;
      }
      if (addNewCredentialType === 'PIN' || addNewCredentialType === 'PASSWORD') {
        handleAddPassword(addNewCredentialType === 'PIN');
        return;
      }
      if (addNewCredentialType === 'BASIC_LOGIN') {
        handleAddBasicLogin();
        return;
      }
    }
    setIsReady(true);
  }, [addNewCredentialType]);

  if (!isReady) {
    return (
      <StyledCard>
        <CardContent>
          <ModalLoading noText />
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <Container>
          <InnerContainer>
            <Header>
              <CpslText variant="bodyL" weight="semiBold">
                Add Security Method
              </CpslText>
              <CpslText variant="bodyS" color="secondary" weight="medium" style={{ textAlign: 'center' }}>
                Choose a security method
              </CpslText>
            </Header>
            {isPasskeyAllowed && (
              <>
                <CpslButton fullWidth onClick={handleAddPasskey}>
                  <CpslIcon slot="start" icon="key" />
                  Add Passkey
                </CpslButton>
                {isPINAllowed || isPasswordAllowed ? <CpslDivider>or</CpslDivider> : null}
              </>
            )}
            {isPINAllowed && (
              <>
                <CpslButton fullWidth onClick={handleAddPassword(true)}>
                  <CpslIcon slot="start" icon="passcode" />
                  Add PIN
                </CpslButton>
                {isPasswordAllowed ? <CpslDivider>or</CpslDivider> : null}
              </>
            )}
            {isPasswordAllowed && (
              <CpslButton fullWidth onClick={handleAddPassword(false)}>
                <CpslIcon slot="start" icon="passcode" />
                Add Password
              </CpslButton>
            )}
          </InnerContainer>
        </Container>
      </CardContent>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  &::part(card-container) {
    padding-top: 0px;
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const InnerContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  max-width: 300px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
`;
