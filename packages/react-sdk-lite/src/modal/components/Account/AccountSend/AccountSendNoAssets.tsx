import { CpslButton, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../../stores/index.js';
import { ModalStep } from '../../../utils/steps.js';

export function AccountSendNoAssets() {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const setStep = useModalStore(state => state.setStep);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '308px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          flexGrow: 1,
        }}
      >
        <CpslText variant="bodyL" color="primary" weight="semiBold">
          No Funds Available
        </CpslText>
        <CpslText variant="bodyS" color="secondary">
          Switch to a wallet with funds or buy crypto with this wallet.
        </CpslText>
      </div>
      {onRampConfig?.isBuyEnabled && (
        <CpslButton
          fullWidth
          variant="primary"
          onClick={() => {
            setStep(ModalStep.ADD_FUNDS_BUY);
          }}
        >
          Buy
        </CpslButton>
      )}
    </div>
  );
}
