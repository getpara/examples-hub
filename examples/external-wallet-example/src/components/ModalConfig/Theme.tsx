import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslCheckbox, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { LabelContainer } from './ModalConfig';

export const Theme = () => {
  const updateState = useModalStateStore(state => state.updateState);
  const logo = useModalStateStore(state => state.logo);
  const backgroundColor = useModalStateStore(state => state.backgroundColor);
  const foregroundColor = useModalStateStore(state => state.foregroundColor);
  const accentColor = useModalStateStore(state => state.accentColor);
  const mode = useModalStateStore(state => state.mode);
  const externalWalletConnectionOnly = useModalStateStore(state => state.externalWalletConnectionOnly);
  const externalWalletIncludeVerification = useModalStateStore(state => state.externalWalletIncludeVerification);
  const farcasterDisableAutoConnect = useModalStateStore(state => state.farcasterDisableAutoConnect);
  const isFullAuth = useModalStateStore(state => state.isFullAuth);

  return (
    <>
      <LabelContainer>
        <CpslText variant="bodyL" weight="semiBold">
          Connection Only
        </CpslText>
        <CpslCheckbox
          checked={externalWalletConnectionOnly}
          onCpslCheckboxChanged={(e: any) => {
            updateState({ externalWalletConnectionOnly: e.detail ?? false });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          With Verification
        </CpslText>
        <CpslCheckbox
          checked={externalWalletIncludeVerification}
          onCpslCheckboxChanged={(e: any) => {
            updateState({ externalWalletIncludeVerification: e.detail ?? false });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          With Full Auth
        </CpslText>
        <CpslCheckbox
          checked={isFullAuth}
          onCpslCheckboxChanged={(e: any) => {
            updateState({ isFullAuth: e.detail ?? false });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Enable Farcaster Autoconnect
        </CpslText>
        <CpslCheckbox
          checked={!farcasterDisableAutoConnect}
          onCpslCheckboxChanged={(e: any) => {
            updateState({ farcasterDisableAutoConnect: !e.detail });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Logo
        </CpslText>
        <CpslInput
          value={logo}
          onCpslInput={e => {
            updateState({ logo: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Background Color
        </CpslText>
        <CpslInput
          value={backgroundColor}
          onCpslInput={e => {
            updateState({ backgroundColor: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Foreground Color
        </CpslText>
        <CpslInput
          value={foregroundColor}
          onCpslInput={e => {
            updateState({ foregroundColor: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Accent Color
        </CpslText>
        <CpslInput
          value={accentColor}
          onCpslInput={e => {
            updateState({ accentColor: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Mode
        </CpslText>
        <CpslSelect
          selectedValue={mode ?? ''}
          onCpslSelectValueChange={e => {
            updateState({ mode: e.detail as 'light' | 'dark' });
          }}
          formatValue={v => v.toUpperCase()}
        >
          <CpslSelectItem slot="items" value="dark">
            <CpslText>DARK</CpslText>
          </CpslSelectItem>
          <CpslSelectItem slot="items" value="light">
            <CpslText>LIGHT</CpslText>
          </CpslSelectItem>
        </CpslSelect>
      </LabelContainer>
    </>
  );
};
