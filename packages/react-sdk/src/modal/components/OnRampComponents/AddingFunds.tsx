import { OnRampPurchaseStatus } from '@usecapsule/web-sdk';
import { SpinnerContainer } from '../common.js';
import { ON_RAMP_PROVIDERS } from '../../constants/constants.js';
import { useModalStore } from '../../stores/index.js';
import { CpslSpinner, CpslText } from '@usecapsule/react-components';

export const AddingFunds = () => {
  const onRampPurchase = useModalStore(state => state.onRampPurchase);

  return (
    <>
      <SpinnerContainer>
        <CpslSpinner size={100} />
      </SpinnerContainer>
      <CpslText>
        Follow the prompts presented by{' '}
        {OnRampPurchaseStatus ? ON_RAMP_PROVIDERS[onRampPurchase.provider].name : 'the provider'}.
      </CpslText>
    </>
  );
};
