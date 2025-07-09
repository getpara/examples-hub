import { useModalStore } from '../../stores/index.js';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingIFrameStep = () => {
  const isLogin = useModalStore(state => state.isLogin());

  return <Waiting heading={isLogin ? 'Logging you in...' : 'Creating your account...'} />;
};
