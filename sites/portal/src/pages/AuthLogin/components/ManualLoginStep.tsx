import { FlexStartInnerContainer } from '../../../components/common';
import { CpslButton, CpslText } from '@getpara/react-components';
import { UserIdentifier } from '@getpara/react-common';
import { useAuthInfo } from '../../../hooks/useAuthInfo';

interface ManualLoginStepProps {
  onLoginClick: () => void;
}

export const ManualLoginStep = ({ onLoginClick }: ManualLoginStepProps) => {
  const authInfo = useAuthInfo();

  return (
    <FlexStartInnerContainer>
      <CpslText weight="bold" variant="headingS">
        Login
      </CpslText>
      {!!authInfo && <UserIdentifier {...authInfo} />}
      <CpslButton fullWidth onClick={onLoginClick}>
        Login with Passkey
      </CpslButton>
    </FlexStartInnerContainer>
  );
};
