import { useModalStore } from '../../stores/index.js';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingBiometricsStep = () => {
  const isLogin = useModalStore(state => state.isLogin());

  return (
    <Waiting
      heading={isLogin ? 'Waiting for Passkey' : 'Creating Passkey'}
      subheading="Follow the prompts presented by your browser."
    />
  );
};
