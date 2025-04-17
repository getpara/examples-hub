import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { DownIcon, FlexRow, LabelContainer, MethodRow, OptionRow } from './ModalConfig';
import { OAUTH_METHODS } from '@getpara/react-sdk';

export const OAuthMethods = () => {
  const updateState = useModalStateStore(state => state.updateState);
  const oAuthMethods = useModalStateStore(state => state.oAuthMethods);

  return (
    <LabelContainer>
      <CpslText variant="bodyL" weight="semiBold">
        OAuth Methods
      </CpslText>
      {oAuthMethods.map((method, index) => (
        <MethodRow key={method}>
          <CpslText>{method}</CpslText>
          <FlexRow>
            <CpslButton
              variant="ghost"
              disabled={index === 0}
              onClick={() => {
                oAuthMethods.splice(index - 1, 0, oAuthMethods.splice(index, 1)[0]);
                updateState({ oAuthMethods: [...oAuthMethods] });
              }}
            >
              <CpslIcon icon="chevronUp" />
            </CpslButton>
            <CpslButton
              variant="ghost"
              disabled={index === oAuthMethods.length - 1}
              onClick={() => {
                oAuthMethods.splice(index + 1, 0, oAuthMethods.splice(index, 1)[0]);
                updateState({ oAuthMethods: [...oAuthMethods] });
              }}
            >
              <DownIcon icon="chevronUp" />
            </CpslButton>
            <CpslButton
              variant="ghost"
              onClick={() => updateState({ oAuthMethods: oAuthMethods.filter(m => m !== method) })}
            >
              <DownIcon icon="close" />
            </CpslButton>
          </FlexRow>
        </MethodRow>
      ))}
      <OptionRow>
        {OAUTH_METHODS.filter(method => !oAuthMethods.includes(method)).map(method => (
          <CpslButton
            size="small"
            key={method}
            variant={oAuthMethods.includes(method) ? 'primary' : 'secondary'}
            onClick={() => updateState({ oAuthMethods: [...oAuthMethods, method] })}
          >
            {method}
          </CpslButton>
        ))}
      </OptionRow>
    </LabelContainer>
  );
};
