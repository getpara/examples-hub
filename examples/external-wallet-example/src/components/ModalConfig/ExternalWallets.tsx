import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslButton, CpslCard, CpslIcon, CpslText } from '@getpara/react-components';
import { EXTERNAL_WALLET_TYPES } from '@getpara/react-sdk';
import { DownIcon, FlexRow, LabelContainer, MethodRow, OptionRow } from './ModalConfig';
import { memo, useCallback } from 'react';

// Create optimized selector
const useExternalWalletsState = () => {
  return useModalStateStore(state => ({
    externalWallets: state.externalWallets,
  }));
};

export const ExternalWallets = memo(() => {
  const { externalWallets } = useExternalWalletsState();
  const updateState = useModalStateStore(state => state.updateState);

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newWallets = [...externalWallets];
      [newWallets[index - 1], newWallets[index]] = [newWallets[index], newWallets[index - 1]];
      updateState({ externalWallets: newWallets });
    },
    [externalWallets, updateState],
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === externalWallets.length - 1) return;
      const newWallets = [...externalWallets];
      [newWallets[index], newWallets[index + 1]] = [newWallets[index + 1], newWallets[index]];
      updateState({ externalWallets: newWallets });
    },
    [externalWallets, updateState],
  );

  const removeWallet = useCallback(
    (wallet: string) => {
      updateState({ externalWallets: externalWallets.filter(w => w !== wallet) });
    },
    [externalWallets, updateState],
  );

  const addWallet = useCallback(
    (wallet: string) => {
      updateState({ externalWallets: [...externalWallets, wallet] });
    },
    [externalWallets, updateState],
  );

  return (
    <CpslCard style={{ height: 'fit-content' }}>
      <CpslText variant="headingXS" weight="semiBold">
        External Wallets
      </CpslText>
      <LabelContainer>
        {externalWallets.map((method, index) => (
          <MethodRow key={method}>
            <CpslText>{method.toUpperCase()}</CpslText>
            <FlexRow>
              <CpslButton variant="ghost" disabled={index === 0} onClick={() => moveUp(index)}>
                <CpslIcon icon="chevronUp" />
              </CpslButton>
              <CpslButton variant="ghost" disabled={index === externalWallets.length - 1} onClick={() => moveDown(index)}>
                <DownIcon icon="chevronUp" />
              </CpslButton>
              <CpslButton variant="ghost" onClick={() => removeWallet(method)}>
                <DownIcon icon="close" />
              </CpslButton>
            </FlexRow>
          </MethodRow>
        ))}
        <OptionRow>
          {EXTERNAL_WALLET_TYPES.filter(method => !externalWallets.includes(method)).map(method => (
            <CpslButton
              size="small"
              key={method}
              variant={externalWallets.includes(method) ? 'primary' : 'secondary'}
              onClick={() => addWallet(method)}
            >
              {method.toUpperCase()}
            </CpslButton>
          ))}
        </OptionRow>
      </LabelContainer>
    </CpslCard>
  );
});
