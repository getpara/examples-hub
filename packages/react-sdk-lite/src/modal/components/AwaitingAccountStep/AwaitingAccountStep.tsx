import { useModalStore } from '../../stores/index.js';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingAccountStep = () => {
  const isLogin = useModalStore(state => state.isLogin());
  const refs = useModalStore(state => state.refs);

  const isSLOPopup = refs.popupWindow.current?.closed === false;

  return (
    <Waiting
      heading={isLogin ? 'Logging you in...' : 'Creating your account...'}
      subheading={isSLOPopup ? 'Follow the prompts presented by your browser.' : undefined}
    />
  );
};
