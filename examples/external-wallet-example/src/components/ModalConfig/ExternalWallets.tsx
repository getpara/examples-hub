import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { ExternalWallet } from '@getpara/react-sdk';
import { DownIcon, FlexRow, LabelContainer, MethodRow, OptionRow } from './ModalConfig';

export const ExternalWallets = () => {
  const updateState = useModalStateStore(state => state.updateState);
  const externalWallets = useModalStateStore(state => state.externalWallets);

  return (
    <LabelContainer>
      <CpslText variant="bodyL" weight="semiBold">
        External Wallets
      </CpslText>
      {externalWallets.map((method, index) => (
        <MethodRow key={method}>
          <CpslText>{method.toUpperCase()}</CpslText>
          <FlexRow>
            <CpslButton
              variant="ghost"
              disabled={index === 0}
              onClick={() => {
                externalWallets.splice(index - 1, 0, externalWallets.splice(index, 1)[0]);
                updateState({ externalWallets: [...externalWallets] });
              }}
            >
              <CpslIcon icon="chevronUp" />
            </CpslButton>
            <CpslButton
              variant="ghost"
              disabled={index === externalWallets.length - 1}
              onClick={() => {
                externalWallets.splice(index + 1, 0, externalWallets.splice(index, 1)[0]);
                updateState({ externalWallets: [...externalWallets] });
              }}
            >
              <DownIcon icon="chevronUp" />
            </CpslButton>
            <CpslButton
              variant="ghost"
              onClick={() => updateState({ externalWallets: externalWallets.filter(m => m !== method) })}
            >
              <DownIcon icon="close" />
            </CpslButton>
          </FlexRow>
        </MethodRow>
      ))}
      <OptionRow>
        {Object.values(ExternalWallet)
          .filter(method => !externalWallets.includes(method))
          .map(method => (
            <CpslButton
              size="small"
              key={method}
              variant={externalWallets.includes(method) ? 'primary' : 'secondary'}
              onClick={() => updateState({ externalWallets: [...externalWallets, method] })}
            >
              {method.toUpperCase()}
            </CpslButton>
          ))}
      </OptionRow>
    </LabelContainer>
  );
};
