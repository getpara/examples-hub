import { CpslCard, CpslText, CpslSelect, CpslSelectItem, CpslInput } from '@getpara/react-components';
import { Environment, getBaseUrl } from '@getpara/core-sdk';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect, useRef } from 'react';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { LabelContainer } from './ModalConfig';

interface Partner {
  apiKey: string;
  id: string;
  name: string;
  displayName: string;
}

export const EnvironmentSettings = () => {
  const { selectedEnv, selectedApiKey, setSelectedEnv, setSelectedApiKey } = useEnvironment();
  const [partners, setPartners] = useLocalStorage<Partner[]>('@EXAMPLE-PARA/partners', []);

  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  // Fetch partners for dev/sandbox environments
  useEffect(() => {
    async function fetchPartners() {
      try {
        const response = await fetch(`${getBaseUrl(selectedEnv)}partners`);
        const partnersData = await response.json();
        setPartners(partnersData);
        if (partnersData.length > 0 && !selectedApiKey) {
          setSelectedApiKey(partnersData[0].apiKey);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      }
    }

    if ([Environment.DEV, Environment.SANDBOX].includes(selectedEnv)) {
      fetchPartners();
    }
  }, [selectedEnv, selectedApiKey, setSelectedApiKey]);

  // Reload page when environment or API key changes (but not on initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Only reload if we have a valid API key
    if (selectedApiKey) {
      window.location.reload();
    }
  }, [selectedEnv, selectedApiKey]);

  return (
    <CpslCard>
      <CpslText variant="headingXS" weight="semiBold">
        Environment Settings
      </CpslText>

      <LabelContainer>
        <CpslText variant="bodyL" weight="semiBold">
          Environment
        </CpslText>
        <CpslSelect
          selectedValue={selectedEnv}
          onCpslSelectValueChange={e => setSelectedEnv(e.detail as Environment)}
          formatValue={v => v.toUpperCase()}
        >
          <CpslSelectItem slot="items" value={Environment.DEV}>
            <CpslText>DEV</CpslText>
          </CpslSelectItem>
          <CpslSelectItem slot="items" value={Environment.SANDBOX}>
            <CpslText>SANDBOX</CpslText>
          </CpslSelectItem>
          <CpslSelectItem slot="items" value={Environment.BETA}>
            <CpslText>BETA</CpslText>
          </CpslSelectItem>
          <CpslSelectItem slot="items" value={Environment.PROD}>
            <CpslText>PROD</CpslText>
          </CpslSelectItem>
        </CpslSelect>

        {[Environment.DEV, Environment.SANDBOX].includes(selectedEnv) ? (
          <>
            <CpslText variant="bodyL" weight="semiBold">
              Partner
            </CpslText>
            <CpslSelect
              selectedValue={selectedApiKey}
              onCpslSelectValueChange={e => setSelectedApiKey(e.detail)}
              formatValue={v => {
                const partner = partners?.find(p => p.apiKey === v);
                return partner ? partner.displayName : v;
              }}
            >
              {(partners || []).map(partner => (
                <CpslSelectItem key={partner.id} slot="items" value={partner.apiKey}>
                  <CpslText>
                    {partner.displayName} ({partner.apiKey})
                  </CpslText>
                </CpslSelectItem>
              ))}
            </CpslSelect>
          </>
        ) : (
          <>
            <CpslText variant="bodyL" weight="semiBold">
              API Key
            </CpslText>
            <CpslInput
              value={selectedApiKey}
              onCpslInput={e => setSelectedApiKey(e.detail.value ?? '')}
              placeholder="Enter API key"
            />
          </>
        )}
      </LabelContainer>
    </CpslCard>
  );
};
