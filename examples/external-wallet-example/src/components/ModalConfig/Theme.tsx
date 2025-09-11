import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslCard, CpslCheckbox, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { LabelContainer } from './ModalConfig';
import React, { memo, useCallback, useRef } from 'react';

// Create optimized selectors to prevent unnecessary re-renders
const useThemeState = () => {
  return useModalStateStore(state => ({
    logo: state.logo,
    backgroundColor: state.backgroundColor,
    foregroundColor: state.foregroundColor,
    accentColor: state.accentColor,
    mode: state.mode,
  }));
};

const useConnectionState = () => {
  return useModalStateStore(state => ({
    externalWalletConnectionOnly: state.externalWalletConnectionOnly,
    externalWalletIncludeVerification: state.externalWalletIncludeVerification,
    farcasterDisableAutoConnect: state.farcasterDisableAutoConnect,
    isFullAuth: state.isFullAuth,
  }));
};

export const Theme = memo(() => {
  const themeState = useThemeState();
  const connectionState = useConnectionState();
  const updateState = useModalStateStore(state => state.updateState);

  // Debounced update mechanism for text inputs
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const pendingUpdateRef = useRef<Partial<typeof themeState>>({});

  const debouncedUpdateState = useCallback(
    (updates: Partial<typeof themeState>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      pendingUpdateRef.current = { ...pendingUpdateRef.current, ...updates };

      debounceTimerRef.current = setTimeout(() => {
        updateState(pendingUpdateRef.current);
        pendingUpdateRef.current = {};
      }, 300);
    },
    [updateState],
  );

  const immediateUpdateState = useCallback(
    (updates: Partial<typeof themeState | typeof connectionState>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        pendingUpdateRef.current = {};
      }
      updateState(updates);
    },
    [updateState],
  );

  // Cleanup effect to clear debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <CpslCard style={{ height: 'fit-content' }}>
      <CpslText variant="headingXS" weight="semiBold">
        Theme & Connection
      </CpslText>
      <LabelContainer>
        <CpslText variant="bodyL" weight="semiBold">
          Connection Only
        </CpslText>
        <CpslCheckbox
          checked={connectionState.externalWalletConnectionOnly}
          onCpslCheckboxChanged={(e: any) => {
            immediateUpdateState({ externalWalletConnectionOnly: e.detail ?? false });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          With Verification
        </CpslText>
        <CpslCheckbox
          checked={connectionState.externalWalletIncludeVerification}
          onCpslCheckboxChanged={(e: any) => {
            immediateUpdateState({ externalWalletIncludeVerification: e.detail ?? false });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          With Full Auth
        </CpslText>
        <CpslCheckbox
          checked={connectionState.isFullAuth}
          onCpslCheckboxChanged={(e: any) => {
            immediateUpdateState({ isFullAuth: e.detail ?? false });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Enable Farcaster Autoconnect
        </CpslText>
        <CpslCheckbox
          checked={!connectionState.farcasterDisableAutoConnect}
          onCpslCheckboxChanged={(e: any) => {
            immediateUpdateState({ farcasterDisableAutoConnect: !e.detail });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Logo
        </CpslText>
        <CpslInput
          value={themeState.logo}
          onCpslInput={e => {
            debouncedUpdateState({ logo: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Background Color
        </CpslText>
        <CpslInput
          value={themeState.backgroundColor}
          onCpslInput={e => {
            debouncedUpdateState({ backgroundColor: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Foreground Color
        </CpslText>
        <CpslInput
          value={themeState.foregroundColor}
          onCpslInput={e => {
            debouncedUpdateState({ foregroundColor: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Accent Color
        </CpslText>
        <CpslInput
          value={themeState.accentColor}
          onCpslInput={e => {
            debouncedUpdateState({ accentColor: e.detail.value ?? '' });
          }}
        />
        <CpslText variant="bodyL" weight="semiBold">
          Mode
        </CpslText>
        <CpslSelect
          selectedValue={themeState.mode ?? ''}
          onCpslSelectValueChange={e => {
            immediateUpdateState({ mode: e.detail as 'light' | 'dark' });
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
    </CpslCard>
  );
});
