import { FlexStartInnerContainer } from '../../../components/common';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { UserIdentifier } from '@usecapsule/react-common';
import { useUsername } from '../../../hooks/useUsername';

interface ManualLoginStepProps {
  onLoginClick: () => void;
}

export const ManualLoginStep = ({ onLoginClick }: ManualLoginStepProps) => {
  const username = useUsername();

  return (
    <FlexStartInnerContainer>
      <CpslText weight="bold" variant="headingS">
        Login
      </CpslText>
      <UserIdentifier identifier={username} />
      <CpslButton fullWidth onClick={onLoginClick}>
        Login with Passkey
      </CpslButton>
    </FlexStartInnerContainer>
  );
};
