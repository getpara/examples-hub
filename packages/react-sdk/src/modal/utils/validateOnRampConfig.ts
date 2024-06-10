import { OnRampAssetMap, OnRampConfig, OnRampConfigProvider } from '@usecapsule/web-sdk';

function hasDuplicateProviders(arr: OnRampConfigProvider[]) {
  return arr.reduce((res: boolean, obj, i) => {
    return res || arr.findIndex(({ id }) => id === obj.id) !== i;
  }, false);
}

export function validateOnRampConfig(obj?: OnRampConfig): obj is OnRampConfig {
  if (!obj) {
    return false;
  }

  if (
    !Object.keys(OnRampAssetMap).includes(obj.asset) ||
    !obj.providers ||
    obj.providers.length < 1 ||
    hasDuplicateProviders(obj.providers)
  ) {
    throw new Error('Invalid on-ramp configuration');
  }

  return true;
}
