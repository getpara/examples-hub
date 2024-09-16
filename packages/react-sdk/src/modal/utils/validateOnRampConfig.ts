import { Network, OnRampAsset, OnRampConfig, OnRampProvider, SupportedOnRamps } from '@usecapsule/web-sdk';

export class OnRampConfigError extends Error {
  constructor(message) {
    super(`On-ramp configuration error: ${message}.`);
    this.name = 'OnRampConfigError';
  }
}

function checkHasProviders({ providers }: OnRampConfig) {
  if (!providers || providers.length < 1) {
    throw new OnRampConfigError('No providers are configured');
  }
}

function checkDuplicateProviders({ providers }: OnRampConfig) {
  providers.forEach(({ id: providerProp }, index) => {
    const provider = OnRampProvider[providerProp];
    if (providers.findIndex(p => OnRampProvider[p.id] === provider) !== index) {
      throw new OnRampConfigError(`Provider ${provider} is configured more than once`);
    }
  });
}

function checkUnsupportedCombos({ network: networkProp, asset: assetProp, providers }: OnRampConfig) {
  const [network, asset] = [Network[networkProp], OnRampAsset[assetProp]];
  if (!SupportedOnRamps[network]?.[asset]) {
    throw new Error(`Asset ${asset} does not exist on network ${network}`);
  }

  providers.forEach(({ id: providerProp }) => {
    const provider = OnRampProvider[providerProp];

    if (!SupportedOnRamps[network]?.[asset]?.[provider]) {
      throw new OnRampConfigError(`Provider ${provider} does not support buying ${asset} on ${network}`);
    }
  });
}

export function validateOnRampConfig(obj?: OnRampConfig): obj is OnRampConfig {
  if (!obj) {
    return false;
  }

  checkHasProviders(obj);
  checkDuplicateProviders(obj);
  checkUnsupportedCombos(obj);

  return true;
}
