import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { AuthLayout } from '@getpara/react-sdk';
import { DownIcon, FlexRow, LabelContainer, MethodRow, OptionRow } from './ModalConfig';

const AuthLayoutLabels: Record<AuthLayout, string> = {
  [AuthLayout.AUTH_CONDENSED]: 'Condensed OAuth',
  [AuthLayout.AUTH_FULL]: 'Full OAuth',
  [AuthLayout.EXTERNAL_CONDENSED]: 'Condensed External Wallets',
  [AuthLayout.EXTERNAL_FULL]: 'Full External Wallets',
};

export const AuthLayouts = () => {
  const updateState = useModalStateStore(state => state.updateState);
  const authLayout = useModalStateStore(state => state.authLayout);

  return (
    <LabelContainer>
      <CpslText variant="bodyL" weight="semiBold">
        Auth Layout
      </CpslText>
      {authLayout.map((method, index) => (
        <MethodRow key={method}>
          <CpslText> {AuthLayoutLabels[method]}</CpslText>
          <FlexRow>
            <CpslButton
              variant="ghost"
              disabled={index === 0}
              onClick={() => {
                authLayout.splice(index - 1, 0, authLayout.splice(index, 1)[0]);
                updateState({ authLayout: [...authLayout] });
              }}
            >
              <CpslIcon icon="chevronUp" />
            </CpslButton>
            <CpslButton
              variant="ghost"
              disabled={index === authLayout.length - 1}
              onClick={() => {
                authLayout.splice(index + 1, 0, authLayout.splice(index, 1)[0]);
                updateState({ authLayout: [...authLayout] });
              }}
            >
              <DownIcon icon="chevronUp" />
            </CpslButton>
            <CpslButton variant="ghost" onClick={() => updateState({ authLayout: authLayout.filter(m => m !== method) })}>
              <DownIcon icon="close" />
            </CpslButton>
          </FlexRow>
        </MethodRow>
      ))}
      <OptionRow>
        {Object.values(AuthLayout)
          .filter(method => !authLayout.includes(method))
          .map(method => {
            const type = method.split(':')[0];
            const isDisabled = !!authLayout.find(al => al.includes(type));
            return (
              <CpslButton
                size="small"
                key={method}
                variant={authLayout.includes(method) ? 'primary' : 'secondary'}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) updateState({ authLayout: [...authLayout, method] });
                }}
              >
                {AuthLayoutLabels[method]}
              </CpslButton>
            );
          })}
      </OptionRow>
    </LabelContainer>
  );
};
