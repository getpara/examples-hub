import { useModalStore } from '../../stores/index.js';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingPasswordStep = () => {
  const isLogin = useModalStore(state => state.isLogin());

  return (
    <Waiting
      heading={isLogin ? 'Waiting for Password' : 'Creating Password'}
      subheading="Follow the prompts presented by your browser."
    />
  );
};
