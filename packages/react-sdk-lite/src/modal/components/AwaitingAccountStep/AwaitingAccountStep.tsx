import { useModalStore } from '../../stores/index.js';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingAccountStep = () => {
  const isLogin = useModalStore(state => state.isLogin());
  const verifyState = useModalStore(state => state.getVerifyState());

  const isSLOPopup = !!verifyState?.isWalletSelectionNeeded;

  return (
    <Waiting
      heading={isLogin ? 'Logging you in...' : 'Creating your account...'}
      subheading={isSLOPopup ? 'Follow the prompts presented by your browser.' : undefined}
    />
  );
};
