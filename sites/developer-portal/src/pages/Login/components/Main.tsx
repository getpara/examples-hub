import { CapsuleModal, OAuthMethod } from '@usecapsule/react-sdk';
import { capsule } from '../../../clients/capsule';

interface MainProps {
  setIsLoading: (v: boolean) => void;
}

export const Main = ({ setIsLoading }: MainProps) => {
  const handleModalClose = () => {
    setIsLoading(true);
  };

  return (
    <CapsuleModal
      capsule={capsule}
      isOpen
      onClose={handleModalClose}
      bareModal
      oAuthMethods={[OAuthMethod.GOOGLE]}
      disablePhoneLogin
    />
  );
};
