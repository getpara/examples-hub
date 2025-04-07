import { FlexStartInnerContainer } from '../../../components/common';
import { CpslButton, CpslText } from '@getpara/react-components';
import { UserIdentifier } from '@getpara/react-common';
import { usePara } from '../../../components';

interface ManualLoginStepProps {
  onLoginClick: () => void;
}

export const ManualLoginStep = ({ onLoginClick }: ManualLoginStepProps) => {
  const para = usePara();
  const authInfo = para.authInfo;

  return (
    <FlexStartInnerContainer>
      <CpslText weight="bold" variant="headingS">
        Login
      </CpslText>
      <UserIdentifier authInfo={authInfo} />
      <CpslButton fullWidth onClick={onLoginClick}>
        Login with Passkey
      </CpslButton>
    </FlexStartInnerContainer>
  );
};
