import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslButton, CpslCard, CpslIcon, CpslText } from '@getpara/react-components';
import { DownIcon, FlexRow, LabelContainer, MethodRow, OptionRow } from './ModalConfig';
import { OAUTH_METHODS, TOAuthMethod } from '@getpara/react-sdk';
import { memo, useCallback } from 'react';

// Create optimized selector
const useOAuthState = () => {
  return useModalStateStore(state => ({
    oAuthMethods: state.oAuthMethods,
  }));
};

export const OAuthMethods = memo(() => {
  const { oAuthMethods } = useOAuthState();
  const updateState = useModalStateStore(state => state.updateState);

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newMethods = [...oAuthMethods];
      [newMethods[index - 1], newMethods[index]] = [newMethods[index], newMethods[index - 1]];
      updateState({ oAuthMethods: newMethods });
    },
    [oAuthMethods, updateState],
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === oAuthMethods.length - 1) return;
      const newMethods = [...oAuthMethods];
      [newMethods[index], newMethods[index + 1]] = [newMethods[index + 1], newMethods[index]];
      updateState({ oAuthMethods: newMethods });
    },
    [oAuthMethods, updateState],
  );

  const removeMethod = useCallback(
    (method: string) => {
      updateState({ oAuthMethods: oAuthMethods.filter(m => m !== method) });
    },
    [oAuthMethods, updateState],
  );

  const addMethod = useCallback(
    (method: TOAuthMethod) => {
      updateState({ oAuthMethods: [...oAuthMethods, method] });
    },
    [oAuthMethods, updateState],
  );

  return (
    <CpslCard style={{ height: 'fit-content' }}>
      <CpslText variant="headingXS" weight="semiBold">
        OAuth Methods
      </CpslText>
      <LabelContainer>
        {oAuthMethods.map((method, index) => (
          <MethodRow key={method}>
            <CpslText>{method}</CpslText>
            <FlexRow>
              <CpslButton variant="ghost" disabled={index === 0} onClick={() => moveUp(index)}>
                <CpslIcon icon="chevronUp" />
              </CpslButton>
              <CpslButton variant="ghost" disabled={index === oAuthMethods.length - 1} onClick={() => moveDown(index)}>
                <DownIcon icon="chevronUp" />
              </CpslButton>
              <CpslButton variant="ghost" onClick={() => removeMethod(method)}>
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
              onClick={() => addMethod(method)}
            >
              {method}
            </CpslButton>
          ))}
        </OptionRow>
      </LabelContainer>
    </CpslCard>
  );
});
