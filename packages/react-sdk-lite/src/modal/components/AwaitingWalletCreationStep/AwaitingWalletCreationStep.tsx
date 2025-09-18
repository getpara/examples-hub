import { StepContainer } from '../common.js';
import { Waiting } from '../Waiting/Waiting.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAccount } from '../../../provider/index.js';

type Props = {
  isGuestMode?: boolean;
};

export const AwaitingWalletCreationStep = ({ isGuestMode = false }: Props) => {
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const { embedded } = useAccount();

  return (
    <StepContainer $wide>
      <Waiting
        heading={
          isGuestMode
            ? 'Creating Guest Account'
            : embedded?.isGuestMode
              ? hideWallets
                ? 'Linking Guest Account'
                : 'Linking Guest Wallet'
              : hideWallets
                ? 'Creating Your Account'
                : 'Creating Your Wallet'
        }
        subheading="This should only take a couple of seconds."
      />
    </StepContainer>
  );
};
