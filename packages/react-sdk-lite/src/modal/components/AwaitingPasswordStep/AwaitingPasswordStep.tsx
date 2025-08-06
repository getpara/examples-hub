import { useModalStore } from '../../stores/index.js';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingPasswordStep = () => {
  const isLogin = useModalStore(state => state.isLogin());
  const signupState = useModalStore(state => state.getSignupState());
  const loginState = useModalStore(state => state.getLoginState());

  const isPIN = !!signupState?.pinUrl || !!loginState?.pinUrl;

  return (
    <Waiting
      heading={isLogin ? `Waiting for ${isPIN ? 'PIN' : 'Password'}` : `Creating  ${isPIN ? 'PIN' : 'Password'}`}
      subheading="Follow the prompts presented by your browser."
    />
  );
};
