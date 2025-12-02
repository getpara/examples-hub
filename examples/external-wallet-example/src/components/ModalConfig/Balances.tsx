import styled from 'styled-components';
import { CpslCard, CpslText, CpslInput, CpslButton, CpslIcon, CpslCheckbox } from '@getpara/react-components';
import { NETWORKS, TNetwork, CustomAsset } from '@getpara/user-management-client';
import { BalancesRequestType } from '@getpara/shared';
import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { LabelContainer, FlexRow, OptionRow } from './ModalConfig';
import { useEffect, useState, useCallback } from 'react';
import { validateBalancesConfig } from '@getpara/core-sdk';

// Create a selector for balances-related state to prevent unnecessary re-renders
const useBalancesStore = () => {
  const balancesDisplayType = useModalStateStore(state => state.balancesDisplayType);
  const balancesExcludeStandardAssets = useModalStateStore(state => state.balancesExcludeStandardAssets);
  const balancesAdditionalAssets = useModalStateStore(state => state.balancesAdditionalAssets);
  const balancesAsset = useModalStateStore(state => state.balancesAsset);
  const balancesRequestType = useModalStateStore(state => state.balancesRequestType);
  const mode = useModalStateStore(state => state.mode);
  const updateState = useModalStateStore(state => state.updateState);

  return {
    balancesDisplayType,
    balancesExcludeStandardAssets,
    balancesAdditionalAssets,
    balancesAsset,
    balancesRequestType,
    mode,
    updateState,
  };
};

// Asset Form Component
interface AssetFormProps {
  asset?: CustomAsset;
  mode: 'light' | 'dark';
  onUpdate: (asset: CustomAsset) => void;
  showRemoveAsset?: boolean;
  onRemoveAsset?: () => void;
  showPriceControls?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({
  asset: initialAsset,
  mode,
  onUpdate,
  showRemoveAsset,
  onRemoveAsset,
  showPriceControls = false,
}) => {
  // Initialize local state from the asset prop if provided
  const [asset, setAsset] = useState<CustomAsset>(
    () =>
      initialAsset || {
        name: '',
        symbol: '',
        priceUrl: 'https://',
        implementations: [{ contractAddress: '', network: 'ETHEREUM' }],
      },
  );

  // Update local state when the asset prop changes (for existing assets)
  useEffect(() => {
    if (initialAsset) {
      setAsset(initialAsset);
    }
  }, [initialAsset]);

  // Update function that modifies local state and calls parent onUpdate
  const updateAsset = useCallback(
    (updates: Partial<CustomAsset>) => {
      setAsset(prevAsset => {
        const updatedAsset = { ...prevAsset, ...updates };
        // Call the parent onUpdate with the complete updated asset
        onUpdate(updatedAsset);
        return updatedAsset;
      });
    },
    [onUpdate],
  );

  // Local network update functions
  const updateNetwork = useCallback(
    (
      networkIndex: number,
      updates: { contractAddress?: string; network?: TNetwork | { name: string; rpcUrl: string; evmChainId: `${number}` } },
    ) => {
      updateAsset({
        implementations: asset.implementations.map((network, index) => {
          if (index === networkIndex) {
            const updatedNetwork = { ...network, ...updates };

            // Remove contractAddress key if it's empty and network is a custom object
            if (updatedNetwork.contractAddress === '' && typeof updatedNetwork.network === 'object') {
              const { contractAddress: _contractAddress, ...networkWithoutContractAddress } = updatedNetwork;
              return networkWithoutContractAddress;
            }

            return updatedNetwork;
          }
          return network;
        }),
      });
    },
    [asset.implementations, updateAsset],
  );

  const addNetwork = useCallback(() => {
    updateAsset({
      implementations: [...asset.implementations, { contractAddress: '', network: 'ETHEREUM' }],
    });
  }, [asset.implementations, updateAsset]);

  const removeNetwork = useCallback(
    (networkIndex: number) => {
      if (asset.implementations.length > 1) {
        updateAsset({
          implementations: asset.implementations.filter((_, index) => index !== networkIndex),
        });
      }
    },
    [asset.implementations, updateAsset],
  );

  return (
    <AssetCard mode={mode}>
      <AssetHeader>
        {showRemoveAsset && (
          <CpslButton variant="secondary" onClick={onRemoveAsset}>
            <CpslIcon icon="close" />
            Remove
          </CpslButton>
        )}
      </AssetHeader>

      <FormGrid>
        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Name
          </CpslText>
          <CpslInput value={asset.name} onCpslInput={e => updateAsset({ name: e.detail.value })} placeholder="Asset Name" />
        </LabelContainer>

        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Symbol
          </CpslText>
          <CpslInput value={asset.symbol} onCpslInput={e => updateAsset({ symbol: e.detail.value })} placeholder="TOKEN" />
        </LabelContainer>

        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Logo URL
          </CpslText>
          <CpslInput
            value={asset.logoUrl || ''}
            onCpslInput={e => updateAsset({ logoUrl: e.detail.value })}
            placeholder="https://example.com/logo.png"
          />
        </LabelContainer>
      </FormGrid>

      {showPriceControls && (
        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Price Configuration
          </CpslText>

          {/* Price Type Toggle */}
          <FlexRow style={{ gap: '8px', marginBottom: '12px' }}>
            <CpslButton
              variant={asset.priceUrl ? 'primary' : 'secondary'}
              onClick={() => updateAsset({ ...asset, priceUrl: asset.priceUrl || 'https://', price: undefined })}
            >
              URL
            </CpslButton>
            <CpslButton
              variant={asset.price && !asset.priceUrl ? 'primary' : 'secondary'}
              onClick={() =>
                updateAsset({ ...asset, price: asset.price || { value: 0, currency: 'USD' }, priceUrl: undefined })
              }
            >
              Fixed Price
            </CpslButton>
          </FlexRow>

          {/* Price Input - conditionally rendered */}
          {asset.priceUrl ? (
            <LabelContainer>
              <CpslText variant="caption">Price URL</CpslText>
              <CpslInput
                value={asset.priceUrl}
                onCpslInput={e => updateAsset({ priceUrl: e.detail.value })}
                placeholder="https://api.example.com/price"
              />
            </LabelContainer>
          ) : (
            <LabelContainer>
              <CpslText variant="caption">Fixed Price (USD)</CpslText>
              <CpslInput
                type="number"
                value={asset.price?.value || ''}
                onCpslInput={e =>
                  updateAsset({
                    price: e.detail.value ? { value: parseFloat(e.detail.value), currency: 'USD' } : undefined,
                  })
                }
                placeholder="1.00"
              />
            </LabelContainer>
          )}
        </LabelContainer>
      )}

      <LabelContainer>
        <NetworkHeader>
          <CpslText variant="label" weight="semiBold">
            Implementations
          </CpslText>
          <CpslButton variant="secondary" onClick={addNetwork}>
            <CpslIcon icon="plus" />
            Add Network
          </CpslButton>
        </NetworkHeader>

        {asset.implementations.map((network, networkIndex) => (
          <NetworkCard key={networkIndex} mode={mode}>
            <NetworkHeader>
              <CpslText variant="caption" weight="semiBold">
                Network {networkIndex + 1}
              </CpslText>
              <CpslButton
                variant="secondary"
                onClick={() => removeNetwork(networkIndex)}
                disabled={asset.implementations.length === 1}
              >
                <CpslIcon icon="close" />
                Delete
              </CpslButton>
            </NetworkHeader>

            <FormGrid>
              <LabelContainer>
                <CpslText variant="caption">Contract Address</CpslText>
                <CpslInput
                  value={network.contractAddress}
                  onCpslInput={e => updateNetwork(networkIndex, { contractAddress: e.detail.value })}
                  placeholder={typeof network.network === 'string' ? '0x...' : 'Native token'}
                />
              </LabelContainer>

              <LabelContainer>
                <CpslText variant="caption">Network Type</CpslText>
                <select
                  value={typeof network.network === 'string' ? 'predefined' : 'custom'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    if (e.target.value === 'predefined') {
                      updateNetwork(networkIndex, { network: 'ETHEREUM' });
                    } else {
                      updateNetwork(networkIndex, {
                        network: { name: '', rpcUrl: '', evmChainId: '' as `${number}` },
                      });
                    }
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: `1px solid ${mode === 'dark' ? '#6b7280' : '#ccc'}`,
                    width: '100%',
                    backgroundColor: mode === 'dark' ? '#374151' : 'white',
                    color: mode === 'dark' ? 'white' : 'black',
                  }}
                >
                  <option value="predefined">Predefined Network</option>
                  <option value="custom">Custom Network</option>
                </select>
              </LabelContainer>

              {typeof network.network === 'string' ? (
                <LabelContainer>
                  <CpslText variant="caption">Network</CpslText>
                  <select
                    value={network.network}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateNetwork(networkIndex, { network: e.target.value as TNetwork })
                    }
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${mode === 'dark' ? '#6b7280' : '#ccc'}`,
                      width: '100%',
                      backgroundColor: mode === 'dark' ? '#374151' : 'white',
                      color: mode === 'dark' ? 'white' : 'black',
                    }}
                  >
                    {NETWORKS.map(net => (
                      <option key={net} value={net}>
                        {net}
                      </option>
                    ))}
                  </select>
                </LabelContainer>
              ) : (
                <FormGrid>
                  <LabelContainer>
                    <CpslText variant="caption">Network Name</CpslText>
                    <CpslInput
                      value={network.network.name}
                      onCpslInput={e => {
                        if (typeof network.network === 'object') {
                          updateNetwork(networkIndex, {
                            network: { ...network.network, name: e.detail.value },
                          });
                        }
                      }}
                      placeholder="Custom Network"
                    />
                  </LabelContainer>
                  <LabelContainer>
                    <CpslText variant="caption">RPC URL</CpslText>
                    <CpslInput
                      value={network.network.rpcUrl}
                      onCpslInput={e => {
                        if (typeof network.network === 'object') {
                          updateNetwork(networkIndex, {
                            network: { ...network.network, rpcUrl: e.detail.value } as any,
                          });
                        }
                      }}
                      placeholder="https://rpc.example.com"
                    />
                  </LabelContainer>
                  <LabelContainer>
                    <CpslText variant="caption">EVM Chain ID</CpslText>
                    <CpslInput
                      value={network.network.evmChainId}
                      onCpslInput={e => {
                        if (typeof network.network === 'object') {
                          updateNetwork(networkIndex, {
                            network: { ...network.network, evmChainId: e.detail.value } as any,
                          });
                        }
                      }}
                      placeholder="1"
                    />
                  </LabelContainer>
                </FormGrid>
              )}
            </FormGrid>
          </NetworkCard>
        ))}
      </LabelContainer>
    </AssetCard>
  );
};

// Empty State Component
interface EmptyStateProps {
  mode: 'light' | 'dark';
  message: string;
}

const EmptyStateMessage: React.FC<EmptyStateProps> = ({ mode, message }) => (
  <EmptyState mode={mode}>
    <CpslText
      variant="caption"
      style={{
        color: mode === 'dark' ? '#d1d5db' : '#6b7280',
        fontStyle: 'italic',
      }}
    >
      {message}
    </CpslText>
  </EmptyState>
);

// Aggregated Display Section Component
interface AggregatedDisplayProps {
  mode: 'light' | 'dark';
  effectiveBalancesConfig: any;
  onExcludeStandardAssetsChange: (value: boolean) => void;
  onAddAdditionalAsset: () => void;
  onUpdateAdditionalAsset: (index: number, asset: CustomAsset) => void;
  onRemoveAdditionalAsset: (index: number) => void;
}

const AggregatedDisplay: React.FC<AggregatedDisplayProps> = ({
  mode,
  effectiveBalancesConfig,
  onExcludeStandardAssetsChange,
  onAddAdditionalAsset,
  onUpdateAdditionalAsset,
  onRemoveAdditionalAsset,
}) => (
  <>
    <OptionRow>
      <CpslCheckbox
        checked={effectiveBalancesConfig.excludeStandardAssets || false}
        onCpslCheckboxChanged={(e: any) => {
          onExcludeStandardAssetsChange(e.detail ?? false);
        }}
      />
      <CpslText variant="body">Exclude Standard Assets</CpslText>
    </OptionRow>

    <LabelContainer>
      <AdditionalAssetsHeader>
        <CpslText variant="label" weight="semiBold">
          Additional Assets
        </CpslText>
        <CpslButton variant="primary" onClick={onAddAdditionalAsset}>
          <CpslIcon icon="plus" />
          Add Asset
        </CpslButton>
      </AdditionalAssetsHeader>

      {effectiveBalancesConfig.additionalAssets?.map((asset: CustomAsset, index: number) => (
        <AssetForm
          key={index}
          asset={asset}
          mode={mode}
          onUpdate={updatedAsset => onUpdateAdditionalAsset(index, updatedAsset)}
          showRemoveAsset={true}
          onRemoveAsset={() => onRemoveAdditionalAsset(index)}
          showPriceControls={true}
        />
      ))}

      {(!effectiveBalancesConfig.additionalAssets || effectiveBalancesConfig.additionalAssets.length === 0) && (
        <EmptyStateMessage
          mode={mode}
          message="No additional assets configured. Click 'Add Asset' to include custom tokens in balance calculations."
        />
      )}
    </LabelContainer>
  </>
);

// Custom Asset Display Section Component
interface CustomAssetDisplayProps {
  mode: 'light' | 'dark';
  effectiveBalancesConfig: any;
  onUpdateCustomAsset: (asset: CustomAsset) => void;
}

const CustomAssetDisplay: React.FC<CustomAssetDisplayProps> = ({ mode, effectiveBalancesConfig, onUpdateCustomAsset }) => (
  <LabelContainer>
    <CpslText variant="label" weight="semiBold">
      Custom Asset
    </CpslText>
    <AssetForm asset={effectiveBalancesConfig.asset} mode={mode} onUpdate={onUpdateCustomAsset} showPriceControls={false} />
  </LabelContainer>
);

export const Balances = () => {
  const {
    balancesDisplayType,
    balancesExcludeStandardAssets,
    balancesAdditionalAssets,
    balancesAsset,
    balancesRequestType,
    mode,
    updateState,
  } = useBalancesStore();

  // Helper to get current config from store
  const getCurrentConfig = () => ({
    displayType: balancesDisplayType || 'AGGREGATED',
    excludeStandardAssets: balancesExcludeStandardAssets ?? false,
    additionalAssets: balancesAdditionalAssets ?? [],
    asset: balancesAsset ?? {
      name: '',
      symbol: '',
      priceUrl: 'https://',
      implementations: [{ contractAddress: '', network: 'ETHEREUM' }],
    },
    requestType: balancesRequestType || 'MAINNET_AND_TESTNET',
  });

  // Preset state for quick configurations
  const [preset, setPreset] = useState<string | null>(null);

  // Local draft state for configuration changes
  const [draftConfig, setDraftConfig] = useState(getCurrentConfig);

  // Update draft when the actual config changes (e.g., after page reload)
  useEffect(() => {
    setDraftConfig(getCurrentConfig());

    // Restore preset from sessionStorage if available
    const savedPreset = sessionStorage.getItem('lastReloadedBalancesPreset');
    if (savedPreset && (savedPreset === 'camp_aggregated' || savedPreset === 'camp_custom_token')) {
      setPreset(savedPreset);
    } else {
      setPreset(null);
    }
  }, [balancesDisplayType, balancesExcludeStandardAssets, balancesAdditionalAssets, balancesAsset]);

  // Use draft config for UI display
  const effectiveDisplayType = draftConfig.displayType;
  const effectiveBalancesConfig = draftConfig;

  // Check if draft config has changed from current global config
  const hasConfigChanged = (() => {
    const currentConfig = getCurrentConfig();

    // Deep comparison
    return (
      currentConfig.displayType !== draftConfig.displayType ||
      currentConfig.excludeStandardAssets !== draftConfig.excludeStandardAssets ||
      JSON.stringify(currentConfig.additionalAssets) !== JSON.stringify(draftConfig.additionalAssets) ||
      JSON.stringify(currentConfig.asset) !== JSON.stringify(draftConfig.asset) ||
      currentConfig.requestType !== draftConfig.requestType
    );
  })();

  const handleDisplayTypeChange = (displayType: 'AGGREGATED' | 'CUSTOM_ASSET') => {
    // Clear preset when user manually changes configuration
    setPreset(null);

    if (displayType === 'AGGREGATED') {
      setDraftConfig(prev => ({
        ...prev,
        displayType: 'AGGREGATED',
        excludeStandardAssets: false,
        additionalAssets: [],
        requestType: prev.requestType,
      }));
    } else {
      setDraftConfig(prev => ({
        ...prev,
        displayType: 'CUSTOM_ASSET',
        asset: {
          name: '',
          symbol: '',
          priceUrl: 'https://',
          implementations: [{ contractAddress: '', network: 'ETHEREUM' }],
        },
        requestType: prev.requestType,
      }));
    }
  };

  const handleRequestTypeChange = (requestType: BalancesRequestType) => {
    setPreset(null);
    setDraftConfig(prev => ({
      ...prev,
      requestType,
    }));
  };

  // Helper to check if preset is active
  const isPresetActive = (presetName: string) => preset === presetName;

  const applyPresetConfigurationWithPreset = (targetPreset: string | null) => {
    if (!targetPreset) return;

    let newConfig;

    // Define the base Camp asset once (without priceUrl for CUSTOM_ASSET mode)
    const baseCampAsset: CustomAsset = {
      name: 'Camp',
      symbol: 'CAMP',
      implementations: [
        {
          network: {
            name: 'Camp Mainnet',
            rpcUrl: 'https://rpc.camp.raas.gelato.cloud',
            evmChainId: '484',
          },
        },
      ],
    };

    if (targetPreset === 'camp_aggregated') {
      // Camp asset for AGGREGATED mode - add priceUrl
      const campAsset: CustomAsset = {
        ...baseCampAsset,
        priceUrl: 'https://api.sandbox.getpara.com/demo-price-url',
      };

      newConfig = {
        displayType: 'AGGREGATED' as const,
        excludeStandardAssets: false,
        additionalAssets: [campAsset],
        asset: undefined,
        requestType: draftConfig.requestType,
      };
    } else if (targetPreset === 'camp_custom_token') {
      // Camp asset for CUSTOM_ASSET mode - use base asset without price
      newConfig = {
        displayType: 'CUSTOM_ASSET' as const,
        excludeStandardAssets: false,
        additionalAssets: [],
        asset: baseCampAsset,
        requestType: draftConfig.requestType,
      };
    }

    if (newConfig) {
      console.log(`Applying ${targetPreset} preset configuration:`, newConfig);

      // Check if the config is valid before proceeding
      const isValid = validateBalancesConfig(newConfig);
      console.log(`${targetPreset} config validation result:`, isValid);

      if (!isValid) {
        console.error(`${targetPreset} config is invalid!`);
        return;
      }

      setDraftConfig(newConfig);

      // Automatically call set and reload
      setTimeout(() => {
        console.log(`Updating global state with ${targetPreset} config`);
        updateState({
          balancesDisplayType: newConfig.displayType,
          balancesExcludeStandardAssets: newConfig.excludeStandardAssets,
          balancesAdditionalAssets: newConfig.additionalAssets,
          balancesAsset: newConfig.asset,
          balancesRequestType: newConfig.requestType ?? draftConfig.requestType,
        });

        // Store the preset and config in sessionStorage to avoid infinite reloads
        sessionStorage.setItem('lastReloadedBalancesConfig', JSON.stringify(newConfig));
        sessionStorage.setItem('lastReloadedBalancesPreset', targetPreset);
        window.location.reload();
      }, 100);
    }
  };

  const handleCampMainnetSetupCustom = () => {
    console.log('Setting up Camp Mainnet (custom token) preset');
    const targetPreset = 'camp_custom_token';
    setPreset(targetPreset);
    console.log('Preset set to:', targetPreset);
    // Apply configuration immediately with the target preset
    applyPresetConfigurationWithPreset(targetPreset);
  };

  const handleCampMainnetSetupAggregated = () => {
    console.log('Setting up Camp Mainnet (aggregated) preset');
    const targetPreset = 'camp_aggregated';
    setPreset(targetPreset);
    console.log('Preset set to:', targetPreset);
    // Apply configuration immediately with the target preset
    applyPresetConfigurationWithPreset(targetPreset);
  };

  const handleExcludeStandardAssetsChange = (excludeStandardAssets: boolean) => {
    if (effectiveDisplayType === 'AGGREGATED') {
      // Clear preset when user manually changes configuration
      setPreset(null);
      setDraftConfig(prev => ({
        ...prev,
        excludeStandardAssets,
      }));
    }
  };

  const addAdditionalAsset = () => {
    if (effectiveDisplayType === 'AGGREGATED') {
      // Clear preset when user manually changes configuration
      setPreset(null);
      const newAsset: CustomAsset = {
        name: '',
        symbol: '',
        priceUrl: 'https://',
        implementations: [{ contractAddress: '', network: 'ETHEREUM' }],
      };
      setDraftConfig(prev => ({
        ...prev,
        additionalAssets: [...(prev.additionalAssets || []), newAsset],
      }));
    }
  };

  const updateAdditionalAsset = (index: number, updates: Partial<CustomAsset>) => {
    if (effectiveDisplayType === 'AGGREGATED') {
      // Clear preset when user manually changes configuration
      setPreset(null);
      setDraftConfig(prev => {
        const updatedAssets = [...(prev.additionalAssets || [])];
        updatedAssets[index] = { ...updatedAssets[index], ...updates };
        return {
          ...prev,
          additionalAssets: updatedAssets,
        };
      });
    }
  };

  const removeAdditionalAsset = (index: number) => {
    if (effectiveDisplayType === 'AGGREGATED') {
      // Clear preset when user manually changes configuration
      setPreset(null);
      setDraftConfig(prev => ({
        ...prev,
        additionalAssets: (prev.additionalAssets || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateCustomAsset = (updates: Partial<CustomAsset>) => {
    if (effectiveDisplayType === 'CUSTOM_ASSET') {
      // Clear preset when user manually changes configuration
      setPreset(null);
      setDraftConfig(prev => ({
        ...prev,
        asset: { ...prev.asset, ...updates },
      }));
    }
  };

  // Check if the current draft configuration is valid
  const isConfigValid = validateBalancesConfig(draftConfig);

  // Determine button state and message
  const getButtonState = () => {
    if (!isConfigValid) {
      return { disabled: true, text: 'Configuration Invalid' };
    }
    if (!hasConfigChanged) {
      return { disabled: true, text: 'No Changes Made' };
    }
    return { disabled: false, text: 'Set and Reload' };
  };

  const buttonState = getButtonState();

  // Apply the draft configuration and reload the page
  const handleSetAndReload = () => {
    updateState({
      balancesDisplayType: draftConfig.displayType,
      balancesExcludeStandardAssets: draftConfig.excludeStandardAssets,
      balancesAdditionalAssets: draftConfig.additionalAssets,
      balancesAsset: draftConfig.asset,
      balancesRequestType: draftConfig.requestType,
    });

    // Store the draft config in sessionStorage to avoid infinite reloads
    sessionStorage.setItem('lastReloadedBalancesConfig', JSON.stringify(draftConfig));
    window.location.reload();
  };

  return (
    <CpslCard style={{ width: '100%' }}>
      <CpslText variant="headingXS" weight="semiBold">
        Balances Configuration
      </CpslText>

      <InnerContainer>
        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Quick Setup
          </CpslText>
          <FlexRow style={{ gap: '8px', flexWrap: 'wrap' }}>
            <CpslButton
              variant={isPresetActive('camp_aggregated') ? 'primary' : 'secondary'}
              onClick={handleCampMainnetSetupAggregated}
              disabled={isPresetActive('camp_aggregated')}
            >
              {isPresetActive('camp_aggregated') ? 'Camp Mainnet (aggregated) ✓' : 'Camp Mainnet (aggregated)'}
            </CpslButton>
            <CpslButton
              variant={isPresetActive('camp_custom_token') ? 'primary' : 'secondary'}
              onClick={handleCampMainnetSetupCustom}
              disabled={isPresetActive('camp_custom_token')}
            >
              {isPresetActive('camp_custom_token') ? 'Camp Mainnet (custom token) ✓' : 'Camp Mainnet (custom token)'}
            </CpslButton>
          </FlexRow>
        </LabelContainer>

        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Display Type
          </CpslText>
          <FlexRow>
            <CpslButton
              variant={effectiveDisplayType === 'AGGREGATED' ? 'primary' : 'secondary'}
              onClick={() => handleDisplayTypeChange('AGGREGATED')}
            >
              Aggregated
            </CpslButton>
            <CpslButton
              variant={effectiveDisplayType === 'CUSTOM_ASSET' ? 'primary' : 'secondary'}
              onClick={() => handleDisplayTypeChange('CUSTOM_ASSET')}
            >
              Custom Asset
            </CpslButton>
          </FlexRow>
        </LabelContainer>

        <LabelContainer>
          <CpslText variant="label" weight="semiBold">
            Request Type
          </CpslText>
          <select
            value={draftConfig.requestType}
            onChange={e => handleRequestTypeChange(e.target.value as 'MAINNET' | 'TESTNET' | 'MAINNET_AND_TESTNET')}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${mode === 'dark' ? '#6b7280' : '#ccc'}`,
              width: '100%',
              backgroundColor: mode === 'dark' ? '#374151' : 'white',
              color: mode === 'dark' ? 'white' : 'black',
            }}
          >
            <option value="MAINNET">Mainnet</option>
            <option value="TESTNET">Testnet</option>
            <option value="MAINNET_AND_TESTNET">Mainnet + Testnet</option>
          </select>
        </LabelContainer>

        {effectiveDisplayType === 'AGGREGATED' && (
          <AggregatedDisplay
            mode={mode}
            effectiveBalancesConfig={effectiveBalancesConfig}
            onExcludeStandardAssetsChange={handleExcludeStandardAssetsChange}
            onAddAdditionalAsset={addAdditionalAsset}
            onUpdateAdditionalAsset={updateAdditionalAsset}
            onRemoveAdditionalAsset={removeAdditionalAsset}
          />
        )}

        {effectiveDisplayType === 'CUSTOM_ASSET' && effectiveBalancesConfig.asset && (
          <CustomAssetDisplay
            mode={mode}
            effectiveBalancesConfig={effectiveBalancesConfig}
            onUpdateCustomAsset={updateCustomAsset}
          />
        )}

        {/* Set and Reload Button */}
        <LabelContainer style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--cpsl-color-border)' }}>
          <CpslButton
            variant="primary"
            onClick={handleSetAndReload}
            disabled={buttonState.disabled}
            style={{ width: '100%' }}
          >
            {buttonState.text}
          </CpslButton>
        </LabelContainer>
      </InnerContainer>
    </CpslCard>
  );
};

const InnerContainer = styled.div`
  flex-wrap: wrap;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const AssetCard = styled.div<{ mode: 'light' | 'dark' }>`
  border: 1px solid ${props => (props.mode === 'dark' ? '#374151' : '#e1e5e9')};
  border-radius: 8px;
  padding: 16px;
  background: ${props => (props.mode === 'dark' ? '#1f2937' : '#fafbfc')};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AssetHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
`;

const NetworkCard = styled.div<{ mode: 'light' | 'dark' }>`
  border: 1px solid ${props => (props.mode === 'dark' ? '#4b5563' : '#d1d5db')};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => (props.mode === 'dark' ? '#374151' : 'white')};
`;

const NetworkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const AdditionalAssetsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EmptyState = styled.div<{ mode: 'light' | 'dark' }>`
  text-align: center;
  padding: 24px;
  border: 2px dashed ${props => (props.mode === 'dark' ? '#6b7280' : '#d1d5db')};
  border-radius: 8px;
  background: ${props => (props.mode === 'dark' ? '#111827' : '#f9fafb')};
`;
