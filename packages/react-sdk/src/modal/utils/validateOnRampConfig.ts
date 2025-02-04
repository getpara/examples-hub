import { OnRampConfig } from '@getpara/web-sdk';

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
  providers.forEach((id, index) => {
    if (providers.findIndex(p => p === id) !== index) {
      throw new OnRampConfigError(`Provider ${id} is configured more than once`);
    }
  });
}

export function validateOnRampConfig(obj?: OnRampConfig): obj is OnRampConfig {
  if (!obj) {
    return false;
  }

  checkHasProviders(obj);
  checkDuplicateProviders(obj);

  return true;
}
